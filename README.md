<div align="center">

<h1>Barangay Konek</h1>

<p>Designed for transparency. Built for communities. Secured by blockchain.</p>

<p>
  <a href="https://github.com/othneildrew/Best-README-Template"><strong>Explore the docs »</strong></a>
  <br />
  <a href="https://github.com/othneildrew/Best-README-Template">View Demo</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</p>

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
</p>

</div>

---

**Barangay Konek** is an open-source digital governance platform that bridges local governance and technology through **Next.js**, **Supabase**, and **Blockchain**.  
It empowers barangays and their residents with a secure, transparent, and decentralized system for document requests, record management, and blockchain-verified certificates.

## 📖 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Development Guidelines](#-development-guidelines)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)
- [Community](#-community)
- [Acknowledgements](#-acknowledgements)

---

## 🌍 Overview

Barangay Konek aims to **digitize barangay operations** by enabling residents to submit, track, and verify their document requests online — while empowering barangay officials to manage approvals efficiently.  
All issued certificates are **blockchain-verified**, ensuring authenticity and transparency across the process.

### 🎯 Core Objectives
- Digitize barangay processes such as clearance, residency, and indigency certificates  
- Provide residents with real-time request tracking  
- Enable blockchain-secured certificate issuance  
- Simplify records management for officials  
- Promote transparency and accountability through open-source technology  

---

## ⚙️ Core Features

| Category | Description |
|-----------|-------------|
| 🧾 **Resident Portal** | Request, track, and download barangay certificates |
| 🧑‍💼 **Official Dashboard** | Manage, approve, and issue requests digitally |
| 🔗 **Blockchain Integration** | Verifiable certificates stored on-chain |
| 🔒 **Secure Authentication** | Supabase Auth with role-based access |
| 🧠 **Server-Side First** | All sensitive logic handled securely on the server |
| 🎨 **Unified Design System** | Consistent UI via Tailwind CSS + shadcn/ui |

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Framework** | [Next.js 14+ (App Router)](https://nextjs.org) |
| **UI System** | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Backend & Database** | [Supabase](https://supabase.com) |
| **Blockchain Layer** | [Ethereum / Lisk Testnet](https://lisk.com) |
| **Language** | TypeScript |
| **Auth System** | Supabase Auth |
| **Package Manager** | pnpm |

---

## 🏗️ Architecture Overview

Barangay Konek follows a **Server-Side First Architecture**, ensuring secure data handling and a clear separation between presentation and business logic.

```

BARANGAY-KONEK/
├── .next/
├── .source/
├── blockchain/
├── content/
│   └── docs/
│       ├── api/
│       ├── blockchain/
│       ├── development/
│       ├── features/
│       └── user-guides/
├── node_modules/
├── public/
├── src/
│   └── app/
│       ├── (resident)/
│       │   ├── requests/
│       │   ├── certificates/
│       │   └── dashboard/
│       ├── (official)/
│       │   ├── requests/
│       │   ├── certificates/
│       │   └── dashboard/
│       └── api/
│           └── blockchain/
├── server/
│   ├── auth/
│   ├── certificate/
│   ├── request/
│   └── user/
└── lib/
    ├── utils/
    ├── schemas/
    ├── supabase/
    └── constants/

```

### 💡 Design Principles

1. **Server-Side First** — all sensitive logic runs on the server  
2. **Single Responsibility** — one purpose per file  
3. **Strict Type Safety** — every function and schema validated with TypeScript + Zod  
4. **No Inline Styles** — design system only via Tailwind variables  
5. **Reusable UI Components** — built from shadcn/ui foundations  

---

## 🧱 Development Guidelines

To ensure maintainability and consistency across contributors, Barangay Konek enforces the following conventions:

1. **Server logic →** inside `/server`  
2. **UI logic →** inside `/app/(role)/_components`  
3. **Shared utilities →** inside `/lib`  
4. **Always check existing logic** before creating new ones  
5. **Use Tailwind variables** like `text-primary`, `bg-surface`, etc.  
6. **No inline, external, or internal CSS**  
7. **Prefer SSR (Server-Side Rendering)** over CSR  

📘 For full details, see:  
[`docs/development-guidelines.md`](./docs/development-guidelines.md)

---

## 📂 Project Structure

```

barangay-konek/
├── app/                # Next.js App Router pages
├── server/             # Supabase & blockchain logic
├── lib/                # Shared utilities and schemas
├── components/         # Shared UI components
├── public/             # Static assets
├── docs/               # Developer documentation
├── .env.local.example  # Sample environment file
└── README.md

````

---

## 🧰 Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/barangay-konek/barangay-konek.git
cd barangay-konek
````

### 2️⃣ Install Dependencies

```bash
pnpm install
```

### 3️⃣ Setup Environment

Copy `.env.local.example` → `.env.local` and update the credentials.

### 4️⃣ Run Development Server

```bash
pnpm dev
```

### 5️⃣ Build for Production

```bash
pnpm build && pnpm start
```

---

## 🔑 Environment Variables

| Variable                          | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase public anon key                     |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase admin service key                   |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL`     | Blockchain RPC endpoint                      |
| `NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY` | Private key for blockchain wallet            |
| `NEXT_PUBLIC_BLOCKCHAIN_CONTRACT` | Smart contract address                       |
| `NEXT_PUBLIC_SITE_URL`            | Base site URL (e.g. localhost or production) |

⚠️ **Note:** Never commit `.env.local` files to version control.

---

## 🤝 Contributing

Contributions are welcome! Help improve Barangay Konek by fixing bugs, improving documentation, or building new features.

### Steps to Contribute

1. **Fork** the repository
2. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit your changes**

   ```bash
   git commit -m "feat: add blockchain verification for certificates"
   ```
4. **Push to your fork**

   ```bash
   git push origin feature/your-feature
   ```
5. **Submit a Pull Request**

For details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 💬 Community

* 💻 GitHub Issues: [Report bugs or request features](https://github.com/barangay-konek/barangay-konek/issues)
* 🧠 Discussions: [Join the conversation](https://github.com/barangay-konek/barangay-konek/discussions)
* 🌐 Website: Coming Soon

---

## 🙏 Acknowledgements

* Built with ❤️ by open-source contributors
* Powered by [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and [Lisk Blockchain](https://lisk.com)
* Inspired by the vision of transparent and efficient local governance

---

## 🚀 Roadmap

* ✅ Blockchain integration for certificate verification
* ✅ Resident & official dashboards
* ✅ Role-based access system
* 🔜 Barangay analytics and statistics
* 🔜 Mobile responsiveness and offline support
* 🔜 Barangay-to-city digital linkage

---
### 💡 “Empowering barangays through technology — one certificate at a time.”
