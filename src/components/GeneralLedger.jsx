import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'

export default function GeneralLedger() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: heads } = useCollection('coa')
  const { data: branches } = useCollection('branches')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')
  const [headId, setHeadId] = useState('')
  const [period, setPeriod] = useState(defaultPeriodValue())

  const { from, to, label } = resolvePeriod(period)
  const selectedHead = heads.find((h) => h.id === headId)

  const rows = useMemo(() => {
    if (!headId) return []
    const entries = vouchers
      .filter((v) => v.headId === headId)
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    let balance = 0
    return entries.map((v) => {
      // For Income heads, credits increase balance; for Expense heads, debits increase balance
      balance += v.amount
      return { ...v, balance }
    })
  }, [vouchers, headId, from, to])

  const total = rows.reduce((s, v) => s + v.amount, 0)

  return (
    <div className="card">
      <h2>Ledgers (Head-wise Account)</h2>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to})</p>
      <div className="filter-row">
        <select value={headId} onChange={(e) => setHeadId(e.target.value)}>
          <option value="">-- Select a Head --</option>
          {branches.map((b) => {
            const opts = heads.filter((h) => resolveBranchId(h) === b.id)
            if (opts.length === 0) return null
            return (
              <optgroup key={b.id} label={b.name}>
                {opts.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </optgroup>
            )
          })}
        </select>
      </div>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />

      {!headId && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>Select a head above to view its ledger account.</p>}

      {headId && (
        <>
          <div className="summary-grid">
            <div className="summary-box">
              <div className={`value ${selectedHead?.type === 'Income' ? 'income' : 'expense'}`}>LKR {total.toLocaleString()}</div>
              <div className="label">Total {selectedHead?.type === 'Income' ? '(Cr)' : '(Dr)'}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Branch</th><th>Narration</th><th>Amount</th><th>Running Total</th></tr></thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.branchName || v.locationName || '—'}</td>
                  <td>{v.narration || '—'}</td>
                  <td className={v.type === 'Income' ? 'income' : 'expense'}>{v.amount.toLocaleString()}</td>
                  <td>{v.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No entries for this head in the selected period.</p>}
        </>
      )}
    </div>
  )
}
