#!/bin/bash

# Heroku deployment script for TasteTier backend

# Step 1: Install Heroku CLI if not already installed
if ! command -v heroku &> /dev/null; then
    echo "Heroku CLI not found, installing..."
    brew tap heroku/brew && brew install heroku
fi

# Step 2: Login to Heroku
echo "Logging in to Heroku..."
heroku login

# Step 3: Create a Heroku app if it doesn't exist
if [ -z "$1" ]; then
    echo "Usage: ./deploy-to-heroku.sh <app-name>"
    echo "Please provide a name for your Heroku app"
    exit 1
fi

APP_NAME=$1
heroku apps:info "$APP_NAME" &> /dev/null
if [ $? -ne 0 ]; then
    echo "Creating Heroku app: $APP_NAME"
    heroku create "$APP_NAME"
else
    echo "Using existing Heroku app: $APP_NAME"
fi

# Step 4: Add JawsDB MySQL add-on
echo "Adding JawsDB MySQL add-on..."
heroku addons:create jawsdb:kitefin --app "$APP_NAME" || echo "JawsDB MySQL add-on already exists or could not be created"

# Step 5: Set necessary environment variables
echo "Setting environment variables..."
heroku config:set SPRING_PROFILES_ACTIVE=prod --app "$APP_NAME"
heroku config:set GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" --app "$APP_NAME"
heroku config:set GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET" --app "$APP_NAME"
heroku config:set OAUTH_REDIRECT_URI="https://$APP_NAME.herokuapp.com/login/oauth2/code/google" --app "$APP_NAME"
heroku config:set ALLOWED_ORIGINS="https://YOUR_FRONTEND_URL.com" --app "$APP_NAME"

# Step 6: Build the application
echo "Building application..."
./gradlew clean build

# Step 7: Deploy to Heroku
echo "Deploying to Heroku..."
git subtree push --prefix backend heroku main

echo "Deployment complete! Your application should be running at: https://$APP_NAME.herokuapp.com"
echo "Check the logs with: heroku logs --tail --app $APP_NAME" 