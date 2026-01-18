#!/bin/bash

# EC2 Deployment Script
# This script builds and deploys the Angular app in production mode

echo "🚀 Starting EC2 Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git pull successful${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Build Angular app in production mode
echo -e "${YELLOW}🔨 Building Angular app in production mode...${NC}"
ng build --configuration production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Angular build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Angular build successful${NC}"

# Step 4: Restart backend
echo -e "${YELLOW}🔄 Restarting backend...${NC}"
pm2 restart all

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend restart failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend restarted${NC}"

# Step 5: Restart Nginx
echo -e "${YELLOW}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx restart failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nginx restarted${NC}"

# Step 6: Show status
echo -e "${YELLOW}📊 Checking status...${NC}"
echo ""
echo "Backend Status:"
pm2 status
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l
echo ""

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open your browser and go to your EC2 domain"
echo "2. Login and test the Create Zoom Meeting page"
echo "3. Check if students load correctly"
echo ""
echo "If issues persist, check logs:"
echo "  - Backend logs: pm2 logs"
echo "  - Nginx logs: sudo tail -f /var/log/nginx/error.log"
