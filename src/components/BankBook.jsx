import { useMemo, useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'
import VoucherFormModal from './VoucherFormModal'
import ContraFormModal from './ContraFormModal'
import PeriodFilter from './PeriodFilter'
import { bankDelta, isBankBookEntry } from '../utils/cashBank'
import { resolvePeriod, defaultPeriodValue } from '../utils/financialYear'
import { useLanguage } from '../i18n/LanguageContext'

const BANK_MODES = ['Cheque', 'Bank Transfer', 'Online']

export default function BankBook() {
  const { t } = useLanguage()
  const { data: vouchers } = useCollection('vouchers')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const { data: heads } = useCollection('coa')
  const { data: properties } = useCollection('properties')
  const { data: branches } = useCollection('branches')
  const openingRecord = openingCashBankData.find((d) => d.id === 'main')
  const baseOpeningBank = openingRecord?.bank || 0
  const baseOpeningDate = openingRecord?.asOfDate || ''

  const [period, setPeriod] = useState(defaultPeriodValue())
  const [showAdd, setShowAdd] = useState(false)
  const [showContra, setShowContra] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editingContra, setEditingContra] = useState(null)

  const { from, to, label } = resolvePeriod(period)

  const bankEntries = useMemo(
    () => vouchers.filter(isBankBookEntry).filter((v) => !baseOpeningDate || v.date >= baseOpeningDate),
    [vouchers, baseOpeningDate]
  )

  const openingForPeriod = useMemo(() => {
    return baseOpeningBank + bankEntries.filter((v) => v.date < from).reduce((s, v) => s + bankDelta(v), 0)
  }, [bankEntries, baseOpeningBank, from])

  const rows = useMemo(() => {
    const inPeriod = bankEntries
      .filter((v) => v.date >= from && v.date <= to)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    let balance = openingForPeriod
    return inPeriod.map((v) => {
      balance += bankDelta(v)
      return { ...v, balance, delta: bankDelta(v) }
    })
  }, [bankEntries, from, to, openingForPeriod])

  const totalReceipts = rows.filter((v) => v.delta > 0).reduce((s, v) => s + v.delta, 0)
  const totalPayments = rows.filter((v) => v.delta < 0).reduce((s, v) => s - v.delta, 0)
  const closingBalance = openingForPeriod + rows.reduce((s, v) => s + v.delta, 0)

  const handleDelete = async (id) => {
    if (confirm(t('confirmDeleteEntry'))) await deleteDoc(doc(db, 'vouchers', id))
  }

  const particulars = (v) => {
    if (v.type === 'Contra') {
      return v.contraDirection === 'CashToBank' ? t('contraDepositedCash') : t('contraWithdrawnCash')
    }
    return v.headName + (v.narration ? ` — ${v.narration}` : '')
  }

  return (
    <div className="card">
      <h2>{t('bankBookTitle')}</h2>
      {!openingRecord && (
        <p style={{ fontSize: '0.8rem', color: 'var(--red)' }}>
          {t('openingBankBoxWarning')}
        </p>
      )}
      <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>{t('period')}: {label} ({from} to {to})</p>
      <div className="filter-row" style={{ justifyContent: 'space-between' }}>
        <PeriodFilter vouchers={vouchers} openingDate={baseOpeningDate} value={period} onChange={setPeriod} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="secondary" onClick={() => setShowContra(true)}>{t('contraEntry')}</button>
          <button className="primary" style={{ marginTop: 0 }} onClick={() => setShowAdd(true)}>{t('newBankEntry')}</button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {openingForPeriod.toLocaleString()}</div><div className="label">{t('openingCarriedForward')}</div></div>
        <div className="summary-box"><div className="value income">LKR {totalReceipts.toLocaleString()}</div><div className="label">{t('receipts')}</div></div>
        <div className="summary-box"><div className="value expense">LKR {totalPayments.toLocaleString()}</div><div className="label">{t('payments')}</div></div>
        <div className="summary-box"><div className="value">LKR {closingBalance.toLocaleString()}</div><div className="label">{t('closingBankLabel')}</div></div>
      </div>

      <table>
        <thead><tr><th>{t('date')}</th><th>{t('particulars')}</th><th>{t('mode')}</th><th>{t('receipts')}</th><th>{t('payments')}</th><th>{t('balance')}</th><th></th></tr></thead>
        <tbody>
          <tr>
            <td>{from}</td>
            <td style={{ fontWeight: 600 }}>{t('openingBalanceBF')}</td>
            <td></td><td></td><td></td>
            <td style={{ fontWeight: 600 }}>{openingForPeriod.toLocaleString()}</td>
            <td></td>
          </tr>
          {rows.map((v) => (
            <tr key={v.id}>
              <td>{v.date}</td>
              <td>{particulars(v)}</td>
              <td>{v.type === 'Contra' ? 'Contra' : v.paymentMode}</td>
              <td className="income">{v.delta > 0 ? v.delta.toLocaleString() : ''}</td>
              <td className="expense">{v.delta < 0 ? Math.abs(v.delta).toLocaleString() : ''}</td>
              <td>{v.balance.toLocaleString()}</td>
              <td>
                <button className="secondary small-btn" onClick={() => v.type === 'Contra' ? setEditingContra(v) : setEditing(v)}>{t('edit')}</button>{' '}
                <button className="secondary small-btn" onClick={() => handleDelete(v.id)}>{t('delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('noBankEntries')}</p>}

      {showAdd && (
        <VoucherFormModal
          mode="add"
          allowedModes={BANK_MODES}
          heads={heads}
          properties={properties}
          branches={branches}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <VoucherFormModal
          mode="edit"
          voucher={editing}
          allowedModes={BANK_MODES}
          heads={heads}
          properties={properties}
          branches={branches}
          onClose={() => setEditing(null)}
        />
      )}
      {showContra && (
        <ContraFormModal mode="add" branches={branches} onClose={() => setShowContra(false)} />
      )}
      {editingContra && (
        <ContraFormModal mode="edit" voucher={editingContra} branches={branches} onClose={() => setEditingContra(null)} />
      )}
    </div>
  )
}
