import { useMemo } from 'react'
import { useCollection } from '../hooks/useCollection'
import { FUNDS } from '../constants/chartOfAccounts'

export default function FixedAssets() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: openingAssets } = useCollection('fixedAssetsOpening')

  const capitalItems = useMemo(
    () => vouchers.filter((v) => v.category === 'Capital').sort((a, b) => (a.date < b.date ? 1 : -1)),
    [vouchers]
  )

  const openingTotal = openingAssets.reduce((s, a) => s + Number(a.value), 0)
  const additionsTotal = capitalItems.reduce((s, v) => s + v.amount, 0)

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {openingTotal.toLocaleString()}</div><div className="label">Opening Assets (Last B/S)</div></div>
        <div className="summary-box"><div className="value income">LKR {additionsTotal.toLocaleString()}</div><div className="label">Additions Since</div></div>
        <div className="summary-box"><div className="value">LKR {(openingTotal + additionsTotal).toLocaleString()}</div><div className="label">Total Fixed Assets</div></div>
      </div>

      <div className="card">
        <h2>Opening Assets (as per last Balance Sheet)</h2>
        <table>
          <thead><tr><th>Asset</th><th>Fund</th><th>Value</th><th>Acquired</th></tr></thead>
          <tbody>
            {openingAssets.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{FUNDS.find((f) => f.id === a.fundId)?.name}</td>
                <td>{Number(a.value).toLocaleString()}</td>
                <td>{a.dateAcquired || '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td colSpan={2}>Total</td><td>{openingTotal.toLocaleString()}</td><td></td></tr>
          </tfoot>
        </table>
        {openingAssets.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>
            No opening assets recorded yet. Once you have the last balance sheet, add them under the
            Opening Balances tab.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Additions Since (Capital Expenditure entered in app)</h2>
        <table>
          <thead><tr><th>Date</th><th>Item / Head</th><th>Fund</th><th>Amount</th><th>Narration</th></tr></thead>
          <tbody>
            {capitalItems.map((v) => (
              <tr key={v.id}>
                <td>{v.date}</td>
                <td>{v.headName}</td>
                <td>{FUNDS.find((f) => f.id === v.fundId)?.name}</td>
                <td className="expense">{v.amount.toLocaleString()}</td>
                <td>{v.narration}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td colSpan={3}>Total</td><td className="expense">{additionsTotal.toLocaleString()}</td><td></td></tr>
          </tfoot>
        </table>
        {capitalItems.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No capital expenditure entered yet.</p>}
      </div>
    </div>
  )
}
