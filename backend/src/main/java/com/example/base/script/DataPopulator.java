package com.example.base.script;

import com.example.base.entity.Category;
import com.example.base.entity.Recipe;
import com.example.base.repository.CategoryRepository;
import com.example.base.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * This script populates the database with sample recipe data
 * based on the DataSeeder.java file provided.
 */
@Component
public class DataPopulator implements CommandLineRunner {

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Only run if the database is empty
        if (recipeRepository.count() == 0) {
            System.out.println("Populating database with sample recipe data...");
            
            // Create categories if they don't exist
            Map<Long, String> categories = new HashMap<>();
            categories.put(1L, "Chicken Wings");
            categories.put(2L, "Pasta");
            categories.put(3L, "Steak");
            categories.put(4L, "Soup");
            
            for (Map.Entry<Long, String> entry : categories.entrySet()) {
                Long categoryId = entry.getKey();
                String categoryName = entry.getValue();
                
                Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
                if (!categoryOpt.isPresent()) {
                    Category category = new Category();
                    category.setCategoryId(categoryId);
                    category.setName(categoryName);
                    category.setDescription("Sample category for recipes");
                    category.setIsActive(true);
                    
                    // Set active dates - default to current date until one year from now
                    LocalDate today = LocalDate.now();
                    category.setActiveFrom(today);
                    category.setActiveUntil(today.plusYears(1));
                    
                    categoryRepository.save(category);
                    System.out.println("Created category: " + categoryName);
                }
            }
            
            // Week 1: Chicken Wing Recipes (categoryId = 1)
            addRecipe(
                "Lemon Pepper Chicken Wings",
                "Crispy wings with a tangy, zesty flavor.",
                1L,
                "https://drive.google.com/file/d/18ZZYqieC3lAlJX05cwmLF37AgypWs8FY/view?usp=share_link",
                "2 lbs chicken wings\n1 tbsp lemon zest\n2 tsp salt\n1 tsp black pepper",
                "Preheat oven to 425°F (220°C). Toss wings with lemon zest, salt, and pepper. Arrange on a baking sheet and bake for 35-40 minutes until crispy."
            );

            addRecipe(
                "Mango Habanero Chicken Wings",
                "Sweet and spicy wings with a tropical kick.",
                1L,
                "https://drive.google.com/file/d/14uJeYSDjH_QW6Lgn7a9Obx3BgiXeYmPX/view?usp=share_link",
                "2 lbs chicken wings\n1 cup mango puree\n2 tbsp habanero sauce\n1 tbsp honey",
                "Preheat oven to 400°F (200°C). Mix mango puree, habanero sauce, and honey. Toss wings in the mixture and bake for 35 minutes."
            );

            addRecipe(
                "Garlic Parmesan Chicken Wings",
                "Savory wings tossed in garlic butter and Parmesan cheese.",
                1L,
                "https://drive.google.com/file/d/1tVek4fepkZe4jcokFbnz5GjLSeNELDBa/view?usp=share_link",
                "2 lbs chicken wings\n4 garlic cloves, minced\n1/2 cup grated Parmesan cheese\n2 tbsp melted butter",
                "Preheat oven to 400°F (200°C). Toss wings in garlic and butter, sprinkle Parmesan on top, and bake for 35 minutes."
            );

            addRecipe(
                "BBQ Chicken Wings",
                "Classic smoky BBQ wings perfect for any gathering.",
                1L,
                "https://drive.google.com/file/d/11GAVQdX0w4o2_u5Zu6R8OwQN5IW-Wz_q/view?usp=share_link",
                "2 lbs chicken wings\n1 cup BBQ sauce\n1 tsp smoked paprika\nSalt and pepper to taste",
                "Preheat oven to 400°F (200°C). Season wings with salt, pepper, and paprika. Bake for 35 minutes, toss in BBQ sauce, then bake for an additional 5 minutes."
            );

            addRecipe(
                "Spicy Korean Chicken Wings",
                "Bold wings marinated in Korean chili paste and soy sauce.",
                1L,
                "https://drive.google.com/file/d/1CmBT-FitLoLvimzXdNn7OvOSokUPMFBJ/view?usp=share_link",
                "2 lbs chicken wings\n1/4 cup gochujang (Korean chili paste)\n2 tbsp soy sauce\n2 tbsp rice vinegar\n1 tbsp sesame oil",
                "Marinate wings in a mixture of gochujang, soy sauce, rice vinegar, and sesame oil for 2 hours. Bake at 400°F (200°C) for 35 minutes."
            );

            // Week 2: Pasta Recipes (categoryId = 2)
            addRecipe(
                "Shrimp Alfredo Pasta",
                "Creamy pasta with succulent shrimp in a rich Alfredo sauce.",
                2L,
                "https://drive.google.com/file/d/1D3Zdpxp1c25rKNv4liBzwBjEguVUxXD0/view?usp=share_link",
                "12 oz fettuccine pasta\n1 lb shrimp, peeled and deveined\n1 cup heavy cream\n1/2 cup grated Parmesan cheese\n2 tbsp butter\n2 garlic cloves, minced",
                "Cook pasta according to package directions. Sauté garlic in butter, add shrimp until pink. Stir in heavy cream and Parmesan cheese, then combine with pasta."
            );

            addRecipe(
                "Spaghetti Bolognese",
                "Traditional spaghetti with a hearty meat sauce.",
                2L,
                "https://drive.google.com/file/d/1SlGGdd81WHFc2NAUde-Xp_RQypyJg-HM/view?usp=share_link",
                "12 oz spaghetti\n1 lb ground beef\n1 onion, chopped\n2 garlic cloves, minced\n28 oz canned tomatoes\n1 tsp dried oregano\nSalt and pepper to taste",
                "Cook spaghetti until al dente. Brown ground beef with onion and garlic, add tomatoes and oregano, and simmer for 30 minutes. Serve sauce over spaghetti."
            );

            addRecipe(
                "Pesto Chicken Pasta",
                "Pasta tossed with basil pesto, grilled chicken, and sun-dried tomatoes.",
                2L,
                "https://drive.google.com/file/d/1F5zLQptpGKWJiQM5xdVj_Y2OyiBrNU2-/view?usp=share_link",
                "12 oz penne pasta\n2 chicken breasts, grilled and sliced\n1/2 cup basil pesto\n1/4 cup sun-dried tomatoes, chopped\n1/4 cup grated Parmesan cheese",
                "Cook pasta. Toss with sliced grilled chicken, basil pesto, sun-dried tomatoes, and Parmesan cheese."
            );

            addRecipe(
                "Penne Arrabbiata",
                "Spicy penne pasta in a zesty tomato and garlic sauce.",
                2L,
                "https://drive.google.com/file/d/11K43D2CWKao5FQ6YzbfHNhyYzDdGrnQi/view?usp=share_link",
                "12 oz penne pasta\n2 cups marinara sauce\n1 tsp red chili flakes\n2 garlic cloves, minced\nFresh basil for garnish",
                "Cook pasta until al dente. Sauté garlic with chili flakes, add marinara sauce and simmer for 15 minutes. Toss with pasta and garnish with basil."
            );

            addRecipe(
                "Fettuccine Carbonara",
                "Classic fettuccine with pancetta, eggs, and Pecorino Romano.",
                2L,
                "https://drive.google.com/file/d/1F4bQN7qSfRsydyAlPXvXRGmeN7R4NmeQ/view?usp=share_link",
                "12 oz fettuccine\n4 slices pancetta, chopped\n2 eggs\n1/2 cup grated Pecorino Romano cheese\nFreshly ground black pepper",
                "Cook fettuccine. Fry pancetta until crisp. Whisk eggs and cheese together. Off heat, toss pasta with pancetta and egg mixture, season with black pepper."
            );

            // Week 3: Steak Recipes (categoryId = 3)
            addRecipe(
                "Grilled Ribeye Steak with Garlic Butter",
                "Juicy ribeye steak topped with garlic butter and served with roasted asparagus.",
                3L,
                "https://drive.google.com/file/d/1J7KBEIoYB2gDJkL87xlmmYfxto5J3KmD/view?usp=share_link",
                "1.5 lbs ribeye steak\nSalt and pepper to taste\n2 tbsp olive oil\n2 tbsp butter\n2 garlic cloves, minced\n1 tsp fresh rosemary, chopped",
                "Season steak with salt and pepper. Grill over high heat until desired doneness. Melt butter with garlic and rosemary, drizzle over steak. Serve with roasted asparagus."
            );

            addRecipe(
                "Filet Mignon with Red Wine Sauce",
                "Tender filet mignon with a rich red wine reduction, served with mashed potatoes.",
                3L,
                "https://drive.google.com/file/d/1Fls7KuRXz087GGcWo7Vqu2mXpGdXn_CU/view?usp=share_link",
                "1 lb filet mignon\nSalt and pepper\n1 tbsp olive oil\n1/2 cup red wine\n1/4 cup beef broth\n1 tbsp butter",
                "Season filet mignon and sear in olive oil until medium-rare. Deglaze pan with red wine and beef broth, reduce sauce, and stir in butter. Serve with mashed potatoes."
            );

            addRecipe(
                "New York Strip Steak with Sautéed Mushrooms",
                "A classic strip steak paired with garlic-sautéed mushrooms and a side salad.",
                3L,
                "https://drive.google.com/file/d/1u44Kv4dVcSju_XlJ5UebyqLfljl_Mi3j/view?usp=share_link",
                "1 lb New York strip steak\nSalt and pepper\n1 tbsp olive oil\n1 cup mushrooms, sliced\n1 garlic clove, minced\n1 tbsp butter",
                "Season and sear the steak to your preference. Sauté mushrooms and garlic in butter. Serve steak with mushrooms and a side salad."
            );

            addRecipe(
                "T-Bone Steak with Roasted Vegetables",
                "Hearty T-bone steak served with a medley of roasted vegetables.",
                3L,
                "https://drive.google.com/file/d/1hwme0PV-Y94RfWN3k_vb4XSv3nSbjiMK/view?usp=share_link",
                "1 lb T-bone steak\nSalt and pepper\n2 tbsp olive oil\n1 cup mixed vegetables (carrots, bell peppers, zucchini), chopped\n1 tsp dried thyme",
                "Season steak and roast vegetables at 400°F (200°C) for 20-25 minutes. Grill steak to desired doneness and serve with the vegetables."
            );

            addRecipe(
                "Sirloin Steak with Creamy Mashed Potatoes",
                "Flavorful sirloin steak paired with creamy mashed potatoes and steamed broccoli.",
                3L,
                "https://drive.google.com/file/d/1jpDbZ7HGlLxE8CLDgY6P8eaTc8j9TpTk/view?usp=share_link",
                "1 lb sirloin steak\nSalt and pepper\n1 tbsp olive oil\n2 lbs potatoes, peeled and cubed\n1/2 cup milk\n2 tbsp butter\nSalt to taste",
                "Grill the sirloin steak to your liking. Boil potatoes until tender and mash with milk and butter. Serve steak with mashed potatoes and steamed broccoli."
            );

            // Week 4: Soup Recipes (categoryId = 4)
            addRecipe(
                "Classic Chicken Soup",
                "A comforting chicken soup filled with tender vegetables and noodles.",
                4L,
                "https://drive.google.com/file/d/1GRAJPvZ4JW-iuCbYXQ-UjBtioB4_lGrN/view?usp=share_link",
                "1 whole chicken (3 lbs)\n4 carrots, sliced\n3 celery stalks, sliced\n1 onion, quartered\n2 garlic cloves\nSalt and pepper\n10 cups water",
                "Place the chicken and vegetables in a large pot with water. Bring to a boil, then simmer for 2 hours. Remove the chicken, shred the meat, and return it to the broth. Season and serve."
            );

            addRecipe(
                "Hearty Beef Soup",
                "A robust beef soup with tender beef, potatoes, carrots, and tomatoes.",
                4L,
                "https://drive.google.com/file/d/1eFhWYliXAnSMrhFuvfzNjE97gnBcBjqH/view?usp=share_link",
                "1 lb beef stew meat\n3 potatoes, diced\n2 carrots, sliced\n2 celery stalks, sliced\n1 onion, chopped\n4 cups beef broth\n1 can diced tomatoes (14 oz)\nSalt, pepper, thyme",
                "Brown the beef in a pot. Add the vegetables, broth, and tomatoes, and simmer for 1.5 hours until the beef is tender."
            );

            addRecipe(
                "Creamy Shrimp Bisque",
                "A smooth and velvety bisque loaded with succulent shrimp and a touch of cream.",
                4L,
                "https://drive.google.com/file/d/1FHY4jrO3opxsk4nd3QNwOK-urYLxFHzR/view?usp=share_link",
                "1 lb shrimp, peeled and deveined\n1 tbsp butter\n1 onion, chopped\n2 garlic cloves, minced\n2 cups seafood stock\n1 cup heavy cream\n1/2 cup white wine\nSalt and pepper",
                "Sauté the onion and garlic in butter, then add shrimp until pink (remove shrimp temporarily). Add seafood stock, white wine, and cream; simmer and blend until smooth, then return shrimp to the bisque."
            );

            addRecipe(
                "Vegetable Soup",
                "A healthy and hearty soup filled with a variety of seasonal vegetables.",
                4L,
                "https://drive.google.com/file/d/1UVtGzMYJGDlToKXw8BWlRT53NCywuEPK/view?usp=share_link",
                "1 cup carrots, diced\n1 cup celery, diced\n1 cup green beans, chopped\n1 potato, diced\n1 onion, chopped\n4 cups vegetable broth\n1 can diced tomatoes (14 oz)\nSalt, pepper, basil",
                "Combine all ingredients in a large pot and simmer for 45 minutes until the vegetables are tender."
            );

            addRecipe(
                "Spicy Tomato Soup",
                "A zesty tomato soup with a hint of chili and smoked paprika.",
                4L,
                "https://drive.google.com/file/d/1eEFs_GbKxVBr6V4acZK70baQof5NKcUV/view?usp=share_link",
                "2 cans tomato puree (28 oz total)\n1 onion, chopped\n3 garlic cloves, minced\n1 cup vegetable broth\n1 tsp red chili flakes\n1 tsp smoked paprika\nSalt and pepper",
                "Sauté onion and garlic until soft, then add tomato puree, broth, chili flakes, and paprika. Simmer for 30 minutes and blend until smooth."
            );
            
            System.out.println("Database populated successfully with " + recipeRepository.count() + " recipes!");
        } else {
            System.out.println("Database already contains " + recipeRepository.count() + " recipes. Skipping population.");
        }
    }
    
    private void addRecipe(String title, String description, Long categoryId, String imageUrl, String ingredients, String instructions) {
        try {
            Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isPresent()) {
                Recipe recipe = new Recipe();
                recipe.setTitle(title);
                recipe.setDescription(description);
                recipe.setCategory(categoryOpt.get());
                recipe.setImageUrl(imageUrl);
                recipe.setIngredients(ingredients);
                recipe.setInstructions(instructions);
                recipe.setCreatedAt(LocalDateTime.now());
                
                recipeRepository.save(recipe);
                System.out.println("Added recipe: " + title);
            } else {
                System.out.println("Category not found for ID: " + categoryId);
            }
        } catch (Exception e) {
            System.out.println("Error adding recipe '" + title + "': " + e.getMessage());
        }
    }
} 