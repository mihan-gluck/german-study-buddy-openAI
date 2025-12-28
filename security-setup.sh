#!/bin/bash
# Security Setup for AWS EC2

echo "🔒 Setting up security..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install fail2ban (protection against brute force)
sudo apt install fail2ban -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Secure MongoDB
sudo systemctl enable mongod

# Set up log rotation
sudo logrotate -d /etc/logrotate.conf

echo "✅ Security setup complete!"