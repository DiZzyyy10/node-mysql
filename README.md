# 🚀 TaskFlow - Modern Task Management Application

A beautiful, modern task management application built with Node.js, Express, and MySQL. Features a responsive design with both List and Kanban board views, internationalization support (English/Japanese), and a sleek glassmorphism UI.

![TaskFlow Preview](https://img.shields.io/badge/TaskFlow-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Beautiful frosted glass effects with modern aesthetics
- **Dark/Light Mode**: Seamless theme switching with full background coverage
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Smooth Animations**: Polished micro-interactions and transitions

### 📋 **Task Management**
- **Dual View Modes**: Switch between List view and Kanban board
- **Priority System**: High, Medium, Low priority with color coding
- **Due Dates**: Set and track task deadlines with visual indicators
- **Drag & Drop**: Intuitive Kanban board with drag-and-drop functionality
- **Real-time Updates**: Instant task status updates

### 🔍 **Advanced Features**
- **Smart Search**: Real-time task search across all fields
- **Multi-Filter System**: Filter by priority, status, and due dates
- **Status Tracking**: Todo, In Progress, and Done states
- **Bulk Operations**: Clear filters and manage multiple tasks

### 🌐 **Internationalization**
- **Bilingual Support**: Full English and Japanese localization
- **Language Persistence**: Remembers user language preference
- **Right-to-Left Ready**: Prepared for additional language support

### 🔐 **Security & Authentication**
- **User Authentication**: Secure signup/signin system
- **Environment Variables**: Secure credential management
- **Session Management**: Secure user sessions
- **Production Ready**: Proper security configurations

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Knex.js ORM
- **Frontend**: Bootstrap 5, Modern CSS, Vanilla JavaScript
- **Authentication**: Express Sessions, bcrypt
- **Internationalization**: i18n middleware
- **Development**: dotenv, nodemon

## 📦 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/DiZzyyy10/node-mysql.git
cd node-mysql
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create MySQL Database
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE todo_app;

-- Create user (optional, for better security)
CREATE USER 'taskflow_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON todo_app.* TO 'taskflow_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

Update your `.env` file:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_app
DB_USER=root
DB_PASSWORD=your_mysql_password_here
NODE_ENV=development
PORT=3000
```

### 4. Create Database Tables

Since this application doesn't use migrations, you need to create the tables manually:

```sql
-- Connect to your database
mysql -u root -p todo_app

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  due_date DATE NULL,
  completed BOOLEAN DEFAULT FALSE,
  status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
  order_position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_priority (user_id, priority)
);

-- Exit MySQL
EXIT;
```

### 5. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to access TaskFlow!

## 🖥️ Raspberry Pi Deployment

### Quick Raspberry Pi Setup

1. **Update your Raspberry Pi**:
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MySQL**:
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

4. **Clone and setup TaskFlow**:
```bash
git clone https://github.com/DiZzyyy10/node-mysql.git
cd node-mysql
npm install
cp .env.example .env
nano .env  # Update with your credentials
```

5. **Setup database**:
```bash
sudo mysql -u root -p
> CREATE DATABASE todo_app;
> CREATE USER 'taskflow'@'localhost' IDENTIFIED BY 'raspberry_password';
> GRANT ALL PRIVILEGES ON todo_app.* TO 'taskflow'@'localhost';
> FLUSH PRIVILEGES;

> USE todo_app;

> CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

> CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE NULL,
    completed BOOLEAN DEFAULT FALSE,
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    order_position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_priority (user_id, priority)
  );

> EXIT;
```

6. **Run TaskFlow**:
```bash
npm start
```

### Auto-start on Boot (Raspberry Pi)

Create a systemd service:
```bash
sudo nano /etc/systemd/system/taskflow.service
```

Add this content:
```ini
[Unit]
Description=TaskFlow Task Management App
After=network.target mysql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/node-mysql
ExecStart=/usr/bin/node bin/www
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable taskflow
sudo systemctl start taskflow
sudo systemctl status taskflow
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL hostname | `localhost` | ✅ |
| `DB_PORT` | MySQL port | `3306` | ❌ |
| `DB_NAME` | Database name | `todo_app` | ✅ |
| `DB_USER` | MySQL username | `root` | ✅ |
| `DB_PASSWORD` | MySQL password | - | ✅ |
| `NODE_ENV` | Environment | `development` | ❌ |
| `PORT` | Application port | `3000` | ❌ |

### Database Configuration

The application uses Knex.js for database management. Configuration is in `knexfile.js`:

- **Development**: Uses `.env` variables with fallbacks
- **Production**: Requires all environment variables to be set
- **Connection pooling**: Configured for optimal performance

## 🚀 Production Deployment

### Security Checklist

- [ ] Change default database passwords
- [ ] Set `NODE_ENV=production`
- [ ] Use a dedicated database user (not root)
- [ ] Enable firewall on your server
- [ ] Use HTTPS (consider adding reverse proxy like nginx)
- [ ] Regular database backups
- [ ] Monitor application logs

### Performance Tips

1. **Database Indexing**: Already optimized with proper indexes
2. **Connection Pooling**: Pre-configured in knexfile.js
3. **Static Assets**: Consider using nginx for static file serving
4. **Process Management**: Use PM2 for production process management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start bin/www --name taskflow

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🎨 Customization

### Theme Customization

Edit CSS variables in `views/index.ejs`:
```css
:root {
  --primary: #667eea;  /* Change primary color */
  --glass-bg: rgba(255, 255, 255, 0.75);  /* Adjust glass opacity */
}
```

### Language Support

Add new languages by:
1. Creating new locale file in `locales/[language].json`
2. Following the existing structure from `en.json` or `ja.json`
3. The application will automatically detect and offer the new language

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -h localhost

# Verify .env file
cat .env

# Check if tables exist
mysql -u root -p todo_app -e "SHOW TABLES;"

# Verify table structure
mysql -u root -p todo_app -e "DESCRIBE users; DESCRIBE tasks;"
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process or change PORT in .env
```

**Permission Denied (Raspberry Pi)**
```bash
# Fix file permissions
chmod +x bin/www
chown -R pi:pi /home/pi/node-mysql
```

### Logs and Debugging

```bash
# View application logs
npm run dev  # Shows detailed logs

# Check system logs (if using systemd)
sudo journalctl -u taskflow -f

# Database connection test
npm run test-db  # (if you add this script)
```

## 📝 API Reference

### Authentication Routes
- `GET /signin` - Sign in page
- `POST /signin` - Authenticate user
- `GET /signup` - Sign up page  
- `POST /signup` - Create new user
- `GET /logout` - Sign out user

### Task Management Routes
- `GET /` - Main dashboard (requires auth)
- `POST /` - Create new task
- `POST /toggle/:id` - Toggle task completion
- `POST /update/:id` - Update task
- `POST /delete/:id` - Delete task

### Utility Routes
- `GET /?lang=en|ja` - Switch language
- `GET /?view=list|kanban` - Switch view mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap team for the amazing CSS framework
- Express.js community for excellent middleware
- Knex.js team for the powerful query builder
- i18n contributors for internationalization support

## 🔗 Links

- **Live Demo**: [Your deployment URL]
- **Issues**: [GitHub Issues](https://github.com/DiZzyyy10/node-mysql/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DiZzyyy10/node-mysql/discussions)

---

**Made with ❤️ for productive task management**
