# SkillProof - Skill Verification & Hiring SaaS Platform

A production-ready skill-verification and hiring SaaS platform focused on real skills over degrees and certificates. Validate developers through actual GitHub projects, AI-based code analysis, and expert/community review.

## 🚀 Features

### For Students/Developers
- Public SkillProof profile with verified skills
- GitHub repository integration and analysis
- AI-powered code quality assessment
- Time-bound skill badges (Beginner, Intermediate, Advanced)
- Project submission with live demos
- Skill improvement suggestions

### For Companies/Recruiters
- Advanced candidate search and filtering
- Detailed SkillProof profiles instead of resumes
- Job and internship posting
- Hiring analytics and insights
- Company verification system

### For Administrators
- Complete system management
- User and project moderation
- AI flag review system
- Analytics and reporting
- Role-based access control

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI**
- **React Query**
- **Framer Motion**
- **Lucide Icons**

### Backend
- **Node.js**
- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **GraphQL & REST APIs**

### Integrations
- **GitHub API**
- **OpenAI API**
- **Google OAuth**
- **GitHub OAuth**
- **Stripe** (Payments)
- **Email Service**

## 📁 Project Structure

```
skillproof/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend application
├── docs/             # Documentation
├── docker-compose.yml # Docker configuration
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skillproof
```

2. Install dependencies:
```bash
npm run setup
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skillproof"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# APIs
OPENAI_API_KEY="your-openai-api-key"
GITHUB_TOKEN="your-github-token"

# Email
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-pass"

# Payments
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_GITHUB_CLIENT_ID="your-github-client-id"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

## 🚀 Deployment

### Docker
```bash
docker-compose up -d
```

### Production Build
```bash
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please read our [Contributing Guide](./docs/contributing.md) for details on our code of conduct and the process for submitting pull requests.


