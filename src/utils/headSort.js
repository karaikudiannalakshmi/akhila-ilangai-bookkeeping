// Logical display order for Chart of Accounts heads:
// 1. Income
// 2. Expenses (Revenue - day-to-day operating expenses)
// 3. Assets (Expense, category Capital - asset-building expenditure)
// 4. Liabilities (category Liability - loans/creditors, either type)

function rank(h) {
  if (h.category === 'Liability') return 3
  if (h.category === 'Capital') return 2
  if (h.type === 'Income') return 0
  if (h.type === 'Expense') return 1
  return 4
}

export function sortHeads(heads) {
  return [...heads].sort((a, b) => {
    const r = rank(a) - rank(b)
    if (r !== 0) return r
    return (a.name || '').localeCompare(b.name || '')
  })
}
