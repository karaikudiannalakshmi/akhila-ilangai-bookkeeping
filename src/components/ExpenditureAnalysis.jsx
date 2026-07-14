import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useCollection } from '../hooks/useCollection'

const PERIODS = ['Month', 'Quarter', 'Year']
const COLORS = ['#7a1f2b', '#c9a227', '#2e7d32', '#4a6fa5', '#b3261e', '#8e6c88', '#5c7457', '#d98c3f']

function inPeriod(dateStr, period, ref) {
  const d = new Date(dateStr)
  const r = new Date(ref)
  if (period === 'Month') return dateStr.slice(0, 7) === ref.slice(0, 7)
  if (period === 'Year') return dateStr.slice(0, 4) === ref.slice(0, 4)
  if (period === 'Quarter') {
    const q = (m) => Math.floor(m / 3)
    return d.getFullYear() === r.getFullYear() && q(d.getMonth()) === q(r.getMonth())
  }
  return true
}

export default function ExpenditureAnalysis() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: locations } = useCollection('locations')
  const [period, setPeriod] = useState('Month')
  const [refDate, setRefDate] = useState(new Date().toISOString().slice(0, 10))
  const [locationFilter, setLocationFilter] = useState('all')

  const expenseData = useMemo(() => {
    const filtered = vouchers
      .filter((v) => v.type === 'Expense' && inPeriod(v.date, period, refDate))
      .filter((v) => locationFilter === 'all' || v.locationId === locationFilter)
    const byHead = {}
    filtered.forEach((v) => {
      byHead[v.headName] = (byHead[v.headName] || 0) + v.amount
    })
    return Object.entries(byHead)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [vouchers, period, refDate, locationFilter])

  const total = expenseData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card">
      <h2>Expenditure Analysis</h2>
      <div className="filter-row">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} />
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="all">All Centres</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
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
