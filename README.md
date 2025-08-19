# Service Provider Marketplace

A comprehensive React + Node.js application for connecting customers with verified service providers.

## 🚀 Features

### Customer Features
- **Smart Search**: Search for service providers by pincode with intelligent ranking
- **Voice Search**: Use Web Speech API for hands-free searching
- **Advanced Filters**: Filter by availability, rating, Aadhaar verification, price range
- **Real-time Booking**: Complete booking flow with OTP verification
- **Status Tracking**: Track booking status from requested to completed
- **Multi-language**: Support for English and Hindi
- **Reviews & Ratings**: Rate and review completed services

### Provider Features
- **Quick Add Onboarding**: Get started in under 2 minutes
- **Full Verification**: Complete Aadhaar e-KYC for verified badge
- **Provider Dashboard**: Manage bookings, track earnings, view analytics
- **Online/Offline Status**: Control availability and booking visibility
- **Multi-service Support**: Offer multiple service categories
- **Earning Analytics**: Track performance with charts and metrics

### Trust & Safety
- **Aadhaar Verification**: e-KYC integration for provider verification
- **Trust Badges**: Verified, Top Rated, Quick Response, New provider badges
- **OTP System**: Start and end job OTP verification
- **Customer Reviews**: Transparent rating and review system
- **Background Checks**: Optional police verification

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── ProviderDashboard.tsx
│   │   │   ├── QuickAddProvider.tsx
│   │   │   └── ProviderOnboarding.tsx
│   │   ├── services/      # API service layer
│   │   ├── i18n/          # Internationalization
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Node.js backend API
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   │   ├── User.js
│   │   │   ├── Provider.js
│   │   │   ├── Booking.js
│   │   │   └── Review.js
│   │   ├── routes/        # API routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── providers.js
│   │   │   ├── bookings.js
│   │   │   └── reviews.js
│   │   ├── middleware/    # Express middleware
│   │   └── index.js       # Server entry point
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Material-UI v7** for UI components
- **React Router** for navigation
- **React i18next** for internationalization
- **Chart.js** for analytics visualization
- **Axios** for API communication
- **Web Speech API** for voice search

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Environment Variables**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/service_provider_app
   JWT_SECRET=your_jwt_secret_key_here
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in client directory
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Application Flow

### Customer Journey
1. **Landing Page**: Search by pincode, view providers with smart ranking
2. **Provider Selection**: Filter by availability, rating, verification status
3. **Booking Creation**: Fill service details, schedule, and payment method
4. **OTP Verification**: Verify start and end of service with OTPs
5. **Review & Rating**: Rate the completed service

### Provider Journey
1. **Quick Add**: Basic registration in 2 minutes
2. **Dashboard Access**: Manage bookings and view earnings
3. **Full Verification**: Complete Aadhaar e-KYC for verified badge
4. **Booking Management**: Accept/decline requests, update status
5. **Analytics**: Track performance and earnings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Providers
- `GET /api/providers/search` - Search providers with filters
- `POST /api/providers/quick-add` - Quick provider registration
- `GET /api/providers/:id` - Get provider details
- `PATCH /api/providers/:id/status` - Update provider status

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Customer bookings
- `GET /api/bookings/provider-bookings` - Provider bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/verify-otp` - Verify OTP

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/provider/:id` - Get provider reviews

## 🎯 Smart Ranking Algorithm

The application uses a sophisticated ranking algorithm to prioritize providers:

```javascript
smartScore = 
  (availability * 0.3) + 
  (rating * 0.3) + 
  (verification * 0.25) + 
  (experience * 0.15)
```

Factors considered:
- **Availability**: Online status (30% weight)
- **Rating**: Customer rating average (30% weight)
- **Verification**: Aadhaar verification status (25% weight)
- **Experience**: Years of experience (15% weight)

## 🌍 Internationalization

The app supports multiple languages:
- **English** (default)
- **Hindi** (हिंदी)

Language files are located in `client/src/i18n/locales/`.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation using express-validator
- **CORS Protection**: Configured for secure cross-origin requests
- **OTP Verification**: Two-factor verification for service completion

## 📊 Database Schema

### User Model
- Personal information (name, email, phone)
- Address details with coordinates
- Role-based access (customer/provider)

### Provider Model
- Service offerings and pricing
- Verification status and badges
- Location and service area
- Performance statistics

### Booking Model
- Service details and scheduling
- Payment information
- Status tracking timeline
- OTP verification system

### Review Model
- Rating breakdown (overall, punctuality, quality)
- Written reviews and helpful votes
- Provider response capability

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Configure MongoDB connection string
3. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@serviceprovider.com or create an issue in the repository.

---

**Built with ❤️ for connecting customers with trusted service providers**