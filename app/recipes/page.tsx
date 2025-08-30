'use client';
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface RecipeSuggestion {
  id: string;
  title: string;
  markdownRecipe: string;
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recipes from sessionStorage or API
  const loadRecipes = async (forceRefresh = false) => {
    if (!user) return;

    // Check sessionStorage first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedRecipes = sessionStorage.getItem('pantry-recipes');
      if (cachedRecipes) {
        try {
          const parsed = JSON.parse(cachedRecipes);
          setRecipes(parsed);
          console.log("Loaded recipes from sessionStorage");
          return;
        } catch (e) {
          console.error("Failed to parse cached recipes:", e);
          sessionStorage.removeItem('pantry-recipes');
        }
      }
    }

    // Fetch fresh recipes from API
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching fresh recipes from API...");
      const response = await fetch(`/api/recipes?uid=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recipes');
      }

      setRecipes(data.recipes);
      
      // Store in sessionStorage
      sessionStorage.setItem('pantry-recipes', JSON.stringify(data.recipes));
      console.log("Recipes fetched and cached successfully");

    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, [user]);

  // Force refresh recipes
  const handleRefresh = () => {
    sessionStorage.removeItem('pantry-recipes');
    loadRecipes(true);
  };

  if (!user) {
    return (
      <div className="text-center mt-10">
        Please log in to get recipe suggestions.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-main">Recipe Suggestions</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Refresh"}
          </button>
          <Link 
            href="/home"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-main"></div>
          <p className="mt-4 text-gray-600">
            Generating personalized recipes from your pantry items...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few moments as we analyze your ingredients and find cooking videos.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => loadRecipes(true)}
            className="ml-4 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recipe Cards */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, index) => (
            <Link 
              key={recipe.id} 
              href={`/recipes/${recipe.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border hover:border-main">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  {recipe.title}
                </h2>
                
                {/* Video indicator */}
                {recipe.youtubeVideoId && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Video available
                  </div>
                )}
                
                {/* Recipe preview */}
                <div className="text-gray-600 text-sm">
                  <p className="line-clamp-3">
                    {recipe.markdownRecipe.split('\n').find(line => 
                      line.includes('##') && !line.includes('# ')
                    )?.replace(/##/g, '').trim() || 'Click to view full recipe'}
                  </p>
                </div>
                
                <div className="mt-4 text-main font-medium">
                  View Recipe →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            No recipes generated yet. Make sure you have items in your pantry!
          </p>
          <Link 
            href="/pantry"
            className="bg-main text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Manage Pantry
          </Link>
        </div>
      )}
    </div>
  );
}