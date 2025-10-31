# 🚀 Vercel Environment Variables Setup Guide

## ⚠️ IMPORTANT: Production Deployment Setup

Without these environment variables, your production deployment **will not be able to fetch quotes** from the API.

---

## 📋 Step-by-Step Instructions

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Sign in to your account
- Select your **health-insurance-app** project

### 2. Navigate to Environment Variables
- Click on your project
- Go to **Settings** tab (left sidebar)
- Click on **Environment Variables** (under "Configuration")

### 3. Add Required Variables

Add each variable **one by one** with these exact settings:

#### ✅ REQUIRED - Add These First:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api-prod.ensuredit.com` | ✅ Production |
| `NEXT_PUBLIC_API_ORIGIN` | `https://api.retire100.com/` | ✅ Production |
| `NEXT_PUBLIC_API_USER_ID` | `Test` | ✅ Production |
| `NEXT_PUBLIC_API_PASSWORD` | `Test@2024` | ✅ Production |
| `NEXT_PUBLIC_API_SALES_CHANNEL` | `2830` | ✅ Production |

**For each variable:**
1. Click **"Add New"** button
2. Paste the **Variable Name** (e.g., `NEXT_PUBLIC_API_BASE_URL`)
3. Paste the **Value** (e.g., `https://api-prod.ensuredit.com`)
4. **Check "Production"** checkbox (you can also check "Preview" and "Development" if you want)
5. Click **"Save"**

#### 🔧 Optional - For Specific Insurers:

If you want quotes from specific insurers, add these too:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_RELIGARE_USER_ID` | `ReligareUser` | ✅ Production |
| `NEXT_PUBLIC_RELIGARE_PASSWORD` | `religare@123456` | ✅ Production |
| `NEXT_PUBLIC_RELIGARE_SALES_CHANNEL_ID` | `266` | ✅ Production |
| `NEXT_PUBLIC_SSS_USER_ID` | `SSSUser` | ✅ Production |
| `NEXT_PUBLIC_SSS_PASSWORD` | `sss@123456` | ✅ Production |
| `NEXT_PUBLIC_SSS_SALES_CHANNEL_ID` | `223` | ✅ Production |

---

## 🔄 4. Redeploy Your Application

After adding **all** environment variables:

### Option A: Redeploy from Dashboard
1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on your latest deployment
3. Select **"Redeploy"**
4. Wait for deployment to complete

### Option B: Push New Commit (Automatic)
1. Make any small change to your code
2. Commit and push to GitHub
3. Vercel will automatically redeploy with new environment variables

---

## ✅ Verification

After redeployment:

1. **Check the deployment logs**:
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Check the logs to see if environment variables are being used

2. **Test in production**:
   - Visit your production URL
   - Try to get quotes
   - Check browser console (F12) for any errors

3. **Expected behavior**:
   - ✅ Form submission should work
   - ✅ Quotes should be fetched successfully
   - ✅ You should see plans from multiple insurers (Reliance, Care, Niva Bupa, etc.)

---

## 🐛 Troubleshooting

### Problem: Still getting 500 errors
**Solution:**
- Double-check that **all 5 required variables** are added
- Ensure variable names are **exactly** as shown (case-sensitive)
- Make sure **"Production"** is checked for each variable
- Redeploy after adding variables

### Problem: Quotes not loading
**Solution:**
- Check Vercel function logs: **Deployments** → Latest deployment → **Functions** tab
- Look for errors related to API authentication
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct

### Problem: "Missing API base URL" error
**Solution:**
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Ensure the variable name has no typos
- Redeploy the application

---

## 📝 Quick Copy-Paste List

Copy these **exactly** as shown:

```
NEXT_PUBLIC_API_BASE_URL
https://api-prod.ensuredit.com

NEXT_PUBLIC_API_ORIGIN
https://api.retire100.com/

NEXT_PUBLIC_API_USER_ID
Test

NEXT_PUBLIC_API_PASSWORD
Test@2024

NEXT_PUBLIC_API_SALES_CHANNEL
2830
```

---

## 🎯 Next Steps

After setting up environment variables:
1. ✅ Redeploy your application
2. ✅ Test quote generation in production
3. ✅ Verify all insurers are returning quotes
4. ✅ Check browser console for any errors

---

**Need Help?** Check the Vercel documentation: https://vercel.com/docs/concepts/projects/environment-variables
