# 🎨 LeadGen Pro - Frontend

This is the frontend application for LeadGen Pro, built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. It features a modern, high-performance interface with glassmorphic design elements and smooth animations.

---

## ✨ Features

- **🛡️ Secure Auth**: Integration with the FastAPI backend for registration and login.
- **✨ Glassmorphic UI**: Custom `GlassCard` and `GlassButton` components for a premium aesthetic.
- **🛠️ Smart Onboarding**: Multi-step onboarding process to set up campaigns and profiles.
- **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **🌀 Dynamic Animations**: Powered by Framer Motion for fluid state transitions.
- **📊 Interactive Dashboard**: Real-time visualization of lead data and campaign performance.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **State Management**: React Hooks & Context API
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running (see root README)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Folder Structure

- `src/app/`: App router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Utility functions and API configuration.
- `src/styles/`: Global CSS and Tailwind configuration.

---

## 🚢 Deployment

The frontend is optimized for deployment on **Vercel** or **Netlify**.

1. Connect your repository to Vercel.
2. Configure the `NEXT_PUBLIC_API_URL` environment variable.
3. Deploy!

---

*Part of the [LeadGen Pro](..) ecosystem.*
