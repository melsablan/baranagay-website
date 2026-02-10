# ⚡ Quick Start: Deploy in 5 Minutes

Copy-paste commands to go live!

---

## **Prerequisites**
✅ GitHub account created  
✅ Vercel account (free signup at vercel.com)  
✅ Railway account (free signup at railway.app)

---

## **Step 1: Push to GitHub (5 minutes)**

### **1.1 GitHub Repository Already Created ✅**
Your repository exists at: `https://github.com/melsablan/baranagay-website`

You're ready to push code!

### **1.2 Push Your Code**

In PowerShell (from `d:\barangay_website`):

```powershell
# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit - Barangay NIT Website with chatbot"

# Set remote to your GitHub repository
git remote add origin https://github.com/melsablan/baranagay-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

---

## **Step 2: Deploy Frontend to Vercel (3 minutes)**

### **2.1 Create Vercel Project**
1. Go to https://vercel.com/new
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access GitHub
4. Search and import `barangay_website` repository
5. Click **"Import"**

### **2.2 Configure Build Settings**
Vercel auto-detects, but verify:
- **Framework**: React ✅
- **Build Command**: `npm run build` ✅
- **Root Directory**: `frontend` ✅

### **2.3 Add Environment Variables**
Before clicking Deploy, add these environment variables:
1. Click **"Environment Variables"**
2. Add:
   - **Name**: `REACT_APP_GEMINI_API_KEY`
   - **Value**: `AIzaSyC3THeHgn7-IQ1iSyD-1ENDi6kJaCHvV3g`
3. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: (leave empty for now, we'll update after Railway deploys)
4. Click **"Deploy"**

⏳ **Wait 2-5 minutes** for deployment...

✅ Your frontend is LIVE! 

### **2.4 Copy Your Frontend URL**
- In Vercel dashboard, you'll see your domain
- Looks like: `https://barangay-website.vercel.app`
- **Copy this URL** - you'll need it later!

---

## **Step 3: Deploy Backend to Railway (3 minutes)**

### **3.1 Create Railway Project**
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Click **"Connect GitHub"** and authorize
5. Search for `barangay_website` repository
6. Select it and click **"Deploy"**

⏳ **Wait 2-3 minutes** while Railway builds...

### **3.2 Set Environment Variables**
1. In Railway, click your project
2. Go to **"Variables"** tab
3. Add these environment variables:
   ```
   FLASK_ENV=production
   DB_HOST=localhost        (or your MySQL host)
   DB_USER=root            (or your username)
   DB_PASSWORD=010724      (or your password)
   DB_NAME=barangay_nit
   DB_PORT=3306
   JWT_SECRET_KEY=your-secret-key-change-this
   ```
4. Click **"Deploy"** on the right panel

### **3.3 Get Your Backend URL**
1. In Railway, click **"Deployments"** tab
2. Find **Public URL** - looks like: `https://your-project-*.up.railway.app`
3. **Copy this URL** - next step!

✅ Your backend is LIVE!

---

## **Step 4: Connect Frontend ↔ Backend (2 minutes)**

### **4.1 Update Vercel Environment Variables**
1. Go back to Vercel dashboard
2. Go to **"Settings"** → **"Environment Variables"**
3. Find `REACT_APP_API_URL` variable
4. Update value to your **Railway Backend URL**
   - Example: `https://your-project-abc123.up.railway.app`
5. Click **"Save"**

### **4.2 Redeploy Frontend**
1. Go to **"Deployments"** tab
2. Click the last deployment
3. Click **"Redeploy"** button
4. Wait 1-2 minutes

✅ Frontend and backend are connected!

---

## **Step 5: Test Your Live Website**

### **Test Frontend**
1. Click Vercel deployment link
2. You should see your website LIVE
3. Click the ChatBot button
4. Ask: "What is a barangay clearance?"
5. ChatBot should respond! ✅

### **Test Backend API**
Open new tab and go to:
```
https://your-railway-backend.up.railway.app/api/health
```
Should return: `{"status": "ok"}` ✅

### **Test Full Integration**
1. On live website, try:
   - Booking an appointment
   - Requesting a certificate
   - Submitting contact form
2. Check if data is saved in database ✅

---

## **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Vercel build fails | Check frontend/package.json has all dependencies |
| API calls fail (CORS error) | Make sure REACT_APP_API_URL is set correctly in Vercel |
| ChatBot not responding | Check if REACT_APP_GEMINI_API_KEY is set in Vercel |
| Database connection error | Verify DB credentials in Railway environment variables |
| 404 on page refresh | This is normal - React Router needs Vercel config |

---

## **Your Live URLs**

After completing all steps:

**Frontend (Website):**
```
https://barangay-website.vercel.app
```

**Backend API:**
```
https://your-project-*.up.railway.app
```

**Example API Calls:**
```bash
# Health check
curl https://your-project-*.up.railway.app/api/health

# Get news
curl https://your-project-*.up.railway.app/api/news
```

---

## **What's Next?**

✅ **Website is Live!** Share with people:
- `https://barangay-website.vercel.app`

📱 **Optional: Custom Domain**
- In Vercel Settings → add your custom domain
- Update DNS at your domain registrar
- Costs: ~₱200-500/year for domain

📊 **Monitor Performance**
- Vercel: Check analytics and error logs
- Railway: Monitor CPU, memory, database usage
- ChatBot: Check admin dashboard for interaction stats

---

## **Common Commands**

Update code and redeploy:
```powershell
git add .
git commit -m "Updated chatbot"
git push
```
(Vercel auto-redeploys on every push!)

---

🎉 **Congratulations! Your website is live on the internet!**

Share the Vercel URL with your barangay residents!
