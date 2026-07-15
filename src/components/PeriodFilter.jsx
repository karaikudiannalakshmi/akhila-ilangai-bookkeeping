import { useMemo } from 'react'
import { listFinancialYears } from '../utils/financialYear'
import { useLanguage } from '../i18n/LanguageContext'

export default function PeriodFilter({ vouchers, openingDate, value, onChange }) {
  const { t } = useLanguage()
  const fyOptions = useMemo(() => listFinancialYears(vouchers || [], openingDate), [vouchers, openingDate])

  return (
    <div className="filter-row">
      <select value={value.mode} onChange={(e) => onChange({ ...value, mode: e.target.value })}>
        <option value="FY">{t('financialYear')}</option>
        <option value="Month">{t('month')}</option>
        <option value="Range">{t('customRange')}</option>
      </select>

      {value.mode === 'FY' && (
        <select value={value.fyStart} onChange={(e) => onChange({ ...value, fyStart: e.target.value })}>
          {fyOptions.map((fy) => <option key={fy.key} value={fy.start}>{fy.label}</option>)}
        </select>
      )}

      {value.mode === 'Month' && (
        <input type="month" value={value.month} onChange={(e) => onChange({ ...value, month: e.target.value })} />
      )}

      {value.mode === 'Range' && (
        <>
          <input type="date" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} placeholder={t('from')} />
          <input type="date" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} placeholder={t('to')} />
        </>
      )}
    </div>
  )
}
