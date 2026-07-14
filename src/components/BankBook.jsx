import { useMemo, useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'
import VoucherFormModal from './VoucherFormModal'
import ContraFormModal from './ContraFormModal'
import { bankDelta, isBankBookEntry } from '../utils/cashBank'

const BANK_MODES = ['Cheque', 'Bank Transfer', 'Online']

export default function BankBook() {
  const { data: vouchers } = useCollection('vouchers')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const { data: heads } = useCollection('coa')
  const { data: properties } = useCollection('properties')
  const { data: locations } = useCollection('locations')
  const opening = openingCashBankData.find((d) => d.id === 'main')

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showContra, setShowContra] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editingContra, setEditingContra] = useState(null)

  const openingBank = opening?.bank || 0
  const openingDate = opening?.asOfDate || ''

  const rows = useMemo(() => {
    const bankVouchers = vouchers
      .filter(isBankBookEntry)
      .filter((v) => !openingDate || v.date >= openingDate)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    let balance = openingBank
    const withBalance = bankVouchers.map((v) => {
      balance += bankDelta(v)
      return { ...v, balance, delta: bankDelta(v) }
    })
    return withBalance
      .filter((v) => !from || v.date >= from)
      .filter((v) => !to || v.date <= to)
  }, [vouchers, openingBank, openingDate, from, to])

  const totalReceipts = rows.filter((v) => v.delta > 0).reduce((s, v) => s + v.delta, 0)
  const totalPayments = rows.filter((v) => v.delta < 0).reduce((s, v) => s - v.delta, 0)
  const closingBalance = rows.length > 0 ? rows[rows.length - 1].balance : openingBank

  const handleDelete = async (id) => {
    if (confirm('Delete this entry? This cannot be undone.')) await deleteDoc(doc(db, 'vouchers', id))
  }

  const particulars = (v) => {
    if (v.type === 'Contra') {
      return v.contraDirection === 'CashToBank' ? 'Contra — Deposited from Cash' : 'Contra — Withdrawn to Cash'
    }
    return v.headName + (v.narration ? ` — ${v.narration}` : '')
  }

  return (
    <div className="card">
      <h2>Bank Book</h2>
      {!opening && (
        <p style={{ fontSize: '0.8rem', color: 'var(--red)' }}>
          No opening bank balance set yet — set it under Opening Balances for an accurate running balance.
        </p>
      )}
      <div className="filter-row" style={{ justifyContent: 'space-between' }}>
        <div className="filter-row" style={{ margin: 0 }}>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="secondary" onClick={() => setShowContra(true)}>Contra Entry</button>
          <button className="primary" style={{ marginTop: 0 }} onClick={() => setShowAdd(true)}>+ New Bank Entry</button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-box"><div className="value">LKR {openingBank.toLocaleString()}</div><div className="label">Opening Bank</div></div>
        <div className="summary-box"><div className="value income">LKR {totalReceipts.toLocaleString()}</div><div className="label">Receipts</div></div>
        <div className="summary-box"><div className="value expense">LKR {totalPayments.toLocaleString()}</div><div className="label">Payments</div></div>
        <div className="summary-box"><div className="value">LKR {closingBalance.toLocaleString()}</div><div className="label">Closing Bank</div></div>
      </div>

      <table>
        <thead><tr><th>Date</th><th>Particulars</th><th>Mode</th><th>Receipts</th><th>Payments</th><th>Balance</th><th></th></tr></thead>
        <tbody>
          <tr>
            <td>{openingDate || '—'}</td>
            <td style={{ fontWeight: 600 }}>Opening Balance</td>
            <td></td><td></td><td></td>
            <td style={{ fontWeight: 600 }}>{openingBank.toLocaleString()}</td>
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
                <button className="secondary small-btn" onClick={() => v.type === 'Contra' ? setEditingContra(v) : setEditing(v)}>Edit</button>{' '}
                <button className="secondary small-btn" onClick={() => handleDelete(v.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>No bank entries in this period.</p>}

      {showAdd && (
        <VoucherFormModal
          mode="add"
          allowedModes={BANK_MODES}
          heads={heads}
          properties={properties}
          locations={locations}
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
          locations={locations}
          onClose={() => setEditing(null)}
        />
      )}
      {showContra && (
        <ContraFormModal mode="add" locations={locations} onClose={() => setShowContra(false)} />
      )}
      {editingContra && (
        <ContraFormModal mode="edit" voucher={editingContra} locations={locations} onClose={() => setEditingContra(null)} />
      )}
    </div>
  )
}
