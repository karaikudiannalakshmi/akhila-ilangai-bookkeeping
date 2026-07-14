// Seed data for Funds and Chart of Accounts
// category: 'Revenue' or 'Capital'
// type: 'Income' or 'Expense'

export const FUNDS = [
  { id: 'temple', name: 'Temple Fund' },
  { id: 'general', name: 'General Fund' },
  { id: 'building', name: 'Building Fund' },
  { id: 'property', name: 'Property Fund' },
]

export const DEFAULT_LOCATIONS = [
  { name: 'Colombo (Head Office)' },
  { name: 'Aishwarya Lakshmi Temple - Colombo' },
  { name: 'Jaffna Building' },
  { name: 'Kilinochchi Training Centre' },
]

export const DEFAULT_HEADS = [
  // Temple Fund - Income
  { name: 'Hundial Collection', type: 'Income', category: 'Revenue', fundId: 'temple' },
  { name: 'Pooja & Ritual Fees', type: 'Income', category: 'Revenue', fundId: 'temple' },
  { name: 'Festival Collections', type: 'Income', category: 'Revenue', fundId: 'temple' },
  { name: 'Temple Donations - General', type: 'Income', category: 'Revenue', fundId: 'temple' },
  { name: 'Annadhanam/Prasadam Contributions', type: 'Income', category: 'Revenue', fundId: 'temple' },

  // Temple Fund - Expense
  { name: 'Pooja Materials', type: 'Expense', category: 'Revenue', fundId: 'temple' },
  { name: 'Prasadam / Annadhanam Provisions', type: 'Expense', category: 'Revenue', fundId: 'temple' },
  { name: 'Priest Honorarium', type: 'Expense', category: 'Revenue', fundId: 'temple' },
  { name: 'Festival Expenses', type: 'Expense', category: 'Revenue', fundId: 'temple' },
  { name: 'Temple Maintenance & Repairs', type: 'Expense', category: 'Revenue', fundId: 'temple' },
  { name: 'Temple Renovation / Major Works', type: 'Expense', category: 'Capital', fundId: 'temple' },

  // General Fund - Income
  { name: 'General Donations', type: 'Income', category: 'Revenue', fundId: 'general' },
  { name: 'Membership Subscriptions', type: 'Income', category: 'Revenue', fundId: 'general' },
  { name: 'Interest Income', type: 'Income', category: 'Revenue', fundId: 'general' },
  { name: 'Sale of Publications/Items', type: 'Income', category: 'Revenue', fundId: 'general' },
  { name: 'Grants Received', type: 'Income', category: 'Revenue', fundId: 'general' },
  { name: 'Miscellaneous Income', type: 'Income', category: 'Revenue', fundId: 'general' },

  // General Fund - Expense
  { name: 'Staff Salaries', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'EPF / ETF Contribution', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Office Supplies & Stationery', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Electricity & Water', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Telephone & Internet', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Bank Charges', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Audit & Professional Fees', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Insurance', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Statutory / Compliance Fees', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Community Welfare / Charity Disbursements', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Miscellaneous Expenses', type: 'Expense', category: 'Revenue', fundId: 'general' },
  { name: 'Office Equipment / Furniture', type: 'Expense', category: 'Capital', fundId: 'general' },

  // Building Fund
  { name: 'Building Fund Donations', type: 'Income', category: 'Revenue', fundId: 'building' },
  { name: 'Building Repairs (Routine)', type: 'Expense', category: 'Revenue', fundId: 'building' },
  { name: 'Building Construction / Major Renovation', type: 'Expense', category: 'Capital', fundId: 'building' },

  // Property Fund
  { name: 'Rent Income', type: 'Income', category: 'Revenue', fundId: 'property' },
  { name: 'Property Maintenance', type: 'Expense', category: 'Revenue', fundId: 'property' },
  { name: 'Property Tax / Rates & Assessments', type: 'Expense', category: 'Revenue', fundId: 'property' },
  { name: 'Security Expenses', type: 'Expense', category: 'Revenue', fundId: 'property' },
  { name: 'Property Improvements', type: 'Expense', category: 'Capital', fundId: 'property' },
]

export const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer', 'Online']
