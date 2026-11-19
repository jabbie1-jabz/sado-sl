# 🌾 SADO-SL Online Deployment Guide

## ✅ QUICK START - Deploy in 2 Minutes

### **Option 1: Netlify (RECOMMENDED - Easiest)**

1. **Go to:** https://app.netlify.com/drop
2. **Drag & drop ALL files** from this folder:
   - `customer.html`
   - `admin.html`
   - `marketplace.js`
   - `admin.js`
   - `logo.jpg`
   - `server.js` (optional)

3. **Done!** You'll get a public URL like: `https://your-site.netlify.app`

**Pros:**
- ✅ Free
- ✅ Permanent URL
- ✅ No code needed
- ✅ Works worldwide

---

### **Option 2: Vercel (Also Great)**

1. **Go to:** https://vercel.com/new
2. **Click:** Import a Git repo (or use their import option)
3. **Upload your files**
4. **Deploy**

**Pros:**
- ✅ Free
- ✅ Fast
- ✅ Professional

---

### **Option 3: GitHub Pages (Free Forever)**

1. **Create GitHub account** at https://github.com
2. **Create new repository:** `username.github.io`
3. **Upload all HTML files**
4. **Access at:** `https://username.github.io/customer.html`

---

## 📝 IMPORTANT NOTES

### **Data Storage:**
- Products and videos are stored in the SADO-SL Supabase project and appear on
  the customer page across devices. The site needs an internet connection.
- Media uploads are limited to 50 MB per file and the project's storage quota.
- To transfer older uploads, sign in on the original laptop and browser and use
  **Publish older browser uploads**. The original browser data is not deleted.
  Previously uploaded local videos were not saved permanently and must be
  uploaded again.
- `supabase-setup.sql` records the database and storage policies for a new
  installation. It contains the authorized admin's user ID; update the policies
  when changing the admin account. Never expose a Supabase secret or service-role key.

---

## 🚀 RECOMMENDED WORKFLOW

1. **Right now:** Deploy to Netlify
2. **Get your public URL**
3. **Share with customers**
4. **Test all features**
5. Sign in to the admin page and publish your listings

---

## 🔐 SECURITY REMINDERS

Use the email and password created in Supabase Authentication. Hiding the admin
link is not a security measure; access to publishing is enforced by the database
and storage policies.

---

## 📧 SUPPORT

Need help deploying? Let me know:
- Which platform you chose (Netlify/Vercel/GitHub)
- Any error messages
- Your new public URL

I can help you set it up! 🚀
