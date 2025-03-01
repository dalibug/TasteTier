# Spring Boot + React Full Stack Application

This project is a full-stack application with a Spring Boot backend and React frontend. The backend connects to a JawsDB MySQL database and provides a REST API for CRUD operations on test entities. The frontend is a React application that interacts with the backend API.

## Project Structure

```
project/
├── backend/                  # Spring Boot backend
│   ├── src/                  # Source code
│   │   ├── main/
│   │   │   ├── java/        # Java code
│   │   │   └── resources/   # Application properties
│   │   └── test/            # Test code
│   ├── build.gradle         # Gradle build file
│   └── gradlew              # Gradle wrapper
├── frontend/                 # React frontend
│   ├── public/              # Public assets
│   ├── src/                 # Source code
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styles
│   │   └── ...              # Other React files
│   ├── package.json         # NPM dependencies
│   └── ...                  # Other React config files
└── package.json             # Root package.json for running both apps
```

## Prerequisites

- Java 17 or higher
- Node.js and npm
- MySQL database (or JawsDB MySQL on Heroku)

## Configuration

### Backend Configuration

The backend is configured to connect to a JawsDB MySQL database. The configuration is in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://your-jawsdb-host:3306/your-database
spring.datasource.username=your-username
spring.datasource.password=your-password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.hikari.maximum-pool-size=5

spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8081
```

### Frontend Configuration

The frontend is configured to connect to the backend API at `http://localhost:8081`. If you change the backend port, you'll need to update the API URLs in `frontend/src/App.js`.

## Running the Application

### Running Both Frontend and Backend

From the root directory, run:

```bash
npm install
npm start
```

This will start both the backend and frontend concurrently.

### Running the Backend Only

From the `backend` directory, run:

```bash
./gradlew bootRun
```

The backend will start on port 8081.

### Running the Frontend Only

From the `frontend` directory, run:

```bash
npm install
npm start
```

The frontend will start on port 3000.

## API Endpoints

- `GET /api/test-entities`: Get all test entities
- `GET /api/test-entities/{id}`: Get a test entity by ID
- `POST /api/test-entities`: Create a new test entity
- `PUT /api/test-entities/{id}`: Update a test entity
- `DELETE /api/test-entities/{id}`: Delete a test entity
- `DELETE /api/test-entities`: Delete all test entities
- `GET /api/test-entities/test-connection`: Test the database connection
- `GET /db-test`: Test the database connection (alternative endpoint)

## Deployment

### Deploying to Heroku

1. Create a new Heroku app
2. Add JawsDB MySQL add-on
3. Set up environment variables for database connection
4. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.