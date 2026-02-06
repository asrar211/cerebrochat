# CerebroChat

A calm, private mental-health screening experience built with Next.js, MongoDB, and NextAuth.

## Tech Stack
- Next.js App Router
- TypeScript + Tailwind CSS
- MongoDB (Mongoose)
- NextAuth credentials provider

## Local Development
1. Install dependencies.
2. Create a `.env.local` file with the required environment variables.
3. Run the dev server.

```bash
npm run dev
```

The app runs on `http://localhost:4000`.

## Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
```

## Notes
- The screening summary is not a medical diagnosis.
- Question ordering is controlled by the `order` field on `Question` documents.
