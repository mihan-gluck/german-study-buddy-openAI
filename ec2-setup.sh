#!/bin/bash
# EC2 Setup Script for Auto-Deploy
# Run this on your EC2 instance (one-time setup)

echo "🚀 Setting up EC2 for auto-deployment..."
echo "=========================================="

# Navigate to home directory
cd ~

# Check if repo already exists
if [ -d "Updated-Gluck-Portal" ]; then
    echo "✅ Repository already exists"
    cd Updated-Gluck-Portal
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/GluckSL/Updated-Gluck-Portal.git
    cd Updated-Gluck-Portal
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "Please create .env file with your credentials:"
    echo "nano .env"
    echo ""
    echo "Required variables:"
    echo "- MONGO_URI"
    echo "- JWT_SECRET"
    echo "- EMAIL_HOST=smtp.gmail.com"
    echo "- EMAIL_PORT=587"
    echo "- EMAIL_USER"
    echo "- EMAIL_PASS"
    echo "- ZOOM credentials"
    echo "- Monday.com credentials"
else
    echo "✅ .env file exists"
fi

# Build Angular frontend (Angular 19 syntax)
echo "🔨 Building Angular frontend..."
npm run build -- --configuration production

# Stop existing PM2 process if running
pm2 stop germanbuddy-backend 2>/dev/null || true

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
pm2 start app.js --name "germanbuddy-backend"

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
echo "🔧 Setting up PM2 startup..."
pm2 startup

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🎯 Next steps:"
echo "1. If .env file doesn't exist, create it: nano .env"
echo "2. Run the PM2 startup command shown above (if any)"
echo "3. Test auto-deploy by pushing to GitHub"
echo ""
echo "🔍 Useful commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs germanbuddy-backend"
echo "- Restart: pm2 restart germanbuddy-backend"
echo ""
