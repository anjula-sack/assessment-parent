# Deployment Guide

This document describes how to deploy the Tilli Assessment Tool using self-hosted solutions.

## Prerequisites

- A Linux server with root access
- Docker and Docker Compose installed
- Node.js 20+ installed
- Nginx or Apache web server
- Domain name (optional but recommended)
- SSL certificate (recommended for production)

## Part 1: Self-hosting Appwrite

### 1. Setting up Appwrite

1. Create a directory for Appwrite:

```bash
mkdir appwrite && cd appwrite
```

2. Download the Appwrite Docker Compose file:

```bash
curl -fsSL https://raw.githubusercontent.com/appwrite/appwrite/master/docker-compose.yml -o docker-compose.yml
```

3. Create an `.env` file:

```bash
touch .env
```

4. Add the following environment variables to `.env`:

```env
_APP_ENV=production
_APP_DOMAIN=your-domain.com
_APP_DOMAIN_TARGET=your-domain.com
_APP_CONSOLE_WHITELIST_ROOT=enabled
```

5. Start Appwrite:

```bash
docker-compose up -d
```

Appwrite will be available at `http://your-domain.com` or `http://server-ip`.

### 2. Appwrite Configuration

1. Access the Appwrite Console and create a new project
2. Enable the Database service and create two collections:
   - **Participants**
   - **Assessments**
3. In each collection's permissions, allow write access for anonymous users
4. Note down the following IDs for environment variables:
   - Project ID (under Project Settings → General)
   - Database ID (under Database → [Your Database] → Settings)
   - Collection IDs for Participants and Assessments
5. Configure CORS origins in Project Settings → API → CORS Origins:
   - Add your production domain
   - Add your development domains

## Part 2: Deploying the Web Application

### 1. Building the Application

1. Clone the repository:

```bash
git clone <your-repo-url>
cd tilli-assessment-tool
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.production` file:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-domain/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_PARTICIPANTS_COLLECTION_ID=your-collection-id
NEXT_PUBLIC_APPWRITE_ASSESSMENTS_COLLECTION_ID=your-collection-id
```

4. Build the application:

```bash
npm run build
```

### 2. Server Setup with Nginx

1. Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

2. Create Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/tilli-assessment-tool;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Deploy the built application:

```bash
sudo mkdir -p /var/www/tilli-assessment-tool
sudo cp -r .next/* /var/www/tilli-assessment-tool/
```

### 3. Process Management with PM2

1. Install PM2:

```bash
npm install -g pm2
```

2. Create a PM2 ecosystem file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'tilli-assessment',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

3. Start the application:

```bash
pm2 start ecosystem.config.js
```

4. Enable startup script:

```bash
pm2 startup
pm2 save
```

### 4. SSL Configuration (Recommended)

1. Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

## Maintenance and Updates

### Updating the Application

1. Pull latest changes:

```bash
git pull origin main
```

2. Install dependencies and rebuild:

```bash
npm install
npm run build
```

3. Copy new build files:

```bash
sudo cp -r .next/* /var/www/tilli-assessment-tool/
```

4. Restart the application:

```bash
pm2 restart tilli-assessment
```

### Updating Appwrite

1. Pull latest Appwrite images:

```bash
cd appwrite
docker-compose pull
```

2. Restart services:

```bash
docker-compose up -d
```

## Monitoring

- Monitor application logs: `pm2 logs`
- Monitor Nginx logs:
  ```bash
  sudo tail -f /var/log/nginx/access.log
  sudo tail -f /var/log/nginx/error.log
  ```
- Monitor Appwrite logs: `docker-compose logs -f`

## Backup

### Appwrite Backup

1. Back up Appwrite data:

```bash
docker-compose exec mariadb mysqldump --all-databases > appwrite_backup.sql
```

2. Back up uploads:

```bash
tar -czf uploads_backup.tar.gz ./appwrite/uploads
```

### Application Backup

- Regularly backup your environment files and custom configurations
- Keep your Git repository up to date with all changes

## Security Considerations

1. Configure firewall rules (UFW):

```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

2. Regular system updates:

```bash
sudo apt update
sudo apt upgrade
```

3. Set up monitoring and alerting
4. Implement regular backup strategy
5. Keep all software components updated
6. Use strong passwords and key-based SSH authentication
