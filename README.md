<div align="center">

<h1>Barangay Konek</h1>

**Designed for transparency. Built for communities. Secured by blockchain.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-active-success.svg)

[📘 Explore Docs »](./docs/development-guidelines.md) ·
[🐞 Report Bug](https://github.com/barangay-konek/barangay-konek/issues/new?labels=bug&template=bug-report---.md) ·
[💡 Request Feature](https://github.com/barangay-konek/barangay-konek/issues/new?labels=enhancement&template=feature-request---.md)

</div>

---

## 📖 Table of Contents

* [Overview](#-overview)
* [Core Features](#-core-features)
* [Tech Stack](#-tech-stack)
* [System Architecture](#-system-architecture)
* [Impact & Technology Use](#-impact--technology-use)
* [Development Guidelines](#-development-guidelines)
* [Project Structure](#-project-structure)
* [Setup & Installation](#-setup--installation)
* [Environment Variables](#-environment-variables)
* [Updating Documentation](#-updating-documentation)
* [Contributing](#-contributing)
* [Code of Conduct](#-code-of-conduct)
* [License](#-license)
* [Community](#-community)
* [Acknowledgements](#-acknowledgements)
* [Roadmap](#-roadmap)

---

## 🌍 Overview

**Barangay Konek** is an open-source digital governance platform that bridges **local governance** and **technology** using **Next.js**, **Supabase**, and **Blockchain**.

It empowers barangays and residents with a secure, transparent, and decentralized system for:

* Submitting and tracking requests online
* Managing approvals by officials
* Issuing blockchain-verified barangay certificates

### 🎯 Core Objectives

* Digitize barangay processes (clearance, residency, indigency)
* Provide residents real-time tracking of requests
* Issue blockchain-secured and verifiable documents
* Simplify administrative operations for officials
* Promote transparency and trust through open-source technology

---

## ⚙️ Core Features

| Category                      | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| 🧾 **Resident Portal**        | Request, track, and download barangay certificates   |
| 🧑‍💼 **Official Dashboard**  | Manage, approve, and issue requests digitally        |
| 🔗 **Blockchain Integration** | Blockchain-based certificate verification            |
| 🔒 **Secure Authentication**  | Role-based access using Supabase Auth                |
| 🧠 **Server-Side First**      | All sensitive logic processed securely on the server |
| 🎨 **Unified Design System**  | Tailwind CSS + shadcn/ui for consistent UI           |

---

## 🧩 Tech Stack

| Layer                  | Technology                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Framework**          | [Next.js 14+ (App Router)](https://nextjs.org)                               |
| **UI System**          | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Backend & Database** | [Supabase](https://supabase.com)                                             |
| **Blockchain Layer**   | [Ethereum / Lisk Testnet](https://lisk.com)                                  |
| **Language**           | TypeScript                                                                   |
| **Auth System**        | Supabase Auth                                                                |
| **Package Manager**    | pnpm                                                                         |

---

## 🏗️ System Architecture

### 🔹 High-Level Overview

Barangay Konek adopts a **Server-Side First Architecture** ensuring data security and separation of responsibilities.

```
BARANGAY-KONEK/
├── src/app/                 # Next.js App Router (Resident & Official views)
│   ├── (resident)/          # Resident pages: requests, certificates, dashboard
│   ├── (official)/          # Official pages: requests, certificates, dashboard
│   └── api/blockchain/      # Blockchain interaction endpoints
├── server/                  # Business logic: auth, request, certificate
├── lib/                     # Utilities, schemas, Supabase config, constants
├── content/docs/            # Developer & user documentation
└── blockchain/              # Smart contract and blockchain interaction logic
```
### 🔹 Component Responsibilities

| Component        | Responsibility                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `app/(resident)` | UI for residents to **submit**, **track**, and **download** barangay document requests                      |
| `app/(official)` | Dashboard for barangay officials to **review**, **approve**, and **issue** certificates                     |
| `app/(admin)`    | Admin console for managing **users**, **roles**, **system configurations**, and **global reports**          |
| `server/`        | Core backend logic — handles **authentication**, **requests**, **blockchain sync**, and **data processing** |
| `lib/`           | Shared **utilities**, **validation schemas**, and **constants** for client/server integration               |
| `blockchain/`    | Smart contract and **on-chain verification** of barangay-issued certificates                                |
| `content/docs/`  | Developer and **user documentation**, including guides and architectural references                         |
| `public/`        | Static assets like images, icons, and metadata used across the site                                         |

---

## 🌐 Impact & Technology Use

Barangay Konek effectively leverages **modern open-source technologies** to promote **digital transparency** in local governance.

| Technology               | Effective Use                                                               |
| ------------------------ | --------------------------------------------------------------------------- |
| **Next.js**              | Enables fast, server-side rendered interfaces for residents and officials   |
| **Supabase**             | Provides authentication, real-time data sync, and secure PostgreSQL backend |
| **Blockchain**           | Ensures tamper-proof verification of barangay certificates                  |
| **Tailwind + shadcn/ui** | Maintains design consistency and responsive layouts                         |
| **TypeScript + Zod**     | Guarantees strict type safety and predictable data validation               |

---

## 🧱 Development Guidelines

To maintain consistency:

1. **Server logic →** `/server`
2. **UI logic →** `/app/(role)/_components`
3. **Shared utilities →** `/lib`
4. **Use Tailwind tokens**, avoid inline CSS
5. **Prefer SSR over CSR**
6. **One responsibility per file**

📘 Full guide: [docs/development-guidelines.md](./docs/development-guidelines.md)

---

## 📂 Project Structure

```
barangay-konek/
├── app/                # Next.js routes
├── server/             # API & logic
├── lib/                # Utilities & schemas
├── components/         # Shared components
├── docs/               # Documentation files
├── public/             # Assets
└── README.md
```

---

## 🧰 Setup & Installation

```bash
# 1️⃣ Clone Repository
git clone https://github.com/barangay-konek/barangay-konek.git
cd barangay-konek

# 2️⃣ Install Dependencies
pnpm install

# 3️⃣ Setup Environment
cp .env.local.example .env.local

# 4️⃣ Run Development Server
pnpm dev

# 5️⃣ Build for Production
pnpm build && pnpm start
```

---

## 🔑 Environment Variables

| Variable | Description |
| :--- | :--- |
| **Supabase & Backend** | |
| `NEXT_PUBLIC_SUPABASE_URL` | The **public** URL for your Supabase project instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **public** anonymous key for client-side Supabase access. |
| `SUPABASE_SERVICE_ROLE_KEY` | The **private** Service Role Key for administrative backend access. |
| **Blockchain (Sepolia)** | |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | The **public** RPC endpoint (e.g., Alchemy/Infura) for the Sepolia testnet or target EVM chain. |
| `NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY` | The **private** key for the deployment or transaction signing wallet. |
| `NEXT_PUBLIC_CHAIN_ID` | The **public** numeric ID for the target blockchain network (e.g., `11155111` for Sepolia). |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | The **public** address of your deployed smart contract. |
| **Email/SMTP** | |
| `NEXT_PUBLIC_SMTP_HOST` | The SMTP server host address for sending emails. |
| `NEXT_PUBLIC_SMTP_PORT` | The SMTP server port (e.g., `587`). |
| `NEXT_PUBLIC_SMTP_USER` | The username/email used to authenticate with the SMTP server. |
| `NEXT_PUBLIC_SMTP_PASS` | The password or API key for SMTP server authentication. |
| **AI (Gemini)** | |
| `GEMINI_API_KEY` | Your **private** API key for authenticating with the Gemini API. |
| `GEMINI_API_URL` | The base URL for the Gemini API endpoint (optional, usually default). |
| `GEMINI_MODEL` | The specific Gemini model identifier to be used (e.g., `gemini-2.5-flash`). |

---
⚠️ **Note:** Never commit `.env.local` files to version control.

## 📝 Updating Documentation

To keep documentation accurate:

1. Update `.md` files in `/docs/`
2. Follow the style of `docs/development-guidelines.md`
3. Run:

```bash
pnpm format-docs
```

4. Submit changes via Pull Request with tag:
   `docs: update documentation`

---

## 🤝 Contributing

Contributions are **highly welcome!**
Follow these steps:

1. **Fork** the repo
2. **Create a branch**

   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit changes**

   ```bash
   git commit -m "feat: add blockchain certificate verification"
   ```
4. **Push & Create PR**

   ```bash
   git push origin feature/your-feature
   ```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full contribution rules.

---

## 📜 Code of Conduct

We are committed to fostering a welcoming and respectful environment.
Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

---

## ⚖️ License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 💬 Community

* 💻 [GitHub Issues](https://github.com/barangay-konek/barangay-konek/issues)
* 🧠 [Discussions](https://github.com/barangay-konek/barangay-konek/discussions)
* 🌐 Website: *Coming Soon*

---

## 🙏 Acknowledgements

* Built with ❤️ by open-source contributors
* Powered by **Next.js**, **Supabase**, and **Lisk Blockchain**
* Inspired by the vision of transparent and efficient governance

---

## 🚀 Roadmap

* ✅ Blockchain verification for certificates
* ✅ Resident & official dashboards
* ✅ Role-based access system
* 🔜 Analytics & statistics
* 🔜 Mobile responsiveness and offline mode
* 🔜 City-level data integration

---

> 💡 *“Empowering barangays through technology — one certificate at a time.”*

---
