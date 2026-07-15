// Financial Year runs 1 April to 31 March, matching Sri Lankan trust accounting.
// A financial year is identified by its start date, e.g. '2025-04-01' = FY 2025-26.

export function fyFromStartYear(startYear) {
  const endYear = startYear + 1
  return {
    key: `${startYear}-04-01`,
    label: `FY ${startYear}-${String(endYear).slice(-2)}`,
    start: `${startYear}-04-01`,
    end: `${endYear}-03-31`,
  }
}

export function fyForDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = d.getMonth() // 0-indexed; April = 3
  const startYear = m >= 3 ? y : y - 1
  return fyFromStartYear(startYear)
}

export function currentFY() {
  return fyForDate(new Date().toISOString().slice(0, 10))
}

// Builds a sorted (most recent first) list of financial years spanning from the
// earliest known date (opening balance date or earliest voucher) through the
// current financial year, so past years remain selectable even with no
// transactions in them.
export function listFinancialYears(vouchers, openingDate) {
  const dates = vouchers.map((v) => v.date).filter(Boolean)
  if (openingDate) dates.push(openingDate)
  dates.push(new Date().toISOString().slice(0, 10))

  if (dates.length === 0) return [currentFY()]

  const years = dates.map((d) => fyForDate(d).start.slice(0, 4)).map(Number)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years, Number(currentFY().start.slice(0, 4)))

  const list = []
  for (let y = maxYear; y >= minYear; y--) {
    list.push(fyFromStartYear(y))
  }
  return list
}

// Resolves a period-selector value ({ mode, fyStart, month, from, to }) into a
// concrete { from, to } date range for filtering.
export function resolvePeriod(value) {
  if (value.mode === 'FY') {
    const startYear = Number((value.fyStart || currentFY().start).slice(0, 4))
    const fy = fyFromStartYear(startYear)
    return { from: fy.start, to: fy.end, label: fy.label }
  }
  if (value.mode === 'Month') {
    const month = value.month || new Date().toISOString().slice(0, 7)
    const [y, m] = month.split('-').map(Number)
    const lastDay = new Date(y, m, 0).getDate()
    return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}`, label: month }
  }
  // Range
  return { from: value.from || '', to: value.to || '', label: 'Custom Range' }
}

export function defaultPeriodValue() {
  return { mode: 'FY', fyStart: currentFY().start, month: new Date().toISOString().slice(0, 7), from: '', to: '' }
}
