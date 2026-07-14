// A normal voucher affects only one instrument (Cash, or Bank via Cheque/Bank
// Transfer/Online) based on its paymentMode.
// A Contra voucher (type: 'Contra') represents an internal transfer between
// cash and bank — it is not income or expense, so it must never be counted
// in Trial Balance, Expenditure Analysis, Fund Balances, or the Ledgers
// report. It only ever affects the Cash Book and Bank Book running balances,
// moving in opposite directions in each.

export function cashDelta(v) {
  if (v.type === 'Contra') {
    return v.contraDirection === 'BankToCash' ? v.amount : -v.amount
  }
  if (v.paymentMode !== 'Cash') return 0
  return v.type === 'Income' ? v.amount : -v.amount
}

export function bankDelta(v) {
  if (v.type === 'Contra') {
    return v.contraDirection === 'CashToBank' ? v.amount : -v.amount
  }
  if (v.paymentMode === 'Cash') return 0
  return v.type === 'Income' ? v.amount : -v.amount
}

export function isCashBookEntry(v) {
  return v.paymentMode === 'Cash' || v.type === 'Contra'
}

export function isBankBookEntry(v) {
  return (v.paymentMode && v.paymentMode !== 'Cash') || v.type === 'Contra'
}
