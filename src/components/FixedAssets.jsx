import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import PeriodFilter from './PeriodFilter'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { resolveBranchId } from '../utils/branch'
import { useLanguage } from '../i18n/LanguageContext'

export default function FixedAssets() {
  const { t } = useLanguage()
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
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>{t('period')}: {label} ({from} to {to})</p>
      <PeriodFilter vouchers={vouchers} openingDate={opening?.asOfDate} value={period} onChange={setPeriod} />

      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {openingForPeriod.toLocaleString()}</div><div className="label">{t('openingCarriedForwardLabel')}</div></div>
        <div className="summary-box"><div className="value income">LKR {additionsTotal.toLocaleString()}</div><div className="label">{t('additionsThisPeriod')}</div></div>
        <div className="summary-box"><div className="value">LKR {closingForPeriod.toLocaleString()}</div><div className="label">{t('closingFixedAssets')}</div></div>
      </div>

      <div className="card">
        <h2>{t('openingAssetsHeading')}</h2>
        <table>
          <thead><tr><th>{t('assetName')}</th><th>{t('branch')}</th><th>{t('amount')}</th><th>{t('acquired')}</th></tr></thead>
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
            <tr style={{ fontWeight: 700 }}><td colSpan={2}>{t('total')}</td><td>{openingRegisterTotal.toLocaleString()}</td><td></td></tr>
          </tfoot>
        </table>
        {openingAssets.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>
            {t('noOpeningAssetsNote')}
          </p>
        )}
      </div>

      <div className="card">
        <h2>{t('additionsInPeriod')}</h2>
        <table>
          <thead><tr><th>{t('date')}</th><th>{t('head')}</th><th>{t('branch')}</th><th>{t('amount')}</th><th>{t('narrationCol')}</th></tr></thead>
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
            <tr style={{ fontWeight: 700 }}><td colSpan={3}>{t('total')}</td><td className="expense">{additionsTotal.toLocaleString()}</td><td></td></tr>
          </tfoot>
        </table>
        {additionsInPeriod.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('noCapitalExpenditurePeriod')}</p>}
      </div>
    </div>
  )
}
