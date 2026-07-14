import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCollection } from '../hooks/useCollection'
import { FUNDS } from '../constants/chartOfAccounts'
import { cashDelta, bankDelta } from '../utils/cashBank'

export default function Dashboard() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: properties } = useCollection('properties')
  const { data: openingBalances } = useCollection('openingBalances')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const thisMonth = new Date().toISOString().slice(0, 7)

  const monthVouchers = vouchers.filter((v) => v.date.slice(0, 7) === thisMonth)
  const monthIncome = monthVouchers.filter((v) => v.type === 'Income').reduce((s, v) => s + v.amount, 0)
  const monthExpense = monthVouchers.filter((v) => v.type === 'Expense' && v.category === 'Revenue').reduce((s, v) => s + v.amount, 0)

  const cashPosition = (opening?.cash || 0) + vouchers.reduce((s, v) => s + cashDelta(v), 0)
  const bankPosition = (opening?.bank || 0) + vouchers.reduce((s, v) => s + bankDelta(v), 0)

  const fundBalances = useMemo(() => {
    return FUNDS.map((f) => {
      const opening = openingBalances.find((b) => b.fundId === f.id)?.amount || 0
      const income = vouchers.filter((v) => v.fundId === f.id && v.type === 'Income').reduce((s, v) => s + v.amount, 0)
      const expense = vouchers.filter((v) => v.fundId === f.id && v.type === 'Expense').reduce((s, v) => s + v.amount, 0)
      return { ...f, balance: opening + income - expense }
    })
  }, [vouchers, openingBalances])

  const topExpenses = useMemo(() => {
    const byHead = {}
    monthVouchers.filter((v) => v.type === 'Expense').forEach((v) => {
      byHead[v.headName] = (byHead[v.headName] || 0) + v.amount
    })
    return Object.entries(byHead).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [monthVouchers])

  const trend = useMemo(() => {
    const map = {}
    vouchers.forEach((v) => {
      if (v.type !== 'Income' && v.type !== 'Expense') return
      const m = v.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 }
      if (v.type === 'Income') map[m].income += v.amount
      else map[m].expense += v.amount
    })
    return Object.values(map).sort((a, b) => (a.month < b.month ? -1 : 1)).slice(-6)
  }, [vouchers])

  const centreSummary = useMemo(() => {
    const byLoc = {}
    monthVouchers.forEach((v) => {
      if (v.type !== 'Income' && v.type !== 'Expense') return
      const key = v.locationName || 'Unassigned'
      if (!byLoc[key]) byLoc[key] = { name: key, income: 0, expense: 0 }
      if (v.type === 'Income') byLoc[key].income += v.amount
      else byLoc[key].expense += v.amount
    })
    return Object.values(byLoc)
  }, [monthVouchers])

  const rentArrears = properties.reduce((sum, p) => {
    const paid = vouchers
      .filter((v) => v.headName === 'Rent Income' && v.propertyId === p.id && v.date.slice(0, 7) === thisMonth)
      .reduce((s, v) => s + v.amount, 0)
    return sum + Math.max((Number(p.monthlyRent) || 0) - paid, 0)
  }, 0)

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {cashPosition.toLocaleString()}</div><div className="label">Cash in Hand</div></div>
        <div className="summary-box"><div className="value">LKR {bankPosition.toLocaleString()}</div><div className="label">Bank Balance</div></div>
      </div>

      <div className="summary-grid">
        <div className="summary-box"><div className="value income">LKR {monthIncome.toLocaleString()}</div><div className="label">This Month Income</div></div>
        <div className="summary-box"><div className="value expense">LKR {monthExpense.toLocaleString()}</div><div className="label">This Month Expense</div></div>
        <div className="summary-box"><div className="value">LKR {(monthIncome - monthExpense).toLocaleString()}</div><div className="label">Net Surplus</div></div>
        <div className="summary-box"><div className="value expense">LKR {rentArrears.toLocaleString()}</div><div className="label">Rent Arrears (This Mo.)</div></div>
      </div>

      <div className="card">
        <h2>Centre-wise Summary (This Month)</h2>
        <table>
          <thead><tr><th>Centre</th><th>Income</th><th>Expense</th><th>Net</th></tr></thead>
          <tbody>
            {centreSummary.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td className="income">{c.income.toLocaleString()}</td>
                <td className="expense">{c.expense.toLocaleString()}</td>
                <td>{(c.income - c.expense).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {centreSummary.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No entries this month yet.</p>}
      </div>

      <div className="card">
        <h2>Fund Balances</h2>
        <table>
          <thead><tr><th>Fund</th><th>Balance</th></tr></thead>
          <tbody>
            {fundBalances.map((f) => (
              <tr key={f.id}><td>{f.name}</td><td className={f.balance >= 0 ? 'income' : 'expense'}>LKR {f.balance.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>6-Month Trend</h2>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="income" stroke="#2e7d32" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#b3261e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Top 5 Expense Heads This Month</h2>
        <table>
          <thead><tr><th>Head</th><th>Amount</th></tr></thead>
          <tbody>
            {topExpenses.map((e) => <tr key={e.name}><td>{e.name}</td><td className="expense">{e.value.toLocaleString()}</td></tr>)}
          </tbody>
        </table>
        {topExpenses.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No expenses recorded this month.</p>}
      </div>
    </div>
  )
}
