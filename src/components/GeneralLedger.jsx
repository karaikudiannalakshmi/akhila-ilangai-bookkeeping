import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'
import { sortHeads } from '../utils/headSort'
import { useLanguage } from '../i18n/LanguageContext'

export default function GeneralLedger() {
  const { t } = useLanguage()
  const { data: vouchers } = useCollection('vouchers')
  const { data: heads } = useCollection('coa')
  const { data: branches } = useCollection('branches')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const opening = openingCashBankData.find((d) => d.id === 'main')
  const [headId, setHeadId] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [period, setPeriod] = useState(defaultPeriodValue())

  const { from, to, label } = resolvePeriod(period)
  const selectedHead = heads.find((h) => h.id === headId)

  const incomeHeads = sortHeads(heads.filter((h) => h.type === 'Income'))
  const expenseHeads = sortHeads(heads.filter((h) => h.type === 'Expense'))

  const rows = useMemo(() => {
    if (!headId) return []
    const entries = vouchers
      .filter((v) => v.headId === headId)
      .filter((v) => branchFilter === 'all' || resolveBranchId(v) === branchFilter)
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    let balance = 0
    return entries.map((v) => {
      // For Income heads, credits increase balance; for Expense heads, debits increase balance
      balance += v.amount
      return { ...v, balance }
    })
  }, [vouchers, headId, branchFilter, from, to])

  const total = rows.reduce((s, v) => s + v.amount, 0)

  return (
    <div className="card">
      <h2>{t('ledgersTitle')}</h2>
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>{t('period')}: {label} ({from} to {to})</p>
      <div className="filter-row">
        <select value={headId} onChange={(e) => setHeadId(e.target.value)}>
          <option value="">{t('selectHead')}</option>
          {incomeHeads.length > 0 && (
            <optgroup label={t('income')}>
              {incomeHeads.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </optgroup>
          )}
          {expenseHeads.length > 0 && (
            <optgroup label={t('expense')}>
              {expenseHeads.map((h) => <option key={h.id} value={h.id}>{h.name} {h.category === 'Capital' ? `(${t('capital')})` : ''}</option>)}
            </optgroup>
          )}
        </select>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">{t('allBranches')}</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />

      {!headId && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('selectHeadPrompt')}</p>}

      {headId && (
        <>
          <div className="summary-grid">
            <div className="summary-box">
              <div className={`value ${selectedHead?.type === 'Income' ? 'income' : 'expense'}`}>LKR {total.toLocaleString()}</div>
              <div className="label">{selectedHead?.type === 'Income' ? t('totalCr') : t('totalDr')}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>{t('date')}</th><th>{t('branch')}</th><th>{t('narrationCol')}</th><th>{t('amount')}</th><th>{t('runningTotal')}</th></tr></thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.branchName || v.locationName || '—'}</td>
                  <td>{v.narration || '—'}</td>
                  <td className={v.type === 'Income' ? 'income' : 'expense'}>{v.amount.toLocaleString()}</td>
                  <td>{v.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('noEntriesForHeadPeriod')}</p>}
        </>
      )}
    </div>
  )
}
