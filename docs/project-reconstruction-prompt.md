# Project Reconstruction Prompt: City International Bank

Use this prompt to rebuild or iterate on the "City International Bank" institutional banking platform.

## 1. Core Identity & Tech Stack
- **Name**: City International Bank (International branding: Nexa International).
- **Aesthetic**: Premium, institutional, high-speed banking. Deep blues (City Blue), energetic orange accents (Nexa Orange), glassmorphism, and cinematic imagery.
- **Stack**: Next.js 15 (App Router), Tailwind CSS, Shadcn UI, Lucide Icons, Recharts.
- **Backend**: Firebase Authentication, Firestore.
- **AI**: Genkit (Gemini 2.5 Flash) for support.

## 2. Firestore Data Architecture
Implement a hierarchical, path-based ownership model:
- `/users/{userId}`: `CustomerProfile` (Document ID = Auth UID).
- `/users/{userId}/accounts/{accountId}`: `Account` (Checking, Savings, Investment).
- `/users/{userId}/accounts/{accountId}/transactions/{transactionId}`: `Transaction` (Atomic balance updates).
- `/users/{userId}/cards/{cardId}`: `Card` (Virtual card controls).
- `/roles_admin/{userId}`: Admin privilege markers.

## 3. Security Rules Requirements
- **Owner Access**: Users can only read/write documents where the path contains their `userId`.
- **Admin Bypass**: The email `citybank@gmail.com` must have absolute, high-priority root access (`match /{allPaths=**}`) to perform global collectionGroup audits on accounts and transactions.
- **Integrity**: Transactions must denormalize `customerId` to allow for efficient querying and rule evaluation.

## 4. Key Functionalities
- **Auth**: Email/Password login. Redirect `citybank@gmail.com` to `/dashboard/admin/users` and others to `/dashboard`.
- **Dashboard**: Wealth growth chart (Recharts), Account grid with status indicators, and Recent activity ledger.
- **Transfers**: atomic transaction creation. When a user sends money, subtract from balance AND create a transaction record in a single workflow.
- **Admin Suite**:
    - **User Audit**: Global search of all client profiles.
    - **Asset Audit**: `collectionGroup` query to see every bank account and adjust balances or suspend them.
    - **Transaction Audit**: `collectionGroup` query to view and modify any transaction record for compliance.
- **AI Support**: A sticky chatbot widget using Genkit flows to answer banking FAQs.

## 5. Critical Implementation Pattern: The "Nuclear Guard"
To prevent "Missing or insufficient permissions" errors during route transitions:
- Harden all `useCollection` and `useDoc` hooks.
- If a query reference resolves to the database root or contains `undefined` parameters, the hook must **abort immediately** before calling Firestore.
- This ensures that while the user object is loading, no unauthorized requests are sent.

## 6. Visual Requirements
- **Landing Page**: Cinematic hero section using modern banking imagery. Use backdrop-blur for the navigation and cards.
- **Dashboard Sidebar**: Collapsible navigation with a distinct "Administration" section that only appears for verified admins.
- **Cards**: A high-fidelity "Nexa Platinum" credit card component with interactive "freeze" toggles.
