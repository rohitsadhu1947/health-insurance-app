# Health Insurance App

A modern health insurance comparison platform built with Next.js, React, and TypeScript.

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-insurance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API credentials.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🌐 Production Deployment (Vercel)

### Environment Variables Setup

To deploy to Vercel, you need to configure the following environment variables in your Vercel dashboard:

#### Required Environment Variables:

1. **API Configuration**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api-prod.ensuredit.com
   NEXT_PUBLIC_API_ORIGIN=https://api.retire100.com/
   ```

2. **API Credentials**
   ```
   NEXT_PUBLIC_API_USER_ID=Test
   NEXT_PUBLIC_API_PASSWORD=Test@2024
   NEXT_PUBLIC_API_SALES_CHANNEL=2830
   ```

3. **Optional: Religare Credentials**
   ```
   NEXT_PUBLIC_RELIGARE_USER_ID=ReligareUser
   NEXT_PUBLIC_RELIGARE_PASSWORD=religare@123456
   NEXT_PUBLIC_RELIGARE_SALES_CHANNEL_ID=266
   ```

4. **Optional: SSS Credentials**
   ```
   NEXT_PUBLIC_SSS_USER_ID=SSSUser
   NEXT_PUBLIC_SSS_PASSWORD=sss@123456
   NEXT_PUBLIC_SSS_SALES_CHANNEL_ID=223
   ```

### How to Add Environment Variables in Vercel:

1. **Go to your Vercel dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Add each variable**
   - Click "Add New"
   - Enter the variable name (e.g., `NEXT_PUBLIC_API_BASE_URL`)
   - Enter the variable value (e.g., `https://api-prod.ensuredit.com`)
   - Select "Production" environment
   - Click "Save"

4. **Redeploy**
   - After adding all environment variables, trigger a new deployment
   - You can do this by pushing a new commit or manually redeploying from the Vercel dashboard

### 🔧 Troubleshooting

#### Common Issues:

1. **500 Internal Server Error**
   - **Cause**: Missing environment variables
   - **Solution**: Ensure all required environment variables are set in Vercel

2. **API requests failing**
   - **Cause**: Incorrect API base URL or credentials
   - **Solution**: Verify environment variables match your API configuration

3. **CORS errors**
   - **Cause**: Incorrect origin header
   - **Solution**: Check `NEXT_PUBLIC_API_ORIGIN` is set correctly

#### Debug Steps:

1. **Check Vercel Function Logs**
   - Go to your Vercel dashboard
   - Click on "Functions" tab
   - Check the logs for `/api/proxy` function

2. **Verify Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Ensure all variables are present and have correct values

3. **Test API Endpoint**
   - Use the browser's Network tab to see the exact error
   - Check if the API URL is being constructed correctly

## 📁 Project Structure

```
health-insurance-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Customer portal pages
│   ├── login/            # Login page
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                 # Utilities and types
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: Zustand
- **API**: Next.js API Routes
- **Deployment**: Vercel

## 📝 Features

- ✅ Health insurance quote comparison
- ✅ Family member selection (self, spouse, parents, children)
- ✅ Add-on customization
- ✅ CKYC verification
- ✅ Policy proposal submission
- ✅ Payment processing
- ✅ Customer portal with dashboard
- ✅ Policy management
- ✅ Claims tracking
- ✅ Support ticket system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.