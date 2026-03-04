# MangaVault Frontend

Next.js 15 App Router UI with PWA, i18n (Arabic/English), RTL support, and client-side downloads (ZIP/CBZ/PDF).

## Local development

```bash
pnpm install
pnpm dev
```

## Deploy on Vercel

1) Set `NEXT_PUBLIC_MANGAVAULT_API_URL` to your Cloudflare Worker URL.
2) Deploy the `frontend/` directory as a Next.js project.
