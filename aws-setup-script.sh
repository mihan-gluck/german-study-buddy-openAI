#!/bin/bash
# AWS EC2 Setup Script for German Study Buddy

echo "🚀 Setting up German Study Buddy on AWS EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt install -y git nginx certbot python3-certbot-nginx pm2 -g

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installations
echo "📋 Installation Verification:"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Git version: $(git --version)"
echo "Nginx version: $(nginx -v)"
echo "MongoDB status: $(sudo systemctl is-active mongod)"

echo "✅ Server setup complete!"