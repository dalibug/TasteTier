import api from './api';

const RecipeService = {
  // Get all recipes
  getAllRecipes: () => {
    return api.get('/recipes');
  },

  // Get recipe by ID
  getRecipeById: (recipeId) => {
    return api.get(`/recipes/${recipeId}`);
  },

  // Get recipes by category ID
  getRecipesByCategory: (categoryId) => {
    return api.get(`/recipes/category/${categoryId}`);
  },

  // Get recipes by multiple category IDs
  getRecipesByCategories: (categoryIds) => {
    return api.post('/recipes/categories', { categoryIds });
  },

  // Search recipes by name
  searchRecipes: (query) => {
    return api.get(`/recipes/search?query=${encodeURIComponent(query)}`);
  },

  // Create a new recipe (admin only)
  createRecipe: (recipeData) => {
    return api.post('/recipes', recipeData);
  },

  // Update a recipe (admin only)
  updateRecipe: (recipeId, recipeData) => {
    return api.put(`/recipes/${recipeId}`, recipeData);
  },

  // Delete a recipe (admin only)
  deleteRecipe: (recipeId) => {
    return api.delete(`/recipes/${recipeId}`);
  },

  // Get popular recipes
  getPopularRecipes: () => {
    return api.get('/recipes/popular');
  },

  // Get recent recipes
  getRecentRecipes: () => {
    return api.get('/recipes/recent');
  }
};

export default RecipeService; 