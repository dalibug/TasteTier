# Deploying TasteTier Backend to Heroku

This guide will help you deploy the TasteTier backend application to Heroku.

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Git installed
- A Heroku account
- Java 17 installed locally

## Option 1: Using the Deployment Script

1. Make sure the deployment script is executable:
   ```
   chmod +x deploy-to-heroku.sh
   ```

2. Run the deployment script with your desired app name:
   ```
   ./deploy-to-heroku.sh your-app-name
   ```

3. The script will:
   - Log you into Heroku
   - Create a new Heroku app (if it doesn't exist)
   - Add the JawsDB MySQL add-on
   - Set up necessary environment variables
   - Build and deploy the application

4. After deployment, update your frontend to use the new backend URL.

## Option 2: Manual Deployment

### 1. Create a Heroku App

```
heroku login
heroku create your-app-name
```

### 2. Add a Database

```
heroku addons:create jawsdb:kitefin --app your-app-name
```

### 3. Configure Environment Variables

```
heroku config:set SPRING_PROFILES_ACTIVE=prod --app your-app-name
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id" --app your-app-name
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret" --app your-app-name
heroku config:set OAUTH_REDIRECT_URI="https://your-app-name.herokuapp.com/login/oauth2/code/google" --app your-app-name
heroku config:set ALLOWED_ORIGINS="https://your-frontend-url.com" --app your-app-name
```

### 4. Build the Application

```
./gradlew clean build
```

### 5. Deploy to Heroku

If your backend is in a subdirectory of your git repository:

```
git subtree push --prefix backend heroku main
```

If your backend is the root of your git repository:

```
git push heroku main
```

## Verifying Deployment

1. Check if the application is running:
   ```
   heroku open --app your-app-name
   ```

2. Check the logs:
   ```
   heroku logs --tail --app your-app-name
   ```

## Common Issues and Solutions

### Database Connection Issues

If you encounter database connection issues, verify your JawsDB configuration:

```
heroku config:get JAWSDB_URL --app your-app-name
```

### Out of Memory Errors

If your application crashes due to memory issues, you might need to upgrade your Heroku dyno:

```
heroku ps:resize web=standard-1x --app your-app-name
```

### Other Issues

For other Heroku-specific issues, refer to the [Heroku Troubleshooting Guide](https://devcenter.heroku.com/categories/troubleshooting). 