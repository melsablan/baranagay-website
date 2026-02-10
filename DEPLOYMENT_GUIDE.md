# 🚀 Deployment Guide - Barangay NIT Website

Complete guide to deploy your website to the internet using Vercel (frontend) and Railway (backend).

---

## **Prerequisites**
- ✅ GitHub account (you have this)
- GitHub repository with your code
- Vercel account (free - sign up at vercel.com)
- Railway account (free - sign up at railway.app)

---

## **PART 1: Deploy Frontend to Vercel**

### **Step 1: Push Code to GitHub**
If you haven't already:
```bash
cd d:\barangay_website
git add .
git commit -m "Add chatbot with learning system and deployment config"
git remote add origin https://github.com/melsablan/baranagay-website.git
git push -u origin main
```

**If you get "remote origin already exists" error:**
```bash
git remote set-url origin https://github.com/melsablan/baranagay-website.git
git push -u origin main
```

### **Step 2: Connect Vercel to GitHub**

1. Go to **vercel.com** and sign in with GitHub
2. Click **"New Project"**
3. Import your `barangay_website` GitHub repository
4. Select **"Frontend"** as project type
5. Configure build settings:
   - **Framework**: React
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Root Directory**: `frontend`
6. Click **"Deploy"**

✅ Your frontend will be live! (Wait 2-5 minutes)

### **Step 3: Set Environment Variables in Vercel**

1. Go to your Vercel project **Settings** → **Environment Variables**
2. Add:
   ```
   REACT_APP_API_URL=https://your-railway-backend.up.railway.app
   REACT_APP_GEMINI_API_KEY=AIzaSyC3THeHgn7-IQ1iSyD-1ENDi6kJaCHvV3g
   ```
3. Click **"Save"**
4. Redeploy: **Deployments** → **Redeploy**

---

## **PART 2: Deploy Backend to Railway**

### **Step 1: Prepare Backend**

Update your Flask app to work with Railway:

**backend/application.py** - Change this:
```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
```

### **Step 2: Create Railway Project**

1. Go to **railway.app** and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `barangay_website` repository
4. Click **"Deploy"**

### **Step 3: Configure Railway**

1. **Environment Variables:**
   - DB_HOST: Your MySQL host
   - DB_USER: Your MySQL username
   - DB_PASSWORD: Your MySQL password
   - DB_NAME: barangay_nit
   - DB_PORT: 3306
   - FLASK_ENV: production

2. **Listen Port:**
   - Set `PORT=5000` in environment

3. **Root Directory:**
   - Set to `backend`

### **Step 4: Get Your Backend URL**

1. In Railway, go to **Settings** → **General**
2. Copy your **Public URL** (looks like `https://your-name-prod.up.railway.app`)
3. Update Vercel environment variables with this URL

---

## **PART 3: Connect Frontend ↔ Backend**

### **Update API URLs**

1. **In Vercel (frontend):**
   - Set `REACT_APP_API_URL=https://your-railway-backend.up.railway.app`

2. **In Railway (backend):**
   - Verify CORS allows your Vercel domain
   - Update `backend/application.py`:
   ```python
   CORS(app, resources={
       r"/api/*": {
           "origins": ["https://your-vercel-domain.vercel.app"],
           "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
           "allow_headers": ["Content-Type", "Authorization"]
       }
   })
   ```

---

## **PART 4: Database Setup**

Railway can host MySQL for you:

1. In Railway project, click **"+ New"** → **"Database"** → **"MySQL"**
2. Railway creates database automatically
3. Use the connection credentials in your environment variables

**Or use existing database:**
- Update `.env` variables with your current MySQL host
- Make sure your database is accessible from the internet
- Allow incoming connections from Railway IP

---

## **PART 5: Test Deployment**

1. **Frontend:** Open your Vercel URL
   - Should see the website live
   - Chat button should work

2. **Backend:** Test API
   ```bash
   curl https://your-railway-backend.up.railway.app/api/health
   ```

3. **Connection:**
   - Try booking an appointment
   - Try requesting a certificate
   - Open browser DevTools → Network tab to verify API calls

---

## **PART 6: Custom Domain (Optional)**

### **Add Domain to Vercel:**
1. Go to Vercel project **Settings** → **Domains**
2. Add your custom domain (e.g., barangaynit.com)
3. Update DNS records at your domain registrar
4. Wait for DNS propagation (10-30 mins)

---

## **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Frontend builds fail | Check `npm run build` locally first |
| API calls fail | Check REACT_APP_API_URL in Vercel env vars |
| Database connection error | Verify MySQL credentials in Railway |
| CORS errors | Update CORS origins in Flask app |
| 404 on routes | Set `vercel.json` with `rewrites` for React Router |

---

## **Final Checklist**

- [ ] GitHub repository created and pushed
- [ ] Vercel frontend deployed
- [ ] Environment variables set in Vercel
- [ ] Railway backend deployed
- [ ] Database configured
- [ ] API URL updated in Vercel
- [ ] CORS configured for both domains
- [ ] Frontend loads at Vercel URL
- [ ] API requests work
- [ ] Chat bot responds
- [ ] Appointments/certificates work

---

## **Live URLs**

After deployment:
- **Frontend:** `https://your-project.vercel.app`
- **Backend API:** `https://your-railway-backend.up.railway.app`
- **Custom Domain:** `https://yourdomain.com`

---

## **Support**

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Environment Variables Guide:** https://vercel.com/docs/concepts/projects/environment-variables

---

Good luck! 🚀
