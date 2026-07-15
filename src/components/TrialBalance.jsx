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

  const periodVouchers = useMemo(() => {
    return vouchers
      .filter((v) => v.category === 'Revenue') // capital items sit in Fixed Assets, not trial balance
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
  }, [vouchers, from, to])

  // Single-view table (respects the branch filter dropdown: All = consolidated, or one branch)
  const { incomeRows, expenseRevenueRows } = useMemo(() => {
    const filtered = periodVouchers.filter((v) => branchFilter === 'all' || resolveBranchId(v) === branchFilter)
    const byHead = {}
    filtered.forEach((v) => {
      const key = v.headName
      if (!byHead[key]) byHead[key] = { head: key, type: v.type, amount: 0 }
      byHead[key].amount += v.amount
    })
    const all = Object.values(byHead)
    return {
      incomeRows: all.filter((r) => r.type === 'Income').sort((a, b) => a.head.localeCompare(b.head)),
      expenseRevenueRows: all.filter((r) => r.type === 'Expense').sort((a, b) => a.head.localeCompare(b.head)),
    }
  }, [periodVouchers, branchFilter])

  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0)
  const totalExpense = expenseRevenueRows.reduce((s, r) => s + r.amount, 0)

  // Branch-wise comparison matrix (always all branches + total, regardless of the filter above)
  const matrix = useMemo(() => {
    const buildMatrix = (type) => {
      const headNames = [...new Set(periodVouchers.filter((v) => v.type === type).map((v) => v.headName))].sort()
      return headNames.map((headName) => {
        const row = { head: headName, byBranch: {}, total: 0 }
        branches.forEach((b) => {
          const amt = periodVouchers
            .filter((v) => v.type === type && v.headName === headName && resolveBranchId(v) === b.id)
            .reduce((s, v) => s + v.amount, 0)
          row.byBranch[b.id] = amt
          row.total += amt
        })
        return row
      })
    }
    const incomeRows = buildMatrix('Income')
    const expenseRows = buildMatrix('Expense')
    const branchTotals = (rowsArr) => {
      const totals = {}
      branches.forEach((b) => { totals[b.id] = rowsArr.reduce((s, r) => s + (r.byBranch[b.id] || 0), 0) })
      totals.total = rowsArr.reduce((s, r) => s + r.total, 0)
      return totals
    }
    return {
      incomeRows,
      expenseRows,
      incomeTotals: branchTotals(incomeRows),
      expenseTotals: branchTotals(expenseRows),
    }
  }, [periodVouchers, branches])

  return (
    <div>
      <div className="card">
        <h2>Income & Expenditure Account</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to})</p>
        <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />
        <div className="filter-row">
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="all">All Branches (Consolidated)</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <h3 style={{ fontSize: '0.85rem', color: 'var(--green)' }}>Income</h3>
        <table>
          <thead><tr><th>Head</th><th>Amount</th></tr></thead>
          <tbody>
            {incomeRows.map((r) => (
              <tr key={r.head}>
                <td>{r.head}</td>
                <td className="income">{r.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td>Total Income</td><td className="income">{totalIncome.toLocaleString()}</td></tr>
          </tfoot>
        </table>
        {incomeRows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No income entries in this period.</p>}

        <h3 style={{ fontSize: '0.85rem', color: 'var(--red)', marginTop: 16 }}>Expenditure</h3>
        <table>
          <thead><tr><th>Head</th><th>Amount</th></tr></thead>
          <tbody>
            {expenseRevenueRows.map((r) => (
              <tr key={r.head}>
                <td>{r.head}</td>
                <td className="expense">{r.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700 }}><td>Total Expenditure</td><td className="expense">{totalExpense.toLocaleString()}</td></tr>
          </tfoot>
        </table>
        {expenseRevenueRows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No expenditure entries in this period.</p>}

        <table style={{ marginTop: 16 }}>
          <tbody>
            <tr style={{ fontWeight: 700 }}>
              <td>Net Surplus / (Deficit)</td>
              <td>LKR {(totalIncome - totalExpense).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.75rem', color: '#6b6258', marginTop: 10 }}>
          Note: Capital expenditure is excluded here and tracked separately under Fixed Assets.
        </p>
      </div>

      <div className="card">
        <h2>Branch-wise Comparison ({label})</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Every branch shown side by side, with a consolidated Total column — independent of the filter above.</p>

        <h3 style={{ fontSize: '0.85rem', color: 'var(--green)' }}>Income</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Head</th>
                {branches.map((b) => <th key={b.id}>{b.name}</th>)}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {matrix.incomeRows.map((r) => (
                <tr key={r.head}>
                  <td>{r.head}</td>
                  {branches.map((b) => <td key={b.id} className="income">{r.byBranch[b.id] ? r.byBranch[b.id].toLocaleString() : '-'}</td>)}
                  <td style={{ fontWeight: 600 }} className="income">{r.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td>Total Income</td>
                {branches.map((b) => <td key={b.id}>{matrix.incomeTotals[b.id]?.toLocaleString() || 0}</td>)}
                <td>{matrix.incomeTotals.total?.toLocaleString() || 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {matrix.incomeRows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No income entries in this period.</p>}

        <h3 style={{ fontSize: '0.85rem', color: 'var(--red)', marginTop: 16 }}>Expenditure</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Head</th>
                {branches.map((b) => <th key={b.id}>{b.name}</th>)}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {matrix.expenseRows.map((r) => (
                <tr key={r.head}>
                  <td>{r.head}</td>
                  {branches.map((b) => <td key={b.id} className="expense">{r.byBranch[b.id] ? r.byBranch[b.id].toLocaleString() : '-'}</td>)}
                  <td style={{ fontWeight: 600 }} className="expense">{r.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td>Total Expenditure</td>
                {branches.map((b) => <td key={b.id}>{matrix.expenseTotals[b.id]?.toLocaleString() || 0}</td>)}
                <td>{matrix.expenseTotals.total?.toLocaleString() || 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {matrix.expenseRows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No expenditure entries in this period.</p>}

        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Net Surplus / (Deficit)</th>
              {branches.map((b) => <th key={b.id}>{b.name}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontWeight: 700 }}>
              <td>Net</td>
              {branches.map((b) => {
                const net = (matrix.incomeTotals[b.id] || 0) - (matrix.expenseTotals[b.id] || 0)
                return <td key={b.id} className={net >= 0 ? 'income' : 'expense'}>{net.toLocaleString()}</td>
              })}
              <td>{((matrix.incomeTotals.total || 0) - (matrix.expenseTotals.total || 0)).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
