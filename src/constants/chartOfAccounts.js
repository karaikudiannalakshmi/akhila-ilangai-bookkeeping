// Seed data for the default Chart of Accounts (Income/Expense heads).
// Heads are generic and shared across all branches — when posting an entry,
// you pick a Head and a Branch independently (e.g. "Rent Income" entered
// under the Head Office branch). This keeps the head list short even as
// branches are added.
// category: 'Revenue' or 'Capital'
// type: 'Income' or 'Expense'

export const DEFAULT_HEADS = [
  // Income
  { name: 'Hundial Collection', type: 'Income', category: 'Revenue' },
  { name: 'Pooja & Ritual Fees', type: 'Income', category: 'Revenue' },
  { name: 'Festival Collections', type: 'Income', category: 'Revenue' },
  { name: 'Donations - General', type: 'Income', category: 'Revenue' },
  { name: 'Annadhanam/Prasadam Contributions', type: 'Income', category: 'Revenue' },
  { name: 'Membership Subscriptions', type: 'Income', category: 'Revenue' },
  { name: 'Interest Income', type: 'Income', category: 'Revenue' },
  { name: 'Sale of Publications/Items', type: 'Income', category: 'Revenue' },
  { name: 'Grants Received', type: 'Income', category: 'Revenue' },
  { name: 'Rent Income', type: 'Income', category: 'Revenue' },
  { name: 'Miscellaneous Income', type: 'Income', category: 'Revenue' },

  // Expense - Revenue
  { name: 'Pooja Materials', type: 'Expense', category: 'Revenue' },
  { name: 'Prasadam / Annadhanam Provisions', type: 'Expense', category: 'Revenue' },
  { name: 'Priest Honorarium', type: 'Expense', category: 'Revenue' },
  { name: 'Festival Expenses', type: 'Expense', category: 'Revenue' },
  { name: 'Maintenance & Repairs', type: 'Expense', category: 'Revenue' },
  { name: 'Staff Salaries', type: 'Expense', category: 'Revenue' },
  { name: 'EPF / ETF Contribution', type: 'Expense', category: 'Revenue' },
  { name: 'Office Supplies & Stationery', type: 'Expense', category: 'Revenue' },
  { name: 'Electricity & Water', type: 'Expense', category: 'Revenue' },
  { name: 'Telephone & Internet', type: 'Expense', category: 'Revenue' },
  { name: 'Bank Charges', type: 'Expense', category: 'Revenue' },
  { name: 'Audit & Professional Fees', type: 'Expense', category: 'Revenue' },
  { name: 'Insurance', type: 'Expense', category: 'Revenue' },
  { name: 'Statutory / Compliance Fees', type: 'Expense', category: 'Revenue' },
  { name: 'Community Welfare / Charity Disbursements', type: 'Expense', category: 'Revenue' },
  { name: 'Property Tax / Rates & Assessments', type: 'Expense', category: 'Revenue' },
  { name: 'Security Expenses', type: 'Expense', category: 'Revenue' },
  { name: 'Miscellaneous Expenses', type: 'Expense', category: 'Revenue' },

  // Expense - Capital
  { name: 'Renovation / Major Works', type: 'Expense', category: 'Capital' },
  { name: 'Office Equipment / Furniture', type: 'Expense', category: 'Capital' },
  { name: 'Property Improvements', type: 'Expense', category: 'Capital' },
]

export const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer', 'Online']
