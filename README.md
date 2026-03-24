# Magilu App

Shoe inventory management web app built with Next.js, Prisma, and SQLite.

---

## Option 1 — Docker (recommended)

**Requirements:** [Docker](https://www.docker.com/get-started) + Docker Compose

**1. Clone the repo**
```bash
git clone https://github.com/the-eagle-eye/magilu-app.git
cd magilu-app
```

**2. Create a `.env` file** in the root:
```env
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@magilu.com
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
```

> To generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
> To generate `ADMIN_PASSWORD_HASH`: use [bcrypt-generator.com](https://bcrypt-generator.com) or `htpasswd -bnBC 10 "" yourpassword | tr -d ':\n'`

**3. Start the app**
```bash
docker compose up -d
```

App runs at [http://localhost:3000](http://localhost:3000). Data persists in `./data/`.

**Stop the app**
```bash
docker compose down
```

---

## Option 2 — Local Development

**Requirements:** [Node.js 20+](https://nodejs.org)

**1. Clone & install dependencies**
```bash
git clone https://github.com/the-eagle-eye/magilu-app.git
cd magilu-app
npm install
```

**2. Create a `.env.local`** file in the root:
```env
DATABASE_URL=file:./prisma/data/dev.db
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@magilu.com
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here
```

**3. Run database migrations**
```bash
npx prisma migrate deploy
```

**4. Start the development server**
```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Tech Stack

- [Next.js 16](https://nextjs.org) — React framework
- [Prisma](https://www.prisma.io) — ORM + SQLite database
- [NextAuth.js](https://next-auth.js.org) — Authentication
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [React PDF](https://react-pdf.org) — PDF generation
