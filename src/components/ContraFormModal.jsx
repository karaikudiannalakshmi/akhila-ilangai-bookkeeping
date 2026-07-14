import { useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function ContraFormModal({ mode, voucher, locations, onClose }) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    date: voucher?.date || todayStr(),
    contraDirection: voucher?.contraDirection || 'CashToBank',
    amount: voucher?.amount || '',
    locationId: voucher?.locationId || '',
    narration: voucher?.narration || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.locationId) return
    setSaving(true)
    const location = locations.find((l) => l.id === form.locationId)
    const payload = {
      type: 'Contra',
      contraDirection: form.contraDirection,
      date: form.date,
      amount: Number(form.amount),
      locationId: form.locationId,
      locationName: location?.name || '',
      narration: form.narration,
    }
    if (isEdit) {
      await updateDoc(doc(db, 'vouchers', voucher.id), payload)
    } else {
      await addDoc(collection(db, 'vouchers'), { ...payload, createdAt: serverTimestamp() })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="card">
        <h2>{isEdit ? 'Edit Contra Entry' : 'New Contra Entry'}</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          For moving money between cash and bank — a cash withdrawal from the bank, or a cash deposit
          into the bank. This is not income or expense, and appears in both the Cash Book and Bank Book.
        </p>
        <form onSubmit={handleSave}>
          <label>Direction</label>
          <select value={form.contraDirection} onChange={(e) => setForm({ ...form, contraDirection: e.target.value })}>
            <option value="CashToBank">Cash deposited into Bank</option>
            <option value="BankToCash">Cash withdrawn from Bank</option>
          </select>

          <div className="grid-2">
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label>Amount (LKR)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>

          <label>Centre / Location</label>
          <select required value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
            <option value="">-- Select Centre --</option>
            {locations.filter((l) => l.active !== false).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <label>Narration / Remarks</label>
          <textarea rows="2" value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Contra Entry'}</button>
            <button className="secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '20px',
  overflowY: 'auto',
  zIndex: 50,
}

const modalStyle = {
  width: '100%',
  maxWidth: 480,
  marginTop: 20,
  marginBottom: 20,
}
