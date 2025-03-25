```markdown
CST 438: Project 01 Retrospective Team 07

Project 02 Retrospective Hani Al Barkawi, Dalia Cabrera, Noah Mckegney, Alexandro Mora


Introduction
This project tested our ability to integrate new software without any prior knowledge or experience, however it was extremely satisfying once it all came together.
We communicated primarily through Slack and in person meetings.
We initially did not have a set number of stories, we simply added as the work progressed and that resulted in 18 github issues. In the end we completed 18 of the 18 issues.

Team Member Retrospectives

Alexandro Mora
I did the best work possible. My contributions were well received and used to build on.
○ What was your role / which stories did you work on
■ My role was primarily database integration
■ I worked creating the database and making sure that all of our team members
work was properly implemented in our working branch
○ How much time was spent working outside of class
■ I spent about 4 hours each week outside of class
○ What was the biggest challenge?
■ Getting OAuth to work with our database
○ Why was it a challenge?
■ I need to make sure that the security configuration would route the program properly even when making changes so that the routes remained intact
○ How was it addressed?
■ Through some judicious trial and error, lots of reading and working with Noah since he created our OAuth software.
○ Favorite / most interesting part of this project
■ Getting everything to come together and creating the UI
○ If you could do it over, what would you change?
■ I'd start sooner.
○ What is the most valuable thing you learned?
■ It's important to tackle one issue or error at a time instead of trying to fix
something in its entirety.

Dalia Cabrera Hurtado
My contributions were ...
○ What was your role / which stories did you work on
■ My role was to build the Recipe API. I worked on the stories related to creating,
reading, updating, and deleting recipes.
● Folder Structure and User Stories
○ api/controller (RecipeController): Handles HTTP requests (e.g., creating, updating, and deleting recipes).
○ api/model (Recipe): Defines the data structure (fields like name, description, ingredients, instructions, imageUrl) that addresses stories about the recipe’s content and details.
○ api/repository (RecipeRepository): Manages database operations (CRUD)
○ api/config (DataSeeder, DevSecurityConfig): DataSeeder seeds initial data, fulfilling any story requiring sample recipes for demonstration. DevSecurityConfig disables security in development, helping to test the user stories without dealing with OAuth locally.
○ How much time was spent working outside of class
■ Outside of class I spent a few hours every week on my portion of the project.
○ What was the biggest challenge?
■ The biggest challenge was working in tandem with my team.
○ Why was it a challenge?
■ It was a challenge because there were many moving parts in the project that
affected my work, such as shared configurations and overlapping dependencies.
○ How was it addressed?
■ I addressed this challenge by creating separate configuration files for development and production. I named them “application-dev.properties” (for local testing with an H2 database) and “application-prod.properties” (for production settings, such as MySQL on Heroku). Additionally, when the OAuth “SecurityConfig.java” file was interfering with my API work, I resolved the conflict by annotating it with “@Profile({"prod"})” and creating a dedicated
“DevSecurityConfig.java” file annotated with “@Profile({"dev"})” to disable
security for local testing.
○ Favorite / most interesting part of this project
■ My favorite part of this project was seeing it all come together.
○ If you could do it over, what would you change?
■ If I could do it over again, I would spend more time early on establishing clear communication and configuration guidelines with the team to reduce integration issues later in the project.
○ What is the most valuable thing you learned?
■ The most valuable thing I learned is how to design and implement a scalable API
that effectively integrates with different environments, and how to manage configuration and security for both development and production.

Noah Mckegney
My contributions were ...
○ What was your role / which stories did you work on
■ I was in charge of user signup using OAuth. The task involved integrating a
google OAuth application with spring boot, designing a user class to retain all the data related to the user tables in the database, populating a user object and serving it to an API post request when a user is prompted to login. I worked closely with Alexandro to manage merging OAuth with the branch containing the front and backend of our application.
○ How much time was spent working outside of class
■ I spend a few hours every weekend and on wednesdays.
○ What was the biggest challenge?
■ Understanding how to integrate the data I fetched from OAuth, and serve it in a
packaged form to the database.
○ Why was it a challenge?
■ I have never used OAuth or spring boot before, so I had no idea how to integrate the two and create something that could be inserted into our database.
○ How was it addressed?
■ I was running into a lot of complex solutions with how spring boot managed
security. I was just so overwhelmed with all the spring boot framework syntax, and nothing was working, so I decided to ignore all the tutorials and just try to build it myself. I use OOP concepts that I was familiar with to build it out. My solution is probably not as secure as using all the spring boot security stuff, but at least I could understand it.
○ Favorite / most interesting part of this project
■ Logging in with OAuth was a pretty big win. OAuth login is a very popular feature
in most apps, and I am happy that I got a bit of experience with it.
○ If you could do it over, what would you change?
■ Learning new software technologies can always be overwhelming. I would just remind myself that there are a lot of ways to do the same thing, and if something looks intimidatingly complex that it is probably just coated in error handling and its core function is very simple.
○ What is the most valuable thing you learned?
■ After working on this project I think I understand the components that go into
building a full stack application a lot better. I am super inspired to try and use what I have learned to build a web application on my own.

Hani Al Barkawi
I shared responsibility with Alex to design and implement the database along with the interface and project structure like heroku setup.
● What was your role / which stories did you work on
○ The initial setup of the project was set up by me in the db config branch which separates
the frontend and backend in different folders, as well as having the database hosted on
heroku.
● How much time was spent working outside of class
○ I spent on average 3 hours a day, but it’s usually 5-6 hours or none a day
● What was the biggest challenge?
○ Having docker work every time I wanted to work on the project for some reason is always a struggle, the inconsistency after changes made for some reason breaks the build with docker.
● Why was it a challenge?
○ Because nearly every time I wanted to work on the project I had to fix before starting to
implement anything new
● How was it addressed?
○ Each time it would be a different issue that needed fixing.
● Favorite / most interesting part of this project
○ Learning about heroku, I could definitely use this service for future projects.
● If you could do it over, what would you change?
○ First week was challenging. I set up an aws server and wasted time going down that route. I should’ve started earlier now that I know how simple heroku is.
● What is the most valuable thing you learned?
○ On a personal level I learned to have more composure,but overall this helped shape for
me the “full stack” development process in a more clear way.

Conclusions
How successful was the project?
In that we were able to successfully meet all of the requirements of both the prompt and the tasks we set ourselves, and looked good doing it, we all agree it was a rousing 95.5% success.
What was the largest victory?
Our largest victory was getting OAuth to work and having it not break our routes when we deployed to Heroku.
Final assessment of the project
This project not only met our technical requirements but also provided a significant learning opportunity for all team members. We now have a clearer understanding of the full stack development process, which will serve as a solid foundation for future projects.
```
