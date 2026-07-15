import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'

export default function Ledger() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: branches } = useCollection('branches')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')
  const [branchFilter, setBranchFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [period, setPeriod] = useState(defaultPeriodValue())

  const { from, to, label } = resolvePeriod(period)

  const filtered = useMemo(() => {
    return vouchers
      .filter((v) => branchFilter === 'all' || resolveBranchId(v) === branchFilter)
      .filter((v) => typeFilter === 'all' || v.type === typeFilter)
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [vouchers, branchFilter, typeFilter, from, to])

  const totalIncome = filtered.filter((v) => v.type === 'Income').reduce((s, v) => s + v.amount, 0)
  const totalExpense = filtered.filter((v) => v.type === 'Expense').reduce((s, v) => s + v.amount, 0)

  const particulars = (v) => {
    if (v.type === 'Contra') {
      return v.contraDirection === 'CashToBank' ? 'Contra — Cash deposited into Bank' : 'Contra — Cash withdrawn from Bank'
    }
    return v.headName
  }

  return (
    <div className="card">
      <h2>All Entries (Consolidated View)</h2>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
        Read-only. To add, edit, or delete an entry — including cash/bank contra transfers — use the
        Cash Book or Bank Book. Changes made there appear here automatically.
      </p>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to})</p>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />
      <div className="filter-row">
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option>Income</option>
          <option>Expense</option>
          <option>Contra</option>
        </select>
      </div>

      <div className="summary-grid">
        <div className="summary-box"><div className="value income">LKR {totalIncome.toLocaleString()}</div><div className="label">Total Income</div></div>
        <div className="summary-box"><div className="value expense">LKR {totalExpense.toLocaleString()}</div><div className="label">Total Expense</div></div>
        <div className="summary-box"><div className="value">LKR {(totalIncome - totalExpense).toLocaleString()}</div><div className="label">Net</div></div>
      </div>

      <table>
        <thead><tr><th>Date</th><th>Particulars</th><th>Branch</th><th>Mode</th><th>Amount</th></tr></thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id}>
              <td>{v.date}</td>
              <td>{particulars(v)}</td>
              <td>{branches.find((b) => b.id === resolveBranchId(v))?.name || v.branchName || v.locationName || '—'}</td>
              <td>{v.type === 'Contra' ? 'Contra' : v.paymentMode}</td>
              <td className={v.type === 'Income' ? 'income' : v.type === 'Expense' ? 'expense' : ''}>
                {v.type === 'Income' ? '+' : v.type === 'Expense' ? '-' : ''}{v.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No entries found for this filter.</p>}
    </div>
  )
}
