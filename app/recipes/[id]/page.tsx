'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';

interface RecipeSuggestion {
  id: string;
  title: string;
  markdownRecipe: string;
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const recipeId = params.id as string;
    
    // Load recipe from sessionStorage
    const cachedRecipes = sessionStorage.getItem('pantry-recipes');
    
    if (!cachedRecipes) {
      setError("No recipes found. Please generate recipes first.");
      setLoading(false);
      return;
    }

    try {
      const recipes: RecipeSuggestion[] = JSON.parse(cachedRecipes);
      const foundRecipe = recipes.find(r => r.id === recipeId);
      
      if (!foundRecipe) {
        setError("Recipe not found.");
        setLoading(false);
        return;
      }

      setRecipe(foundRecipe);
      setLoading(false);
    } catch (e) {
      console.error("Failed to parse cached recipes:", e);
      setError("Failed to load recipe data.");
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-main"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
        <div className="flex gap-3">
          <Link 
            href="/recipes"
            className="bg-[#254635] text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Back to Recipes
          </Link>
          <Link 
            href="/home"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-main">{recipe.title}</h1>
        <div className="flex gap-3">
          <Link 
            href="/recipes"
            className="bg-[#254635] text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Recipes
          </Link>
          <Link 
            href="/home"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>

      {/* YouTube Video */}
      {recipe.youtubeVideoId && (
        <div className="mb-8">
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Cooking Video</h2>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${recipe.youtubeVideoId}`}
                title={recipe.youtubeVideoTitle || recipe.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {recipe.youtubeVideoTitle && (
              <p className="text-sm text-gray-600 mt-2">
                Video: {recipe.youtubeVideoTitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recipe Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="recipe-content">
          <ReactMarkdown 
            components={{
              h1: ({children}) => (
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-3">
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                  {children}
                </h3>
              ),
              ul: ({children}) => (
                <ul className="list-disc list-inside mb-4 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({children}) => (
                <ol className="list-decimal list-inside mb-4 space-y-1">
                  {children}
                </ol>
              ),
              li: ({children}) => (
                <li className="text-gray-700">
                  {children}
                </li>
              ),
              p: ({children}) => (
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {children}
                </p>
              ),
              strong: ({children}) => (
                <strong className="font-semibold text-gray-800">
                  {children}
                </strong>
              ),
            }}
          >
            {recipe.markdownRecipe}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex justify-center">
        <Link 
          href="/recipes"
          className="bg-[#254635] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          ← Back to All Recipes
        </Link>
      </div>
    </div>
  );
}