# TasteTier API

This is a Spring Boot API for the TasteTier application that automates the population of the database with recipe data.

## Project Structure

- `src/main/java/com/example/base/api/config/DataSeeder.java`: Automatically populates the database with sample recipe data
- `src/main/java/com/example/base/api/model/Recipe.java`: Recipe entity model
- `src/main/java/com/example/base/api/repository/RecipeRepository.java`: JPA repository for Recipe entities
- `src/main/java/com/example/base/api/ApiApplication.java`: Main Spring Boot application class
- `src/main/resources/application.properties`: Application configuration

## Database

The application uses an H2 in-memory database which is populated with recipe data when the application starts.

## Recipe Categories

The seed data includes recipes for the following categories:
1. Chicken Wing Recipes (categoryId = 1)
2. Pasta Recipes (categoryId = 2)
3. Steak Recipes (categoryId = 3)
4. Soup Recipes (categoryId = 4)

## Usage

To run the application:

```bash
mvn spring-boot:run
```

Access the H2 console at: `http://localhost:8080/h2-console` with the following credentials:
- JDBC URL: `jdbc:h2:mem:tastetierdb`
- Username: `sa`
- Password: `password` 