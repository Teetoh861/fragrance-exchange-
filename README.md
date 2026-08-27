# Fragrance Exchange

A Vinted-style marketplace for niche, designer, and Arabian fragrances — buy,
sell, and swap perfumes you don't wear anymore.

This is the v1 MVP: prove people will list, buy, and swap before adding
anything else.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind
- **Prisma** ORM on **Neon Postgres** — pooled connection for app traffic
  (`DATABASE_URL`), direct connection for schema pushes
  (`DATABASE_URL_UNPOOLED`) — see `prisma/schema.prisma`
- **NextAuth v5** — email/password (credentials) + optional Google OAuth
- **Paystack** for Buy Now and swap cash top-ups
- **Neon Object Storage** (S3-compatible) for listing/shipment photo
  uploads — see `lib/storage.ts` and `neon.ts`

This project is wired to the **Fragrance exchange** Neon project
(`dry-union-17650627`, org `org-snowy-breeze-58936628`, region
`us-east-2`). `neon.ts` declares the `uploads` bucket as infrastructure
as code; reconcile it against the linked branch with the Neon CLI:

```bash
neon link      # once, links this workspace to the project/branch
neon deploy    # provisions the uploads bucket, pulls env into .env.local
```

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL(_UNPOOLED), AUTH_SECRET, ADMIN_EMAIL, AWS_*, etc.
npx prisma db push     # syncs the schema to Neon Postgres
pnpm dev
```

`pnpm build` also runs `prisma db push` automatically, so a first deploy
provisions its tables without a separate migration step.

### Deploying (e.g. to Vercel)

Vercel's serverless functions have no writable/persistent local disk, so
this **must** run against Neon (not SQLite, not local disk for uploads).
Set these as environment variables on the Vercel project (not just in a
local `.env`) — get them from the Neon console (Connect, and the Storage
tab for the `uploads` bucket) or `neon env pull`:

- `DATABASE_URL` / `DATABASE_URL_UNPOOLED` — Neon Postgres connection strings
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_ENDPOINT_URL_S3` /
  `AWS_REGION` — Neon Object Storage credentials for the `uploads` bucket
- `AUTH_SECRET` — a long random string (`openssl rand -base64 32`)
- `ADMIN_EMAIL` — the email that should auto-promote to admin
- `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — optional;
  without these, Buy Now and swap top-ups run in mock instant-pay mode

Sign up with the email set as `ADMIN_EMAIL` in `.env` to get an admin
account automatically — visit `/admin` to review listings, watch orders,
resolve disputes, and track manual payouts.

### Paystack

Without `PAYSTACK_SECRET_KEY` set, Buy Now and swap cash top-ups run in a
**mock mode**: payment is treated as instantly successful so you can test
the rest of the flow locally. Add real (test) keys from the
[Paystack dashboard](https://dashboard.paystack.com) to exercise the real
checkout redirect + verification flow.

## Core flows

- **Seller**: sign up → create listing (4 required photos: front, back,
  base/batch code, cap) → Pending Review → admin approves/rejects → live →
  buyer purchases or proposes a swap → seller ships with proof photo +
  tracking number → buyer confirms receipt → seller queued for manual
  payout.
- **Buyer**: browse/search → listing detail → Buy Now (Paystack) or
  Propose Swap → order status timeline (Paid → Shipped → Completed) →
  confirm receipt or open a dispute.
- **Swap**: buyer offers one of their own live listings + optional cash
  top-up → owner accepts/declines → on acceptance both listings are
  reserved and two mirrored orders are created so each side ships and
  confirms receipt independently, just like a normal purchase.

## Trust & safety, as implemented

- Listings are **photo-reviewed, not physically authenticated** — stated
  on every listing page and in the site footer.
- Payment is **held, not escrowed** — described plainly in-app as "we hold
  payment until you confirm delivery, then release it to the seller," never
  as licensed escrow.
- Orders above ₦50,000 nudge the buyer to record an unboxing video
  (`UNBOXING_VIDEO_THRESHOLD` in `lib/constants.ts`).
- The dispute form states up front that "I don't like the smell" isn't a
  valid reason.
- Payouts are manual: an admin marks each completed order "Paid Out" from
  `/admin` after sending the seller their money outside the app.

## Scope

Out of scope for this MVP by design: a mobile app, AI recommendations or
photo screening, physical authentication partnerships, licensed escrow,
multi-way swap matching, and a full admin dashboard beyond listing/order/
dispute review.
