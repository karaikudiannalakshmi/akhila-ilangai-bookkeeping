import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { cashDelta, bankDelta } from '../utils/cashBank'
import { resolveBranchId, findRecordForBranch } from '../utils/branch'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'

function snapshotAsOf(vouchers, openingBalances, openingAssets, opening, branches, asOfDate) {
  const upToDate = vouchers.filter((v) => v.date <= asOfDate)

  const cashBalance = (opening?.cash || 0) + upToDate.reduce((s, v) => s + cashDelta(v), 0)
  const bankBalance = (opening?.bank || 0) + upToDate.reduce((s, v) => s + bankDelta(v), 0)

  const openingAssetsTotal = openingAssets.reduce((s, a) => s + Number(a.value), 0)
  const additions = upToDate.filter((v) => v.category === 'Capital').reduce((s, v) => s + v.amount, 0)
  const fixedAssetsTotal = openingAssetsTotal + additions

  const branchRows = branches.map((b) => {
    const openingRec = findRecordForBranch(openingBalances, b.id)
    const opBal = openingRec?.amount || 0
    const income = upToDate.filter((v) => resolveBranchId(v) === b.id && v.type === 'Income').reduce((s, v) => s + v.amount, 0)
    const expense = upToDate.filter((v) => resolveBranchId(v) === b.id && v.type === 'Expense').reduce((s, v) => s + v.amount, 0)
    return { ...b, balance: opBal + income - expense }
  })
  const totalFunds = branchRows.reduce((s, b) => s + b.balance, 0)
  const totalAssets = cashBalance + bankBalance + fixedAssetsTotal

  const fixedAssetsByBranch = branches.map((b) => {
    const openingForBranch = openingAssets.filter((a) => resolveBranchId(a) === b.id).reduce((s, a) => s + Number(a.value), 0)
    const additionsForBranch = upToDate.filter((v) => v.category === 'Capital' && resolveBranchId(v) === b.id).reduce((s, v) => s + v.amount, 0)
    return { ...b, value: openingForBranch + additionsForBranch }
  })

  return { cashBalance, bankBalance, fixedAssetsTotal, branchRows, totalFunds, totalAssets, fixedAssetsByBranch }
}

export default function BalanceSheet() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: openingBalances } = useCollection('openingBalances')
  const { data: openingAssets } = useCollection('fixedAssetsOpening')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const { data: branches } = useCollection('branches')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const [period, setPeriod] = useState(defaultPeriodValue())
  const { from, to, label } = resolvePeriod(period)

  const closing = useMemo(
    () => snapshotAsOf(vouchers, openingBalances, openingAssets, opening, branches, to),
    [vouchers, openingBalances, openingAssets, opening, branches, to]
  )
  const dayBeforeStart = useMemo(() => {
    const d = new Date(from)
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  }, [from])
  const openingSnap = useMemo(
    () => snapshotAsOf(vouchers, openingBalances, openingAssets, opening, branches, dayBeforeStart),
    [vouchers, openingBalances, openingAssets, opening, branches, dayBeforeStart]
  )

  const diff = closing.totalAssets - closing.totalFunds

  return (
    <div className="card">
      <h2>Balance Sheet</h2>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to}) — closing position shown as of {to}</p>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />

      <div className="grid-2">
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--maroon)' }}>Funds & Liabilities — by Branch</h3>
          <table>
            <thead><tr><th>Branch</th><th>Opening (b/f)</th><th>Movement</th><th>Closing</th></tr></thead>
            <tbody>
              {closing.branchRows.map((b) => {
                const op = openingSnap.branchRows.find((o) => o.id === b.id)?.balance || 0
                return (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{op.toLocaleString()}</td>
                    <td>{(b.balance - op).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{b.balance.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td>Total Funds (Consolidated)</td>
                <td>{openingSnap.totalFunds.toLocaleString()}</td>
                <td>{(closing.totalFunds - openingSnap.totalFunds).toLocaleString()}</td>
                <td>LKR {closing.totalFunds.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--maroon)' }}>Assets — Consolidated</h3>
          <table>
            <thead><tr><th>Item</th><th>Opening (b/f)</th><th>Movement</th><th>Closing</th></tr></thead>
            <tbody>
              <tr>
                <td>Fixed Assets</td>
                <td>{openingSnap.fixedAssetsTotal.toLocaleString()}</td>
                <td>{(closing.fixedAssetsTotal - openingSnap.fixedAssetsTotal).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{closing.fixedAssetsTotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Cash in Hand</td>
                <td>{openingSnap.cashBalance.toLocaleString()}</td>
                <td>{(closing.cashBalance - openingSnap.cashBalance).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{closing.cashBalance.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Bank Balance</td>
                <td>{openingSnap.bankBalance.toLocaleString()}</td>
                <td>{(closing.bankBalance - openingSnap.bankBalance).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{closing.bankBalance.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td>Total Assets</td>
                <td>{openingSnap.totalAssets.toLocaleString()}</td>
                <td>{(closing.totalAssets - openingSnap.totalAssets).toLocaleString()}</td>
                <td>LKR {closing.totalAssets.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <p style={{ fontSize: '0.7rem', color: '#6b6258', marginTop: 6 }}>
            Cash and Bank are held centrally (one cash box, one bank account), so they aren't split by branch. Fixed Assets can be broken out below.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--maroon)', marginTop: 0 }}>Fixed Assets — by Branch</h3>
        <table>
          <thead><tr><th>Branch</th><th>Closing Value</th></tr></thead>
          <tbody>
            {closing.fixedAssetsByBranch.map((b) => (
              <tr key={b.id}><td>{b.name}</td><td>{b.value.toLocaleString()}</td></tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td>Total Fixed Assets (Consolidated)</td><td>LKR {closing.fixedAssetsTotal.toLocaleString()}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="card" style={{ marginTop: 12, background: Math.abs(diff) < 1 ? '#eef7ee' : '#fdf0ee' }}>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          <strong>Difference at Closing (Assets − Funds): LKR {diff.toLocaleString()}</strong>
          <br />
          {Math.abs(diff) < 1
            ? 'Balances match.'
            : 'A non-zero difference usually means the Opening Fund Balances, Opening Cash/Bank, and Opening Fixed Assets entered under "Opening Balances" don\'t add up to the same total as your last balance sheet. Recheck those three figures against your old balance sheet.'}
        </p>
      </div>
    </div>
  )
}
