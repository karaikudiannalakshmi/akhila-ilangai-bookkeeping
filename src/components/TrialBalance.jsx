import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'

export default function TrialBalance() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: branches } = useCollection('branches')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const [period, setPeriod] = useState(defaultPeriodValue())
  const [branchFilter, setBranchFilter] = useState('all')

  const { from, to, label } = resolvePeriod(period)

  const rows = useMemo(() => {
    const filtered = vouchers
      .filter((v) => v.category === 'Revenue') // capital items sit in Fixed Assets, not trial balance
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
      .filter((v) => branchFilter === 'all' || resolveBranchId(v) === branchFilter)

    const byHead = {}
    filtered.forEach((v) => {
      const key = v.headName
      if (!byHead[key]) byHead[key] = { head: key, branch: resolveBranchId(v), type: v.type, debit: 0, credit: 0 }
      if (v.type === 'Income') byHead[key].credit += v.amount
      else byHead[key].debit += v.amount
    })
    return Object.values(byHead).sort((a, b) => a.head.localeCompare(b.head))
  }, [vouchers, from, to, branchFilter])

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)

  return (
    <div className="card">
      <h2>Trial Balance</h2>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to})</p>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />
      <div className="filter-row">
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All Branches (Consolidated)</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <table>
        <thead><tr><th>Head</th><th>Branch</th><th>Debit (Expense)</th><th>Credit (Income)</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.head}>
              <td>{r.head}</td>
              <td>{branches.find((b) => b.id === r.branch)?.name || 'Unclassified'}</td>
              <td className="expense">{r.debit ? r.debit.toLocaleString() : '-'}</td>
              <td className="income">{r.credit ? r.credit.toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td colSpan={2}>Total</td>
            <td className="expense">{totalDebit.toLocaleString()}</td>
            <td className="income">{totalCredit.toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan={2}>Net Surplus / (Deficit)</td>
            <td colSpan={2} style={{ fontWeight: 700 }}>LKR {(totalCredit - totalDebit).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      <p style={{ fontSize: '0.75rem', color: '#6b6258', marginTop: 10 }}>
        Note: Capital expenditure is excluded here and tracked separately under Fixed Assets.
      </p>
    </div>
  )
}
