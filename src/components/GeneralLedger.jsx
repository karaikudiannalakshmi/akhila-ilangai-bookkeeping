import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { FUNDS } from '../constants/chartOfAccounts'

export default function GeneralLedger() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: heads } = useCollection('coa')
  const [headId, setHeadId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

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
      <div className="filter-row">
        <select value={headId} onChange={(e) => setHeadId(e.target.value)}>
          <option value="">-- Select a Head --</option>
          {FUNDS.map((fund) => {
            const opts = heads.filter((h) => h.fundId === fund.id)
            if (opts.length === 0) return null
            return (
              <optgroup key={fund.id} label={fund.name}>
                {opts.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </optgroup>
            )
          })}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

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
            <thead><tr><th>Date</th><th>Centre</th><th>Narration</th><th>Amount</th><th>Running Total</th></tr></thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.locationName || '—'}</td>
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
