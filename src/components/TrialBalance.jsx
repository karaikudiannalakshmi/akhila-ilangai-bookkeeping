import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { FUNDS } from '../constants/chartOfAccounts'

const PERIODS = ['Month', 'Quarter', 'Year', 'All Time']

function inPeriod(dateStr, period, ref) {
  const d = new Date(dateStr)
  if (period === 'All Time') return true
  if (period === 'Month') return dateStr.slice(0, 7) === ref.slice(0, 7)
  if (period === 'Year') return dateStr.slice(0, 4) === ref.slice(0, 4)
  if (period === 'Quarter') {
    const q = (m) => Math.floor(m / 3)
    return d.getFullYear() === new Date(ref).getFullYear() && q(d.getMonth()) === q(new Date(ref).getMonth())
  }
  return true
}

export default function TrialBalance() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: locations } = useCollection('locations')
  const [period, setPeriod] = useState('Month')
  const [refDate, setRefDate] = useState(new Date().toISOString().slice(0, 10))
  const [fundFilter, setFundFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const rows = useMemo(() => {
    const filtered = vouchers
      .filter((v) => v.category === 'Revenue') // capital items sit in Fixed Assets, not trial balance
      .filter((v) => inPeriod(v.date, period, refDate))
      .filter((v) => fundFilter === 'all' || v.fundId === fundFilter)
      .filter((v) => locationFilter === 'all' || v.locationId === locationFilter)

    const byHead = {}
    filtered.forEach((v) => {
      const key = v.headName
      if (!byHead[key]) byHead[key] = { head: key, fund: v.fundId, type: v.type, debit: 0, credit: 0 }
      if (v.type === 'Income') byHead[key].credit += v.amount
      else byHead[key].debit += v.amount
    })
    return Object.values(byHead).sort((a, b) => a.head.localeCompare(b.head))
  }, [vouchers, period, refDate, fundFilter, locationFilter])

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)

  return (
    <div className="card">
      <h2>Trial Balance</h2>
      <div className="filter-row">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map((p) => <option key={p}>{p}</option>)}
        </select>
        {period !== 'All Time' && <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} />}
        <select value={fundFilter} onChange={(e) => setFundFilter(e.target.value)}>
          <option value="all">All Funds (Consolidated)</option>
          {FUNDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="all">All Centres</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <table>
        <thead><tr><th>Head</th><th>Fund</th><th>Debit (Expense)</th><th>Credit (Income)</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.head}>
              <td>{r.head}</td>
              <td>{FUNDS.find((f) => f.id === r.fund)?.name}</td>
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
