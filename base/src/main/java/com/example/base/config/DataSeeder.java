package com.example.base.config;

import com.example.base.model.Recipe;
import com.example.base.repository.RecipeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DataSeeder populates the database with sample recipes on application startup.
 * This is useful for testing and demonstration purposes.
 */
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedDatabase(RecipeRepository recipeRepository) {
        return args -> {
            // Category 1 Recipes
            recipeRepository.save(new Recipe("Spaghetti Carbonara", "Classic Italian pasta with eggs, cheese, pancetta, and pepper.", 1));
            recipeRepository.save(new Recipe("Fettuccine Alfredo", "Creamy pasta dish with butter, heavy cream, and parmesan cheese.", 1));
            recipeRepository.save(new Recipe("Penne Arrabbiata", "Pasta with spicy tomato sauce and garlic.", 1));
            // (Add 2-3 more recipes for category 1)

            // Category 2 Recipes
            recipeRepository.save(new Recipe("Margherita Pizza", "Traditional Neapolitan pizza with tomato, mozzarella, and basil.", 2));
            recipeRepository.save(new Recipe("Pepperoni Pizza", "Pizza topped with pepperoni slices and mozzarella.", 2));
            recipeRepository.save(new Recipe("BBQ Chicken Pizza", "Pizza with BBQ sauce, chicken, red onions, and cilantro.", 2));
            // (Add 2-3 more recipes for category 2)
        };
    }
}
