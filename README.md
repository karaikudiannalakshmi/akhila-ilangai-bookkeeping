# Akhila Ilangai Kamban Kazhakam — Bookkeeping

Bookkeeping app for Akhila Ilangai Kamban Kazhakam, Colombo (running Aishwarya Lakshmi Temple),
covering daily income/expense entry, ledger, trial balance, expenditure analysis, rent collection
for the rented property, and a fixed assets register for capital items.

## Stack
React + Vite + Firebase Firestore + Vercel.

## Bilingual (English / Tamil)
Every screen — Dashboard, Cash Book, Bank Book, All Entries, Ledgers, Income & Expenditure
Account, Balance Sheet, Fixed Assets, Rent Collection, Opening Balances, and Admin — is available
in both English and Tamil. Toggle with the **EN / த** button in the top-right corner (also on the
login screen). The choice is remembered per device (stored in the browser, not per-user). Data you
type yourself — branch names, head names, property names, narrations — stays exactly as entered in
whichever language you typed it; only the app's own labels, buttons, and messages are translated.
Add new terms in `src/i18n/translations.js` if you introduce new heads/branches you'd like labeled
bilingually elsewhere in the app.

## Financial Year & period selection
The trust's financial year runs **1 April to 31 March**. Every report — Cash Book, Bank Book,
All Entries, Ledgers, Trial Balance, Balance Sheet, Fixed Assets, Expenditure Analysis — has a
period selector defaulting to the **current Financial Year**, with the option to switch to a
specific **Month** or a **custom date Range**.

Opening balances carry forward automatically: whichever period you select, the "Opening (Carried
Forward)" figure shown is computed from your one-time manually entered Opening Balances (from the
last physical balance sheet) plus every transaction that happened before that period started —
there's no manual year-end closing step. The Balance Sheet additionally shows Opening → Movement
→ Closing columns for Funds, Fixed Assets, Cash, and Bank for the selected period.

## Structure
- **Branches**: Head Office - Colombo, Aishwarya Lakshmi Temple - Colombo, Jaffna, Kilinochchi
  Training Centre. Manage these under Admin — add, edit, disable, or delete branches as needed.
- **Heads are generic and shared across all branches** — a short, single list (e.g. "Donations",
  "Rent Income", "Maintenance & Repairs") rather than a duplicate head per branch. When entering a
  transaction, you pick a Head and a Branch independently — e.g. Colombo property rent is entered
  under the generic "Rent Income" head, Branch = Head Office. Each head is marked Revenue or Capital.
- Contra entries (cash ⇄ bank transfers) also pick a Branch directly, same as regular entries.
- Capital items are excluded from the Trial Balance and tracked in Fixed Assets instead.
- Rent income is tracked per property/tenant.

### Legacy data note
Entries and heads created before the Fund→Branch merge, or during the brief period where heads
were branch-specific, are automatically mapped to the closest matching Branch for reporting
purposes — no manual migration needed. Duplicate branch-specific heads from that period (e.g. an
old "Jaffna Donations" head) can be safely deleted under Admin once you've switched to using the
generic "Donations - General" head with Branch selected separately.

## Entry classification
When adding an entry in Cash Book or Bank Book, you now pick one of four **Classifications** first:
- **Income** — money coming in (donations, hundial, rent, etc.)
- **Expenses** — day-to-day operating costs
- **Assets** — capital/asset-building expenditure (renovation, equipment, property improvements) —
  these are excluded from the Income & Expenditure Account and tracked under Fixed Assets instead
- **Liabilities** — loans/creditors. A Liability head can represent money received (marked "In" —
  e.g. a loan taken) or money repaid (marked "Out" — e.g. a loan installment); both directions live
  under the same Liabilities classification, distinguished per head
Choosing a classification narrows the Head dropdown to only the heads tagged under it. Set up
Liability heads under Admin (Category: Liability) once you're ready to track loans/creditors —
there's no dedicated Liabilities register (like Fixed Assets has) yet; let me know if you want one.
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
- **Ledgers** — head-wise account statement with running total, filterable by Branch
- **Income & Expenditure Account** — the main P&L report. Top table respects a Branch filter
  (pick one branch, or "All Branches (Consolidated)"). Below it, a Branch-wise Comparison always
  shows every branch side by side with a consolidated Total column, regardless of the filter above.
- **Balance Sheet** — Funds & Liabilities broken out per branch with a consolidated total; Cash and
  Bank shown consolidated only (held centrally, not per branch); Fixed Assets shown both
  consolidated and broken out per branch.

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
