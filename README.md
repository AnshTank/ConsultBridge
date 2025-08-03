# 🚀 ConsultBridge

![ConsultBridge Logo](./public/logo.png)

**ConsultBridge** is a modern AI-powered consultancy discovery platform that bridges the gap between users and verified consultancy agencies. Whether you need help with law, finance, healthcare, or IT, we help you find the right expert—fast, transparent, and tailored to your needs.

---

## 📚 Table of Contents

1. <!-- [Demo](#demo) -->
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Folder Structure](#-folder-structure)
5. [Getting Started](#-getting-started)
6. [How to Use](#-how-to-use)
7. [Core Components](#-core-components)
8. [API Overview](#-api-overview)
9. [Deployment Guide](#-deployment-guide)
10. [Contributing](#-contributing)
11. [License](#-license)
12. [Contact](#-contact)

---

<!-- 
## 🎬 Demo

> ⚠️ Coming Soon! (Link to walkthrough video or site preview)
-->

---

## ✨ Features

- 🔎 **Category-Based Discovery**: Filter consultancies based on domain (Legal, Finance, Tech, etc.).
- 🤖 **Smart AI Chatbot**: Get matched with consultancies based on your inputs using natural language.
- 🧾 **Comprehensive Profiles**: View agency credentials, pricing, availability, and more.
- 📆 **Book Easily**: Choose between online or in-person consultations with real-time scheduling.
- ⭐ **Ratings & Reviews**: Trust community feedback when choosing the right consultant.
- 📂 **User Dashboard**: Manage appointments, track history, and export session details.
- 📱 **Mobile Friendly**: 100% responsive, optimized for phones and tablets.
- 🔐 **Secure & Scalable**: JWT-based authentication, MongoDB Atlas, and best practices in deployment.

---

## 🛠 Tech Stack

| Layer         | Technologies                                      |
| ------------- | ------------------------------------------------- |
| **Frontend**  | Next.js, React, Tailwind CSS, Framer Motion       |
| **Backend**   | Node.js, Express.js, MongoDB (Mongoose ORM)       |
| **Chatbot**   | Ollama (Mistral), OpenAI API                      |
| **Validation**| Zod                                               |
| **Other**     | Axios, Docker, PDF Generator                      |
| **Deployment**| Vercel, MongoDB Atlas                             |

---

## 📁 Folder Structure

```
ConsultBridge/
├── app/                         # Next.js app routes & layouts
│   ├── api/                     # API routes (backend logic)
│   ├── consultancies/           # Public listings and profile pages
│   ├── book-appointment/        # Appointment booking flow
│   └── layout.tsx               # Root layout wrapper
├── components/                  # Reusable React components
├── lib/                         # Utility functions (PDF, DB, etc.)
├── models/                      # Mongoose schemas and TS interfaces
├── styles/                      # Tailwind & global styles
├── middleware.ts                # Global middleware (auth, logging)
├── migrate.js                   # DB seeding and migration script
├── next.config.js               # Next.js settings
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── README.md                    # ← You are here
```

---

## ⚙️ Getting Started

> **Minimum Requirements:** Node.js v16+, npm/Yarn, MongoDB Atlas or local instance

### 1. Clone the Repository

```bash
git clone https://github.com/AnshTank/ConsultBridge.git
cd ConsultBridge
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
# Then edit `.env` with:
# MONGODB_URI=
# JWT_SECRET=
# OLLAMA_API_URL=
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app in your browser.

---

## 🧠 How to Use

1. 🔍 Browse or search consultancies by category.
2. 💬 Chat with the AI chatbot to describe your needs.
3. 📄 View profile details: expertise, pricing, reviews, and availability.
4. 📅 Book an online or offline appointment.
5. 📊 Manage your history and bookings via the dashboard.

---

## 🧱 Core Components

| Component                   | Path                                | Role                                 |
| -------------------------- | ----------------------------------- | ------------------------------------ |
| `Chatbot.tsx`              | `components/Chatbot.tsx`            | Interactive chatbot using Ollama AI  |
| `ConsultancyCard.tsx`      | `components/ConsultancyCard.tsx`    | Cards for listing consultancies      |
| `AppointmentBooking.tsx`   | `components/AppointmentBooking.tsx` | Booking form with calendar picker    |
| `ConsultancyProfile.tsx`   | `components/ConsultancyProfile.tsx` | Full profile page of consultancy     |

---

## 🔌 API Overview

| Method | Endpoint                         | Description                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/api/consultancies`             | Fetch all consultancies              |
| GET    | `/api/consultancies/:id`         | Get details of one consultancy       |
| POST   | `/api/consultancies`             | Add new consultancy (Admin only)     |
| PUT    | `/api/consultancies/:id`         | Update consultancy details           |
| DELETE | `/api/consultancies/:id`         | Delete a consultancy                 |
| POST   | `/api/bookings`                  | Create a booking                     |
| GET    | `/api/bookings/user/:userId`     | Retrieve bookings for specific user  |

---

## 🚢 Deployment Guide

### Frontend

- Hosted on [**Vercel**](https://vercel.com)
- GitHub → Vercel auto-deployment enabled

### Backend

- Deployed using **Docker** or **Serverless Functions**
- API routes are scalable and secure

### Database

- MongoDB Atlas (Cloud-hosted, replica-set enabled)
- Can be switched to local DB for testing

---

## 🤝 Contributing

We welcome contributions from the community!

### Steps:

1. Fork this repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: Add AmazingFeature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request!

**Note:** All changes should align with the codebase's modularity and quality. No unnecessary manipulation or removal of existing modules unless discussed.

---

## 📄 License

This project is licensed under the **MIT License**. See the [`LICENSE`](License.md) file for details.

> Redistribution, manipulation, or use of this code must respect the license terms. Unauthorized commercial use is strictly prohibited.

---

## 📬 Contact

Developed with ❤️ by **Ansh Tank**

- GitHub: [@AnshTank](https://github.com/AnshTank)
- LinkedIn: [@anshtank9](https://www.linkedin.com/in/anshtank9)

> *Bridging users with the right consultancies — faster, smarter, and simpler.*

---
