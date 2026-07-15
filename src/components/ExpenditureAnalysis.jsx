import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'

const COLORS = ['#7a1f2b', '#c9a227', '#2e7d32', '#4a6fa5', '#b3261e', '#8e6c88', '#5c7457', '#d98c3f']

export default function ExpenditureAnalysis() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: branches } = useCollection('branches')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const [period, setPeriod] = useState(defaultPeriodValue())
  const [branchFilter, setBranchFilter] = useState('all')

  const { from, to, label } = resolvePeriod(period)

  const expenseData = useMemo(() => {
    const filtered = vouchers
      .filter((v) => v.type === 'Expense')
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
      .filter((v) => branchFilter === 'all' || resolveBranchId(v) === branchFilter)
    const byHead = {}
    filtered.forEach((v) => {
      byHead[v.headName] = (byHead[v.headName] || 0) + v.amount
    })
    return Object.entries(byHead)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [vouchers, from, to, branchFilter])

  const total = expenseData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card">
      <h2>Expenditure Analysis</h2>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>Period: {label} ({from} to {to})</p>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />
      <div className="filter-row">
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {total === 0 ? (
        <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No expense entries in this period.</p>
      ) : (
        <>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${((e.value / total) * 100).toFixed(0)}%`}>
                  {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <table style={{ marginTop: 10 }}>
            <thead><tr><th>Head</th><th>Amount</th><th>% of Total</th></tr></thead>
            <tbody>
              {expenseData.map((d, i) => (
                <tr key={d.name}>
                  <td><span style={{ display: 'inline-block', width: 10, height: 10, background: COLORS[i % COLORS.length], marginRight: 6, borderRadius: 2 }} />{d.name}</td>
                  <td>LKR {d.value.toLocaleString()}</td>
                  <td>{((d.value / total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}><td>Total</td><td>LKR {total.toLocaleString()}</td><td>100%</td></tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  )
}
