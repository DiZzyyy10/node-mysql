# 🗄️ TaskFlow Database Configuration Guide

This guide will help you configure TaskFlow for different deployment environments, including your Raspberry Pi.

## 📋 Table of Contents
- [Quick Setup](#quick-setup)
- [Raspberry Pi Deployment](#raspberry-pi-deployment)
- [Environment Configurations](#environment-configurations)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Setup

### 1. Database Configuration Files

TaskFlow uses two main configuration files:
- `knexfile.js` - Database connection settings
- `db/knex.js` - Database client setup

### 2. Change Database Password

Edit the `knexfile.js` file and update the password in all environments:

```javascript
module.exports = {
  development: {
    client: "mysql",
    connection: {
      database: "todo_app",
      user: "root",
      password: "YOUR_NEW_PASSWORD_HERE", // Change this
    },
    // ... rest of config
  },
  
  production: {
    client: "mysql",
    connection: {
      database: "todo_app", 
      user: "root",
      password: "YOUR_NEW_PASSWORD_HERE", // Change this too
    },
    // ... rest of config
  }
};
```

## 🥧 Raspberry Pi Deployment

### Step 1: Install MySQL on Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install MySQL Server
sudo apt install mysql-server -y

# Secure MySQL installation
sudo mysql_secure_installation
```

### Step 2: Create Database and User

```bash
# Connect to MySQL as root
sudo mysql -u root -p

# Create database
CREATE DATABASE todo_app;

# Create a dedicated user (recommended for security)
CREATE USER 'taskflow_user'@'localhost' IDENTIFIED BY 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON todo_app.* TO 'taskflow_user'@'localhost';

# Flush privileges
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### Step 3: Update Configuration for Raspberry Pi

Update your `knexfile.js` for production:

```javascript
module.exports = {
  // ... development config ...
  
  production: {
    client: "mysql",
    connection: {
      host: "localhost",        // or your Pi's IP address
      port: 3306,
      database: "todo_app",
      user: "taskflow_user",    // Use dedicated user
      password: "your_secure_password",
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 10000,
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
  }
};
```

### Step 4: Set Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `.env` file in your project root:
```bash
# .env file
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_app
DB_USER=taskflow_user
DB_PASSWORD=your_secure_password
```

2. Update `knexfile.js` to use environment variables:
```javascript
require('dotenv').config();

module.exports = {
  development: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'todo_app',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
    },
    pool: { min: 2, max: 10 },
  },

  production: {
    client: "mysql", 
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: { min: 2, max: 10 },
  }
};
```

3. Install dotenv package:
```bash
npm install dotenv
```

### Step 5: Update Environment Selection

Update `db/knex.js` to use production environment:

```javascript
const environment = process.env.NODE_ENV || "development";
const config = require("../knexfile.js")[environment];
const knex = require("knex")(config);

module.exports = knex;
```

## 🌍 Environment Configurations

### Development (Local)
```bash
NODE_ENV=development
DB_PASSWORD=password
```

### Production (Raspberry Pi)
```bash
NODE_ENV=production
DB_HOST=localhost
DB_USER=taskflow_user
DB_PASSWORD=your_secure_password
```

### Remote Database
```bash
NODE_ENV=production
DB_HOST=192.168.1.100  # Your Pi's IP
DB_PORT=3306
DB_USER=taskflow_user
DB_PASSWORD=your_secure_password
```

## 🔒 Security Best Practices

### 1. Strong Passwords
- Use passwords with at least 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Avoid common passwords

### 2. Dedicated Database User
```sql
-- Don't use root for applications
CREATE USER 'taskflow_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON todo_app.* TO 'taskflow_user'@'localhost';
```

### 3. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Your app port
sudo ufw enable
```

### 4. Environment Variables
- Never commit `.env` files to version control
- Add `.env` to your `.gitignore`
- Use different passwords for different environments

## 🚀 Deployment Commands

### Initial Setup on Raspberry Pi
```bash
# Clone your repository
git clone https://github.com/DiZzyyy10/node-mysql.git
cd node-mysql

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Create .env file with your settings
nano .env

# Run database setup (if needed)
node setup-database.js

# Start with PM2
pm2 start bin/www --name "taskflow"
pm2 startup
pm2 save
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Restart application
pm2 restart taskflow
```

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test MySQL connection
mysql -u taskflow_user -p todo_app

# Check MySQL status
sudo systemctl status mysql

# Check logs
sudo tail -f /var/log/mysql/error.log
```

### Permission Issues
```sql
-- Check user privileges
SHOW GRANTS FOR 'taskflow_user'@'localhost';

-- Fix privileges if needed
GRANT ALL PRIVILEGES ON todo_app.* TO 'taskflow_user'@'localhost';
FLUSH PRIVILEGES;
```

### Port Issues
```bash
# Check if port 3000 is available
sudo netstat -tulpn | grep 3000

# Check if MySQL is running on 3306
sudo netstat -tulpn | grep 3306
```

### Memory Issues (Raspberry Pi)
```bash
# Increase swap space if needed
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile  # Change CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## 📝 Quick Reference

### Common Commands
```bash
# Start application
npm start

# Production mode
NODE_ENV=production npm start

# With PM2
pm2 start bin/www --name taskflow

# Check logs
pm2 logs taskflow

# Monitor
pm2 monit
```

### Database Commands
```sql
-- Show databases
SHOW DATABASES;

-- Use database
USE todo_app;

-- Show tables
SHOW TABLES;

-- Check table structure
DESCRIBE tasks;
DESCRIBE users;
```

---

🎉 **You're all set!** Your TaskFlow application should now be running securely on your Raspberry Pi with proper database configuration.

For additional help, check the main README.md or create an issue in the repository.
