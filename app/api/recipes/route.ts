import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add MONGODB_URI to your environment variables");
}

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

async function getDb() {
  const client = await clientPromise;
  return client.db("myonlinepantry");
}

/* ---------- SCHEMAS ---------- */
interface PantryItem {
  _id: string;
  item_name: string;
  date_Added: string;
}

interface UserDoc {
  firebaseUid: string;
  pantryItems?: PantryItem[];
}

interface RecipeSuggestion {
  id: string; // Index-based ID for routing
  title: string;
  markdownRecipe: string; // Full recipe in markdown format
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

/* ---------- GEMINI API CALL WITH RETRY ---------- */
async function getRecipeSuggestions(ingredients: string[], retryCount = 0): Promise<any> {
  const prompt = `
Based on these pantry ingredients: ${ingredients.join(", ")}, 
suggest exactly 5 recipes that can be made primarily with these ingredients. 
You can assume basic pantry staples like salt, pepper, oil, and water are available.

Return the response as a JSON object with this exact structure:
{
  "Recipe Name 1": "# Recipe Name 1\\n\\n## Ingredients\\n- ingredient 1\\n- ingredient 2\\n\\n## Instructions\\n1. Step 1\\n2. Step 2\\n\\n## Cooking Time\\n30 minutes\\n\\n## Difficulty\\nEasy",
  "Recipe Name 2": "# Recipe Name 2\\n\\n## Ingredients\\n- ingredient 1\\n- ingredient 2\\n\\n## Instructions\\n1. Step 1\\n2. Step 2\\n\\n## Cooking Time\\n45 minutes\\n\\n## Difficulty\\nMedium"
}

Each recipe should be detailed markdown including:
- Recipe title as h1
- Ingredients list with quantities
- Step-by-step instructions
- Cooking time
- Difficulty level
- Any cooking tips

Make sure it's valid JSON with proper escaped newlines in the markdown values.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Console log for debugging
    console.log("Gemini Raw Response:", generatedText);
    
    // Clean up the response to ensure it's valid JSON
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanedText);
      console.log("Gemini Parsed Response:", parsed);
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedText);
      throw new Error("Invalid JSON response from Gemini");
    }

  } catch (error) {
    console.error(`Gemini API attempt ${retryCount + 1} failed:`, error);
    
    // Retry up to 3 times
    if (retryCount < 2) {
      console.log(`Retrying Gemini API call... (${retryCount + 2}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return getRecipeSuggestions(ingredients, retryCount + 1);
    }
    
    throw new Error("Gemini API failed after 3 attempts");
  }
}

/* ---------- YOUTUBE API CALL ---------- */
async function getYouTubeVideo(recipeName: string): Promise<{videoId: string, title: string} | null> {
  try {
    const searchQuery = encodeURIComponent(`${recipeName} recipe cooking tutorial`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      console.error("YouTube API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        videoId: video.id.videoId,
        title: video.snippet.title
      };
    }
    
    return null;
  } catch (error) {
    console.error("YouTube API call failed:", error);
    return null;
  }
}

/* ---------- GET RECIPES ---------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<UserDoc>("users");

    // Get user's pantry items
    const user = await users.findOne({ firebaseUid: uid });
    if (!user || !user.pantryItems || user.pantryItems.length === 0) {
      return NextResponse.json({ 
        error: "No pantry items found. Add some ingredients to your pantry first." 
      }, { status: 404 });
    }

    // Extract ingredient names
    const ingredients = user.pantryItems.map(item => item.item_name);
    console.log("User ingredients:", ingredients);

    // Generate recipes with Gemini (with retry logic)
    const recipeSuggestions = await getRecipeSuggestions(ingredients);

    // Process each recipe and get YouTube videos
    const processedRecipes: RecipeSuggestion[] = [];
    let index = 0;
    
    for (const [dishName, markdownRecipe] of Object.entries(recipeSuggestions)) {
      console.log(`Processing recipe ${index + 1}: ${dishName}`);
      
      // Get YouTube video (don't retry if it fails)
      const youtubeData = await getYouTubeVideo(dishName);
      if (youtubeData) {
        console.log(`Found YouTube video for ${dishName}:`, youtubeData.title);
      } else {
        console.log(`No YouTube video found for ${dishName}`);
      }
      
      const recipeDoc: RecipeSuggestion = {
        id: index.toString(), // Use index for routing
        title: dishName,
        markdownRecipe: markdownRecipe as string,
        youtubeVideoId: youtubeData?.videoId,
        youtubeVideoTitle: youtubeData?.title,
      };
      
      processedRecipes.push(recipeDoc);
      index++;
    }

    console.log(`Successfully processed ${processedRecipes.length} recipes`);
    return NextResponse.json({ recipes: processedRecipes });

  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipes", details: (error as Error).message },
      { status: 500 }
    );
  }
}