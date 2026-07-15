import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCollection } from '../hooks/useCollection'
import { cashDelta, bankDelta } from '../utils/cashBank'
import { currentFY } from '../utils/financialYear'
import { resolveBranchId, findRecordForBranch } from '../utils/branch'
import { useLanguage } from '../i18n/LanguageContext'

export default function Dashboard() {
  const { t } = useLanguage()
  const { data: vouchers } = useCollection('vouchers')
  const { data: properties } = useCollection('properties')
  const { data: openingBalances } = useCollection('openingBalances')
  const { data: branches } = useCollection('branches')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const thisMonth = new Date().toISOString().slice(0, 7)
  const fy = currentFY()

  const monthVouchers = vouchers.filter((v) => v.date.slice(0, 7) === thisMonth)
  const monthIncome = monthVouchers.filter((v) => v.type === 'Income').reduce((s, v) => s + v.amount, 0)
  const monthExpense = monthVouchers.filter((v) => v.type === 'Expense' && v.category === 'Revenue').reduce((s, v) => s + v.amount, 0)

  const fyVouchers = vouchers.filter((v) => v.date >= fy.start && v.date <= fy.end)
  const fyIncome = fyVouchers.filter((v) => v.type === 'Income').reduce((s, v) => s + v.amount, 0)
  const fyExpense = fyVouchers.filter((v) => v.type === 'Expense' && v.category === 'Revenue').reduce((s, v) => s + v.amount, 0)

  const cashPosition = (opening?.cash || 0) + vouchers.reduce((s, v) => s + cashDelta(v), 0)
  const bankPosition = (opening?.bank || 0) + vouchers.reduce((s, v) => s + bankDelta(v), 0)

  const branchBalances = useMemo(() => {
    return branches.map((b) => {
      const openingRec = findRecordForBranch(openingBalances, b.id)
      const opening = openingRec?.amount || 0
      const income = vouchers.filter((v) => resolveBranchId(v) === b.id && v.type === 'Income').reduce((s, v) => s + v.amount, 0)
      const expense = vouchers.filter((v) => resolveBranchId(v) === b.id && v.type === 'Expense').reduce((s, v) => s + v.amount, 0)
      return { ...b, balance: opening + income - expense }
    })
  }, [vouchers, openingBalances, branches])

  const topExpenses = useMemo(() => {
    const byHead = {}
    monthVouchers.filter((v) => v.type === 'Expense').forEach((v) => {
      byHead[v.headName] = (byHead[v.headName] || 0) + v.amount
    })
    return Object.entries(byHead).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [monthVouchers])

  const trend = useMemo(() => {
    const map = {}
    vouchers.forEach((v) => {
      if (v.type !== 'Income' && v.type !== 'Expense') return
      const m = v.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 }
      if (v.type === 'Income') map[m].income += v.amount
      else map[m].expense += v.amount
    })
    return Object.values(map).sort((a, b) => (a.month < b.month ? -1 : 1)).slice(-6)
  }, [vouchers])

  const branchSummary = useMemo(() => {
    const byBranch = {}
    monthVouchers.forEach((v) => {
      if (v.type !== 'Income' && v.type !== 'Expense') return
      const bId = resolveBranchId(v)
      const key = branches.find((b) => b.id === bId)?.name || v.branchName || v.locationName || 'Unassigned'
      if (!byBranch[key]) byBranch[key] = { name: key, income: 0, expense: 0 }
      if (v.type === 'Income') byBranch[key].income += v.amount
      else byBranch[key].expense += v.amount
    })
    return Object.values(byBranch)
  }, [monthVouchers, branches])

  const rentArrears = properties.reduce((sum, p) => {
    const paid = vouchers
      .filter((v) => v.headName === 'Rent Income' && v.propertyId === p.id && v.date.slice(0, 7) === thisMonth)
      .reduce((s, v) => s + v.amount, 0)
    return sum + Math.max((Number(p.monthlyRent) || 0) - paid, 0)
  }, 0)

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {cashPosition.toLocaleString()}</div><div className="label">{t('cashInHand')}</div></div>
        <div className="summary-box"><div className="value">LKR {bankPosition.toLocaleString()}</div><div className="label">{t('bankBalance')}</div></div>
      </div>

      <div className="summary-grid">
        <div className="summary-box"><div className="value income">LKR {monthIncome.toLocaleString()}</div><div className="label">{t('thisMonthIncome')}</div></div>
        <div className="summary-box"><div className="value expense">LKR {monthExpense.toLocaleString()}</div><div className="label">{t('thisMonthExpense')}</div></div>
        <div className="summary-box"><div className="value">LKR {(monthIncome - monthExpense).toLocaleString()}</div><div className="label">{t('netSurplusLabel')}</div></div>
        <div className="summary-box"><div className="value expense">LKR {rentArrears.toLocaleString()}</div><div className="label">{t('rentArrearsThisMonth')}</div></div>
      </div>

      <div className="card">
        <h2>{fy.label} — {t('yearToDate')}</h2>
        <div className="summary-grid" style={{ marginBottom: 0 }}>
          <div className="summary-box"><div className="value income">LKR {fyIncome.toLocaleString()}</div><div className="label">{t('incomeFYTD')}</div></div>
          <div className="summary-box"><div className="value expense">LKR {fyExpense.toLocaleString()}</div><div className="label">{t('expenseFYTD')}</div></div>
          <div className="summary-box"><div className="value">LKR {(fyIncome - fyExpense).toLocaleString()}</div><div className="label">{t('netSurplusFYTD')}</div></div>
        </div>
      </div>

      <div className="card">
        <h2>{t('branchWiseSummary')}</h2>
        <table>
          <thead><tr><th>{t('branch')}</th><th>{t('income')}</th><th>{t('expense')}</th><th>{t('net') }</th></tr></thead>
          <tbody>
            {branchSummary.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td className="income">{c.income.toLocaleString()}</td>
                <td className="expense">{c.expense.toLocaleString()}</td>
                <td>{(c.income - c.expense).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {branchSummary.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('noEntriesThisMonth')}</p>}
      </div>

      <div className="card">
        <h2>{t('branchBalances')}</h2>
        <table>
          <thead><tr><th>{t('branch')}</th><th>{t('balance')}</th></tr></thead>
          <tbody>
            {branchBalances.map((b) => (
              <tr key={b.id}><td>{b.name}</td><td className={b.balance >= 0 ? 'income' : 'expense'}>LKR {b.balance.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>{t('sixMonthTrend')}</h2>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="income" stroke="#2e7d32" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#b3261e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>{t('topExpenseHeads')}</h2>
        <table>
          <thead><tr><th>{t('head')}</th><th>{t('amount')}</th></tr></thead>
          <tbody>
            {topExpenses.map((e) => <tr key={e.name}><td>{e.name}</td><td className="expense">{e.value.toLocaleString()}</td></tr>)}
          </tbody>
        </table>
        {topExpenses.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('noExpensesThisMonth')}</p>}
      </div>
    </div>
  )
}
