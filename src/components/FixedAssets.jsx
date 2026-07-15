import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'

export default function FixedAssets() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: openingAssets } = useCollection('fixedAssetsOpening')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const { data: branches } = useCollection('branches')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const [period, setPeriod] = useState(defaultPeriodValue())
  const { from, to, label } = resolvePeriod(period)

  const allCapitalItems = useMemo(
    () => vouchers.filter((v) => v.category === 'Capital').sort((a, b) => (a.date < b.date ? 1 : -1)),
    [vouchers]
  )

  const openingRegisterTotal = openingAssets.reduce((s, a) => s + Number(a.value), 0)

  // Carried-forward opening for the selected period = opening register total +
  // every capital addition dated before the period start.
  const openingForPeriod = useMemo(() => {
    return openingRegisterTotal + allCapitalItems.filter((v) => v.date < from).reduce((s, v) => s + v.amount, 0)
  }, [allCapitalItems, openingRegisterTotal, from])

  const additionsInPeriod = useMemo(
    () => allCapitalItems.filter((v) => v.date >= from && v.date <= to),
    [allCapitalItems, from, to]
  )
  const additionsTotal = additionsInPeriod.reduce((s, v) => s + v.amount, 0)
  const closingForPeriod = openingForPeriod + additionsTotal

  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to})</p>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />

      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {openingForPeriod.toLocaleString()}</div><div className="label">Opening (Carried Forward)</div></div>
        <div className="summary-box"><div className="value income">LKR {additionsTotal.toLocaleString()}</div><div className="label">Additions This Period</div></div>
        <div className="summary-box"><div className="value">LKR {closingForPeriod.toLocaleString()}</div><div className="label">Closing Fixed Assets</div></div>
      </div>

      <div className="card">
        <h2>Opening Assets (as per last Balance Sheet)</h2>
        <table>
          <thead><tr><th>Asset</th><th>Fund</th><th>Value</th><th>Acquired</th></tr></thead>
          <tbody>
            {openingAssets.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{branches.find((b) => b.id === resolveBranchId(a))?.name || 'Unclassified'}</td>
                <td>{Number(a.value).toLocaleString()}</td>
                <td>{a.dateAcquired || '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td colSpan={2}>Total</td><td>{openingRegisterTotal.toLocaleString()}</td><td></td></tr>
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
        <h2>Additions in Selected Period</h2>
        <table>
          <thead><tr><th>Date</th><th>Item / Head</th><th>Fund</th><th>Amount</th><th>Narration</th></tr></thead>
          <tbody>
            {additionsInPeriod.map((v) => (
              <tr key={v.id}>
                <td>{v.date}</td>
                <td>{v.headName}</td>
                <td>{branches.find((b) => b.id === resolveBranchId(v))?.name || 'Unclassified'}</td>
                <td className="expense">{v.amount.toLocaleString()}</td>
                <td>{v.narration}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td colSpan={3}>Total</td><td className="expense">{additionsTotal.toLocaleString()}</td><td></td></tr>
          </tfoot>
        </table>
        {additionsInPeriod.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No capital expenditure in this period.</p>}
      </div>
    </div>
  )
}
