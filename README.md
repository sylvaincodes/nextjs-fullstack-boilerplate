# ⚡ Next.js Full-Stack Boilerplate

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

A real-world boilerplate to kickstart your full-stack Next.js applications—featuring monorepo structure, modern frontend stack, secure backend API, internationalization, payments, authentication, and more.

---

## ✨ Features

- Full monorepo structure
- Modular, type-safe, and scalable
- Clerk for auth, Stripe for payments
- MongoDB with Mongoose for storage
- Tailwind + shadcn/ui for styling
- i18n support with React Intl
- Optional ElevenLabs TTS integration

---

## 🏗️ Project Structure

project-root/
├── front/ # Frontend Next.js Application
└── api/ # Backend API Application


---

## 🎨 Frontend Stack

- **Next.js 15** with App Router
- **React 19**
- **Tailwind CSS**
- **TypeScript**
- **shadcn/ui**
- **Framer Motion**
- **Redux Toolkit**
- **React Intl**
- **React Hook Form**
- **Lucide Icons**
- **Clerk Auth**
- **Stripe Payments**
- **ElevenLabs TTS (optional)**

#### Structure

front/
├── actions/
├── app/
├── components/
│ ├── ui/
│ ├── modules/
│ └── custom/
├── hooks/
├── lib/
├── providers/
├── store/
├── types/
└── public/


---

## ⚙️ Backend Stack

- **Next.js API Routes**
- **MongoDB + Mongoose**
- **Zod Validation**
- **CSRF + CORS + Security Headers**
- **Stripe Webhooks**
- **Clerk Webhooks**
- **ElevenLabs Integration**

#### Structure

api/
├── actions/
├── app/
│ └── api/
├── components/
├── hooks/
├── lib/
├── models/
└── types/


---

## 🔧 Getting Started

### Prerequisites

- Node.js 18.17+
- MongoDB instance
- Clerk account
- Stripe account (optional)
- ElevenLabs account (optional)

---

## 🚀 Installation

```bash
git clone https://github.com/sylvaincodes/nextjs-fullstack-boilerplate.git
cd nextjs-fullstack-boilerplate


# Frontend
cd front && bun install

# Backend
cd ../api && bun install


🔐 Environment Variables

Frontend .env.local
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up


MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true

Backend .env.local
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

MONGODB_URI=your_mongodb_connection_string

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key


MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true

ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development

🧪 Run Development Servers
Terminal 1: Backend
cd api && bun dev

cd front && bun dev

🧪 Testing

# Frontend
cd front && bun run test

# Backend
cd api && bun run test

# End-to-End
bun run test:e2e

📦 Build for Production

# Frontend
cd front && bun run build

# Backend
cd api && bun run build


🤝 Contributing
Fork the repo

Create a feature branch: git checkout -b feature/my-feature

Commit: git commit -m "feat: my feature"

Push: git push origin feature/my-feature

Open a Pull Request

📄 License
MIT License - see the LICENSE file.

 Author
Sylvain Codes

Patreon https://www.patreon.com/c/sylvaincodes

Support Shop https://www.patreon.com/c/sylvaincodes/shop

Contact Me https://www.patreon.com/messages/8b25e025c56c4d47a903cd9b02049c63?mode=campaign&tab=chats

Built with ❤️ using Next.js, React, and TypeScript