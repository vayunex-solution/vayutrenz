# SchoolDost - Hostinger Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Hostinger MySQL Database Setup

1. **Login to Hostinger hPanel**
2. Go to **Databases** → **MySQL Databases**
3. Create new database:
   - Database Name: `schooldost_db`
   - Username: `schooldost_user`
   - Password: (Generate strong password)
4. Note down these details:
   - Host: `localhost` (or given host)
   - Port: `3306`
   - Database: `schooldost_db`
   - Username: `schooldost_user`
   - Password: `your_password`

### Step 2: Backend .env Configuration

Create `.env` file in backend folder:

```env
# Database
DATABASE_URL="mysql://schooldost_user:your_password@localhost:3306/schooldost_db"

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Frontend URL
FRONTEND_URL=https://schooldost.com

# Email (Optional - for password reset)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@schooldost.com
SMTP_PASS=your_email_password

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_CALLBACK_URL=https://api.schooldost.com/api/auth/google/callback
```

### Step 3: Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with static files.

### Step 4: Upload to Hostinger

**Option A: Shared Hosting (Frontend Only)**
1. Upload `dist` folder contents to `public_html`
2. Backend needs VPS or Node.js hosting

**Option B: VPS Hosting (Recommended)**
1. SSH into VPS
2. Upload entire project
3. Install Node.js, PM2
4. Run commands below

### Step 5: VPS Setup Commands

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone/Upload project
cd /var/www/schooldost

# Backend setup
cd backend
npm install
npx prisma generate
npx prisma db push

# Start backend with PM2
pm2 start src/index.js --name schooldost-api

# Frontend (if serving from same server)
cd ../frontend
npm install
npm run build
```

### Step 6: Nginx Configuration

```nginx
# /etc/nginx/sites-available/schooldost

# Frontend
server {
    listen 80;
    server_name schooldost.com www.schooldost.com;
    
    root /var/www/schooldost/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.schooldost.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket for real-time
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Step 7: SSL Certificate (Free)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d schooldost.com -d www.schooldost.com -d api.schooldost.com
```

---

## ⚡ Real-time Messaging Performance

Socket.io is already configured for:
- **Message latency**: ~10-50ms
- **Typing indicators**: Real-time
- **Online status**: Real-time
- **Notifications**: Instant

### For even better performance:

```bash
# Install Redis (optional)
sudo apt install redis-server

# Update socket handler to use Redis adapter
npm install @socket.io/redis-adapter redis
```

---

## 📱 Production Checklist

- [ ] MySQL database created on Hostinger
- [ ] .env file configured with production values
- [ ] Frontend built with `npm run build`
- [ ] Backend uploaded to VPS
- [ ] Prisma migrations run
- [ ] PM2 running backend
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Test all features

---

## 🔧 Useful Commands

```bash
# Check backend status
pm2 status

# View logs
pm2 logs schooldost-api

# Restart backend
pm2 restart schooldost-api

# Database migrations
npx prisma db push
npx prisma generate
```
