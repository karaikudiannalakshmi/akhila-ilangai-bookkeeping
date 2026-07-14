import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'

export default function RentCollection() {
  const { data: properties } = useCollection('properties')
  const { data: vouchers } = useCollection('vouchers')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  const rentVouchers = useMemo(
    () => vouchers.filter((v) => v.headName === 'Rent Income' && v.date.slice(0, 7) === month),
    [vouchers, month]
  )

  const rows = properties.map((p) => {
    const paid = rentVouchers.filter((v) => v.propertyId === p.id).reduce((s, v) => s + v.amount, 0)
    const due = Number(p.monthlyRent) || 0
    return { ...p, paid, due, arrears: due - paid }
  })

  const totalDue = rows.reduce((s, r) => s + r.due, 0)
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0)

  return (
    <div className="card">
      <h2>Rent Collection & Arrears</h2>
      <div className="filter-row">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {totalDue.toLocaleString()}</div><div className="label">Total Rent Due</div></div>
        <div className="summary-box"><div className="value income">LKR {totalPaid.toLocaleString()}</div><div className="label">Collected</div></div>
        <div className="summary-box"><div className="value expense">LKR {(totalDue - totalPaid).toLocaleString()}</div><div className="label">Outstanding</div></div>
      </div>

      <table>
        <thead><tr><th>Property</th><th>Tenant</th><th>Monthly Rent</th><th>Collected</th><th>Arrears</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.tenantName}</td>
              <td>{r.due.toLocaleString()}</td>
              <td className="income">{r.paid.toLocaleString()}</td>
              <td className={r.arrears > 0 ? 'expense' : ''}>{r.arrears > 0 ? r.arrears.toLocaleString() : 'Paid'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No properties added yet. Add them under Admin.</p>}
    </div>
  )
}
