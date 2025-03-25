# CST 438: Project 01 Retrospective – Team 07  
**Mar 19, 2025**  
**Dr. Drew A. Clinkenbeard**  

---

## Project 02 Retrospective  
**Team Members:**  
- Hani Al Barkawi  
- Dalia Cabrera  
- Noah Mckegney  
- Alexandro Mora  

---

## Introduction

This project tested our ability to integrate new software without any prior knowledge or experience. The process was extremely satisfying once everything came together. We communicated primarily through Slack and in-person meetings. Although we did not initially have a set number of stories, we added them as the work progressed, resulting in 18 GitHub issues, all of which were completed.

---

## Team Member Retrospectives

### Alexandro Mora

- **Role / Stories:**  
  - Primarily responsible for database integration.  
  - Created the database and ensured that all team members' work was properly merged into our working branch.

- **Time Spent Outside of Class:**  
  - Approximately 4 hours per week.

- **Biggest Challenge:**  
  - Getting OAuth to work with our database.

- **Why It Was a Challenge:**  
  - Needed to ensure that the security configuration would correctly route the program even when changes were made so that the routes remained intact.

- **How It Was Addressed:**  
  - Through trial and error, extensive reading, and collaborating with Noah (who developed our OAuth software).

- **Favorite/Most Interesting Part:**  
  - Seeing everything come together and creating the UI.

- **If You Could Do It Over:**  
  - Start sooner.

- **Most Valuable Lesson Learned:**  
  - Tackling one issue at a time is more effective than trying to fix everything at once.

---

### Dalia Cabrera Hurtado

- **Role / Stories:**  
  - Built the Recipe API.  
  - Worked on stories related to creating, reading, updating, and deleting recipes.

- **Folder Structure and User Stories:**
  - **api/controller (RecipeController):** Handles HTTP requests (e.g., creating, updating, deleting recipes).
  - **api/model (Recipe):** Defines the data structure (fields like name, description, ingredients, instructions, imageUrl) for the recipe’s content and details.
  - **api/repository (RecipeRepository):** Manages database operations (CRUD).
  - **api/config (DataSeeder, DevSecurityConfig):**  
    - *DataSeeder* seeds initial data, fulfilling stories requiring sample recipes for demonstration.  
    - *DevSecurityConfig* disables security in development, enabling testing of user stories without dealing with OAuth locally.

- **Time Spent Outside of Class:**  
  - A few hours each week.

- **Biggest Challenge:**  
  - Coordinating work in tandem with the team due to shared configurations and overlapping dependencies.

- **How It Was Addressed:**  
  - Created separate configuration files for development (`application-dev.properties` with H2) and production (`application-prod.properties` with MySQL on Heroku).  
  - Resolved OAuth conflicts by annotating `SecurityConfig.java` with `@Profile({"prod"})` and creating a dedicated `DevSecurityConfig.java` annotated with `@Profile({"dev"})`.

- **Favorite/Most Interesting Part:**  
  - Seeing the project come together.

- **If You Could Do It Over:**  
  - Spend more time early on establishing clear communication and configuration guidelines.

- **Most Valuable Lesson Learned:**  
  - Designing and implementing a scalable API that integrates with different environments and managing configuration and security for both development and production.

---

### Noah Mckegney

- **Role / Stories:**  
  - In charge of user signup using OAuth.  
  - Integrated a Google OAuth application with Spring Boot, designed a user class for handling user data, and implemented an API post request for login.  
  - Collaborated closely with Alexandro to merge OAuth with the branch containing the front and backend.

- **Time Spent Outside of Class:**  
  - A few hours every weekend and on Wednesdays.

- **Biggest Challenge:**  
  - Integrating and packaging the data fetched from OAuth to serve it in a format suitable for the database.

- **Why It Was a Challenge:**  
  - Lack of prior experience with OAuth and Spring Boot, leading to uncertainty in integrating the two.

- **How It Was Addressed:**  
  - After trying various complex solutions with Spring Boot’s security, decided to simplify the approach by leveraging familiar OOP concepts and building a custom solution (acknowledging that it might not be as secure as the Spring Boot security defaults).

- **Favorite/Most Interesting Part:**  
  - Successfully implementing OAuth login.

- **If You Could Do It Over:**  
  - Remind myself that many solutions exist for the same problem and not to be overwhelmed by initial complexity.

- **Most Valuable Lesson Learned:**  
  - Gained a deeper understanding of the components involved in building a full-stack application, inspiring future personal web application projects.

---

### Hani Al Barkawi

- **Role / Stories:**  
  - Shared responsibility with Alexandro to design and implement the database along with the project structure and Heroku setup.
  - Set up the initial project configuration in the `db config` branch, separating the frontend and backend into different folders, and hosting the database on Heroku.

- **Time Spent Outside of Class:**  
  - On average, 3 hours per day (sometimes 5–6 hours, sometimes none).

- **Biggest Challenge:**  
  - Getting Docker to work consistently; changes often broke the Docker build.

- **Why It Was a Challenge:**  
  - Frequent fixes were needed each time work on the project resumed.

- **How It Was Addressed:**  
  - Resolved issues on a case-by-case basis as they arose.

- **Favorite/Most Interesting Part:**  
  - Learning about Heroku and its deployment process.

- **If You Could Do It Over:**  
  - Start earlier; avoided time wasted on setting up an AWS server when Heroku would have sufficed.

- **Most Valuable Lesson Learned:**  
  - Learned to maintain composure under pressure and gained a clearer understanding of the full-stack development process.

---

## Conclusions

- **Overall Success:**  
  We successfully met all project requirements and achieved a 95.5% success rate based on our self-assessment.

- **Largest Victory:**  
  Getting OAuth to work without breaking our routes upon deployment to Heroku.

- **Final Assessment:**  
  The project not only met our technical requirements but also provided significant learning opportunities. It gave all team members a clearer understanding of the full-stack development process, which will serve as a solid foundation for future projects.

