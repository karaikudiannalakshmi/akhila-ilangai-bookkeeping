# Akhila Ilangai Kamban Kazhakam — Bookkeeping

Bookkeeping app for Akhila Ilangai Kamban Kazhakam, Colombo (running Aishwarya Lakshmi Temple),
covering daily income/expense entry, ledger, trial balance, expenditure analysis, rent collection
for the rented property, and a fixed assets register for capital items.

## Stack
React + Vite + Firebase Firestore + Vercel.

## Structure
- Funds: Temple Fund, General Fund, Building Fund, Property Fund
- Centres: Colombo (Head Office), Aishwarya Lakshmi Temple - Colombo, Jaffna Building, Kilinochchi Training Centre
- Each income/expense head belongs to a Fund and is marked Revenue or Capital
- Capital items are excluded from the Trial Balance and tracked in Fixed Assets instead
- Rent income is tracked per property/tenant

## Entry workflow
All entries are added, edited, and deleted from **Cash Book** (Cash-mode transactions) or
**Bank Book** (Cheque / Bank Transfer / Online transactions). There is no separate "Daily Entry"
screen. **All Entries** is a read-only consolidated view — since every report reads from the same
underlying data, edits made in Cash Book or Bank Book appear everywhere else (All Entries, Ledgers,
Trial Balance, Balance Sheet, Dashboard) automatically. The date field on every entry is fully
selectable — not locked to today.

## Contra entries (cash ⇄ bank transfers)
Use the **Contra Entry** button in either Cash Book or Bank Book when cash is withdrawn from the
bank or deposited into the bank. A single Contra entry:
- is NOT counted as income or expense anywhere (Trial Balance, Expenditure Analysis, Ledgers, Fund
  Balances all ignore it)
- appears in BOTH the Cash Book and Bank Book, moving in opposite directions in each (e.g. a
  "Cash withdrawn from Bank" shows as a receipt in Cash Book and a payment in Bank Book)
- can be edited or deleted from either book
- shows in All Entries as "Contra" for a full audit trail, without affecting the Income/Expense totals there

## Reports
- **Cash Book** — add/edit/delete Cash-mode entries, with running balance
- **Bank Book** — add/edit/delete Cheque/Bank Transfer/Online entries, with running balance
- **All Entries** — read-only consolidated view with filters
- **Ledgers** — head-wise account statement with running total
- **Trial Balance** — revenue income/expense by head, fund-wise or consolidated
- **Balance Sheet** — Funds & Liabilities vs Assets (Fixed Assets + Cash + Bank) as of any date

## Local setup
```
npm install
cp .env.example .env
# fill in Firebase config values and VITE_APP_PASSWORD in .env
npm run dev
```

## First-time use
After deploying, log in with the app password, go to **Admin**, and click
"Load Default Heads" and "Load Default Centres" to seed the standard chart of accounts and
centre list. Then add your rental property under Admin, and enter opening balances under
**Opening Balances**. Day-to-day entries are made from **Cash Book** or **Bank Book**.

## Firebase setup
1. Create a new Firebase project (Firestore in Native mode).
2. Enable Firestore.
3. Deploy `firestore.rules` (or paste into the Firebase console Rules tab).
4. Copy the web app config into your `.env` / Vercel environment variables.

## Deploying to Vercel
Add these as **plain** environment variables in Vercel (not marked "Sensitive" —
sensitive variables are not exposed to the Vite build):
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_APP_PASSWORD
