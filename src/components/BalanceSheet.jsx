import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { FUNDS } from '../constants/chartOfAccounts'
import { cashDelta, bankDelta } from '../utils/cashBank'

export default function BalanceSheet() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: openingBalances } = useCollection('openingBalances')
  const { data: openingAssets } = useCollection('fixedAssetsOpening')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10))

  const result = useMemo(() => {
    const upToDate = vouchers.filter((v) => v.date <= asOfDate)

    // Cash & Bank (contra transfers move money between the two, net zero overall)
    const cashBalance = (opening?.cash || 0) + upToDate.reduce((s, v) => s + cashDelta(v), 0)
    const bankBalance = (opening?.bank || 0) + upToDate.reduce((s, v) => s + bankDelta(v), 0)

    // Fixed Assets = opening assets + capital additions up to date
    const openingAssetsTotal = openingAssets.reduce((s, a) => s + Number(a.value), 0)
    const additions = upToDate.filter((v) => v.category === 'Capital').reduce((s, v) => s + v.amount, 0)
    const fixedAssetsTotal = openingAssetsTotal + additions

    // Fund balances = opening fund balance + all income - all expense (revenue + capital) up to date, per fund
    // Contra entries have no fundId so they naturally don't affect any fund's balance.
    const fundRows = FUNDS.map((f) => {
      const opBal = openingBalances.find((b) => b.fundId === f.id)?.amount || 0
      const income = upToDate.filter((v) => v.fundId === f.id && v.type === 'Income').reduce((s, v) => s + v.amount, 0)
      const expense = upToDate.filter((v) => v.fundId === f.id && v.type === 'Expense').reduce((s, v) => s + v.amount, 0)
      return { ...f, balance: opBal + income - expense }
    })
    const totalFunds = fundRows.reduce((s, f) => s + f.balance, 0)

    const totalAssets = cashBalance + bankBalance + fixedAssetsTotal

    return { cashBalance, bankBalance, fixedAssetsTotal, fundRows, totalFunds, totalAssets }
  }, [vouchers, openingBalances, openingAssets, opening, asOfDate])

  const diff = result.totalAssets - result.totalFunds

  return (
    <div className="card">
      <h2>Balance Sheet</h2>
      <div className="filter-row">
        <label style={{ margin: 0 }}>As of:</label>
        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
      </div>

      <div className="grid-2">
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--maroon)' }}>Funds & Liabilities</h3>
          <table>
            <tbody>
              {result.fundRows.map((f) => (
                <tr key={f.id}><td>{f.name}</td><td>{f.balance.toLocaleString()}</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}><td>Total Funds</td><td>LKR {result.totalFunds.toLocaleString()}</td></tr>
            </tfoot>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--maroon)' }}>Assets</h3>
          <table>
            <tbody>
              <tr><td>Fixed Assets</td><td>{result.fixedAssetsTotal.toLocaleString()}</td></tr>
              <tr><td>Cash in Hand</td><td>{result.cashBalance.toLocaleString()}</td></tr>
              <tr><td>Bank Balance</td><td>{result.bankBalance.toLocaleString()}</td></tr>
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}><td>Total Assets</td><td>LKR {result.totalAssets.toLocaleString()}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, background: Math.abs(diff) < 1 ? '#eef7ee' : '#fdf0ee' }}>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          <strong>Difference (Assets − Funds): LKR {diff.toLocaleString()}</strong>
          <br />
          {Math.abs(diff) < 1
            ? 'Balances match.'
            : 'A non-zero difference usually means the Opening Fund Balances, Opening Cash/Bank, and Opening Fixed Assets entered under "Opening Balances" don\'t add up to the same total as your last balance sheet. Recheck those three figures against your old balance sheet.'}
        </p>
      </div>
    </div>
  )
}
