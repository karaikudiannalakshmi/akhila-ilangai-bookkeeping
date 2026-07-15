import { useMemo, useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { PAYMENT_MODES } from '../constants/chartOfAccounts'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function VoucherFormModal({ mode, voucher, allowedModes, heads, properties, branches, onClose }) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    date: voucher?.date || todayStr(),
    type: voucher?.type || 'Income',
    headId: voucher?.headId || '',
    branchId: voucher?.branchId || '',
    propertyId: voucher?.propertyId || '',
    amount: voucher?.amount || '',
    paymentMode: voucher?.paymentMode || allowedModes[0],
    narration: voucher?.narration || '',
  })
  const [saving, setSaving] = useState(false)

  const activeHeads = useMemo(
    () => heads.filter((h) => h.active !== false && h.type === form.type),
    [heads, form.type]
  )
  const selectedHead = heads.find((h) => h.id === form.headId)
  const isRentHead = selectedHead?.name === 'Rent Income'

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.headId || !form.amount || !form.branchId) return
    setSaving(true)
    const head = heads.find((h) => h.id === form.headId)
    const branch = branches.find((b) => b.id === form.branchId)
    const payload = {
      date: form.date,
      type: form.type,
      headId: form.headId,
      headName: head.name,
      category: head.category,
      branchId: form.branchId,
      branchName: branch?.name || '',
      propertyId: isRentHead ? form.propertyId : null,
      amount: Number(form.amount),
      paymentMode: form.paymentMode,
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
        <h2>{isEdit ? 'Edit Entry' : 'New Entry'}</h2>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, headId: '' })}>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
          </div>

          <label>Branch</label>
          <select required value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
            <option value="">-- Select Branch --</option>
            {branches.filter((b) => b.active !== false).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <label>Head</label>
          <select value={form.headId} onChange={(e) => setForm({ ...form, headId: e.target.value })}>
            <option value="">-- Select --</option>
            {activeHeads.filter((h) => h.category === 'Revenue').length > 0 && (
              <optgroup label="Revenue">
                {activeHeads.filter((h) => h.category === 'Revenue').map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </optgroup>
            )}
            {activeHeads.filter((h) => h.category === 'Capital').length > 0 && (
              <optgroup label="Capital">
                {activeHeads.filter((h) => h.category === 'Capital').map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </optgroup>
            )}
          </select>

          {isRentHead && (
            <>
              <label>Property</label>
              <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">-- Select Property --</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.tenantName})</option>)}
              </select>
            </>
          )}

          <div className="grid-2">
            <div>
              <label>Amount (LKR)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label>Payment Mode</label>
              {allowedModes.length > 1 ? (
                <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                  {allowedModes.map((m) => <option key={m}>{m}</option>)}
                </select>
              ) : (
                <input value={allowedModes[0]} disabled />
              )}
            </div>
          </div>

          <label>Narration / Remarks</label>
          <textarea rows="2" value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Entry'}</button>
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
