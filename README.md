# HealthCare Plus - Health Insurance Platform

A modern, production-ready health insurance comparison and purchase platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-Insurer Quotes**: Compare 20+ plans from 6 top insurers
- **Real-time Quote Generation**: Instant quotes based on user input
- **CKYC Verification**: Secure Central KYC verification
- **Document Upload**: Seamless KYC document upload to S3
- **Multi-step Proposal Form**: Intuitive form with progress tracking
- **OTP Verification**: Mobile number verification
- **Payment Gateway Integration**: Secure payment processing
- **Responsive Design**: Works perfectly on all devices
- **Beautiful UI**: Modern design with animations and transitions

## 🏢 Supported Insurers

1. **CARE Health Insurance**
2. **Cigna TTK**
3. **Digit Insurance**
4. **HDFC ERGO**
5. **Niva Bupa**
6. **Reliance Health Insurance**

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**:
   ```bash
   cd health-insurance-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   The `.env.local` file is already configured with UAT credentials:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api-uat.ensuredit.com
   NEXT_PUBLIC_API_USER_ID=ReligareUser
   NEXT_PUBLIC_API_PASSWORD=religare@123456
   NEXT_PUBLIC_API_SALES_CHANNEL=266
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔄 Complete User Journey

### 1. Home Page (`/`)
- Hero section with trust badges
- Quote request form
- Family member selection
- Pincode verification

### 2. Quotes Page (`/quotes`)
- Display 20+ plans from 6 insurers
- Filter by insurer and sort options
- Plan comparison (up to 3 plans)
- Quick buy option

### 3. Compare Page (`/compare`)
- Side-by-side plan comparison
- Feature-by-feature analysis
- Premium breakdown
- Direct purchase from comparison

### 4. CKYC Verification (`/ckyc`)
- Personal details verification
- Central KYC integration
- Document upload (PAN, Aadhaar, etc.)
- Secure S3 upload

### 5. Proposal Form (`/proposal`)
- Multi-step wizard (5 steps):
  1. Proposer Details
  2. Nominee Details
  3. Medical History
  4. Address Details
  5. OTP Verification
- Progress tracking
- Auto-save functionality

### 6. Payment (`/payment`)
- Multiple payment modes:
  - Credit/Debit Card
  - UPI
  - Net Banking
- Order summary
- Secure payment gateway
- GST calculation

### 7. Success Page (`/success`)
- Policy confirmation
- Policy number generation
- Download policy document
- Email confirmation
- Customer support details

## 🔐 API Integration

The application integrates with the following APIs:

1. **Authentication**: `/v3/login/verifyPassword`
2. **Quote Form Fields**: `/v3/preQuote/quoteFields`
3. **Pincode Verification**: `/v3/preProposal/pincodeInfo`
4. **Create Quote**: `/v3/getQuote/HEALTH`
5. **Quote Filters**: `/v3/preQuote/quoteFilters`
6. **CKYC Verification**: `/v3/proposal/ckyc/{INSURER}/verifyCkyc`
7. **S3 Upload URL**: `/v3/utilities/getS3PresignedURL`
8. **Upload KYC Docs**: `/v3/proposal/ckyc/{INSURER}/uploadKycDocs`
9. **Proposal Fields**: `/v3/preProposal/proposalFields`
10. **Send OTP**: `/v3/proposal/sendProposalOTP/{quotePlanId}/Send`
11. **Verify OTP**: `/v3/proposal/sendProposalOTP/{quotePlanId}/Verify`
12. **Create Proposal**: `/v3/proposal/HEALTH/create`
13. **Payment**: `/v3/proposal/HEALTH/payment`

## 📁 Project Structure

```
health-insurance-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── quotes/            # Quotes listing
│   ├── compare/           # Plan comparison
│   ├── ckyc/              # CKYC verification
│   ├── proposal/          # Proposal form
│   ├── payment/           # Payment page
│   ├── success/           # Success page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Header component
│   └── LoadingOverlay.tsx # Loading component
├── lib/                   # Utility libraries
│   ├── api/              # API client & services
│   │   ├── client.ts     # Axios client
│   │   └── services.ts   # API functions
│   ├── types.ts          # TypeScript types
│   ├── store.ts          # Zustand store
│   ├── constants.ts      # App constants
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## 🎨 Key Components

### API Client (`lib/api/client.ts`)
- Axios instance with interceptors
- Automatic authentication
- Token refresh on 401
- Error handling

### State Management (`lib/store.ts`)
- Quote data
- Selected plans
- CKYC data
- Proposal ID
- User form data
- Loading states

### Services (`lib/api/services.ts`)
- All API integrations
- Type-safe requests
- Error handling

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

### Other Platforms

The app can be deployed to:
- **Netlify**
- **AWS Amplify**
- **Google Cloud Run**
- **Docker** (create Dockerfile)

## 🔒 Security Considerations

⚠️ **Important**: The current `.env.local` contains UAT credentials. For production:

1. **Move credentials to backend**: Create API routes to proxy requests
2. **Use environment variables**: Store in Vercel/hosting platform
3. **Implement rate limiting**: Prevent API abuse
4. **Add CORS protection**: Restrict API access
5. **Enable CSP**: Content Security Policy headers

## 📝 Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api-uat.ensuredit.com

# Credentials (Move to backend in production)
NEXT_PUBLIC_API_USER_ID=ReligareUser
NEXT_PUBLIC_API_PASSWORD=religare@123456
NEXT_PUBLIC_API_SALES_CHANNEL=266
```

## 🧪 Testing

Run the development server and test:

1. **Quote Generation**: Fill form on home page
2. **Plan Comparison**: Select plans and compare
3. **CKYC Flow**: Enter PAN details (test with mock data)
4. **Proposal**: Complete multi-step form
5. **Payment**: Test payment flow (mock in UAT)

## 🐛 Known Limitations

1. **Payment Gateway**: Currently simulated (integrate actual gateway in production)
2. **Policy Download**: Mock implementation (integrate with insurer APIs)
3. **Add-ons Modal**: Pending implementation (can add if needed)
4. **Real-time Premium**: Backend support needed for live calculations

## 📞 Support

For issues or questions:
- Email: support@healthcareplus.com
- Phone: 1800-123-4567

## 📄 License

This project is built for demonstration purposes using live UAT APIs.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful components
- **Vercel** for Next.js framework
- **Tailwind CSS** for styling
- **Lucide** for icons

---

**Built with ❤️ for your client demo** 🚀
