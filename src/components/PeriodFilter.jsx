import { useMemo } from 'react'
import { listFinancialYears } from '../utils/financialYear'

export default function PeriodFilter({ vouchers, openingDate, value, onChange }) {
  const fyOptions = useMemo(() => listFinancialYears(vouchers || [], openingDate), [vouchers, openingDate])

  return (
    <div className="filter-row">
      <select value={value.mode} onChange={(e) => onChange({ ...value, mode: e.target.value })}>
        <option value="FY">Financial Year</option>
        <option value="Month">Month</option>
        <option value="Range">Custom Range</option>
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
          <input type="date" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} placeholder="From" />
          <input type="date" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} placeholder="To" />
        </>
      )}
    </div>
  )
}
