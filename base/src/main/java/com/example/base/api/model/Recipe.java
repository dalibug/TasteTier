package com.example.base.api.model;

import jakarta.persistence.*;

/**
 * Recipe represents an entity that maps to the "recipes" table in the database.
 * It corresponds to the schema:
 *   CREATE TABLE recipes (
 *     recipe_id INT AUTO_INCREMENT PRIMARY KEY,
 *     name VARCHAR(255) NOT NULL,
 *     description TEXT,
 *     category_id INT NOT NULL,
 *     image_url VARCHAR(255)  -- New column for image URL
 *   );
 */
@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recipeId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int categoryId;

    // Stores the URL of the recipe's image.
    @Column(name = "image_url")
    private String imageUrl;

    //detailed list of ingredients with measurements.
    @Column(columnDefinition = "TEXT")
    private String ingredients;

    //cooking instructions
    @Column(columnDefinition = "TEXT")
    private String instructions;

    // Constructors
    public Recipe() {}

    // Updated constructor that includes imageUrl
    public Recipe(String name, String description, int categoryId, String imageUrl, String ingredients, String instructions) {
        this.name = name;
        this.description = description;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
        this.ingredients = ingredients;
        this.instructions = instructions;
    }

    // Getters and Setters
    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
