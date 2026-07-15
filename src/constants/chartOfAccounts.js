// Seed data for the default Chart of Accounts (Income/Expense heads).
// category: 'Revenue' or 'Capital'
// type: 'Income' or 'Expense'
// branchId: matches BRANCH_SEED ids in src/utils/branch.js

export const DEFAULT_HEADS = [
  // Aishwarya Lakshmi Temple - Income
  { name: 'Hundial Collection', type: 'Income', category: 'Revenue', branchId: 'temple' },
  { name: 'Pooja & Ritual Fees', type: 'Income', category: 'Revenue', branchId: 'temple' },
  { name: 'Festival Collections', type: 'Income', category: 'Revenue', branchId: 'temple' },
  { name: 'Temple Donations - General', type: 'Income', category: 'Revenue', branchId: 'temple' },
  { name: 'Annadhanam/Prasadam Contributions', type: 'Income', category: 'Revenue', branchId: 'temple' },

  // Aishwarya Lakshmi Temple - Expense
  { name: 'Pooja Materials', type: 'Expense', category: 'Revenue', branchId: 'temple' },
  { name: 'Prasadam / Annadhanam Provisions', type: 'Expense', category: 'Revenue', branchId: 'temple' },
  { name: 'Priest Honorarium', type: 'Expense', category: 'Revenue', branchId: 'temple' },
  { name: 'Festival Expenses', type: 'Expense', category: 'Revenue', branchId: 'temple' },
  { name: 'Temple Maintenance & Repairs', type: 'Expense', category: 'Revenue', branchId: 'temple' },
  { name: 'Temple Renovation / Major Works', type: 'Expense', category: 'Capital', branchId: 'temple' },

  // Head Office - Colombo - Income (includes rental income; properties sit at Head Office)
  { name: 'General Donations', type: 'Income', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Membership Subscriptions', type: 'Income', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Interest Income', type: 'Income', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Sale of Publications/Items', type: 'Income', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Grants Received', type: 'Income', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Miscellaneous Income', type: 'Income', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Rent Income', type: 'Income', category: 'Revenue', branchId: 'headoffice' },

  // Head Office - Colombo - Expense
  { name: 'Staff Salaries', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'EPF / ETF Contribution', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Office Supplies & Stationery', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Electricity & Water', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Telephone & Internet', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Bank Charges', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Audit & Professional Fees', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Insurance', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Statutory / Compliance Fees', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Community Welfare / Charity Disbursements', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Miscellaneous Expenses', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Property Maintenance', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Property Tax / Rates & Assessments', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Security Expenses', type: 'Expense', category: 'Revenue', branchId: 'headoffice' },
  { name: 'Office Equipment / Furniture', type: 'Expense', category: 'Capital', branchId: 'headoffice' },
  { name: 'Property Improvements', type: 'Expense', category: 'Capital', branchId: 'headoffice' },

  // Jaffna
  { name: 'Jaffna Donations', type: 'Income', category: 'Revenue', branchId: 'jaffna' },
  { name: 'Jaffna Maintenance & Repairs', type: 'Expense', category: 'Revenue', branchId: 'jaffna' },
  { name: 'Jaffna Renovation / Major Works', type: 'Expense', category: 'Capital', branchId: 'jaffna' },

  // Kilinochchi Training Centre (new/under construction — starter set)
  { name: 'Kilinochchi Training Centre Donations', type: 'Income', category: 'Revenue', branchId: 'kilinochchi' },
  { name: 'Kilinochchi Training Centre Maintenance', type: 'Expense', category: 'Revenue', branchId: 'kilinochchi' },
  { name: 'Kilinochchi Training Centre Construction', type: 'Expense', category: 'Capital', branchId: 'kilinochchi' },
]

export const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer', 'Online']
