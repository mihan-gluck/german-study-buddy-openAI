#!/bin/bash
# Deployment Script for German Study Buddy

echo "🚀 Deploying German Study Buddy..."

# Pull latest changes from GitHub
git pull origin main

# Install/update dependencies
npm install

# Build Angular application
echo "📦 Building Angular application..."
npm run build

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 restart german-study-buddy

# Check status
echo "📊 Application status:"
pm2 status

echo "✅ Deployment complete!"
echo "🌐 Your application should be live at: https://yourdomain.com"