import { useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useLanguage } from '../i18n/LanguageContext'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function ContraFormModal({ mode, voucher, branches, onClose }) {
  const { t } = useLanguage()
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    date: voucher?.date || todayStr(),
    contraDirection: voucher?.contraDirection || 'CashToBank',
    amount: voucher?.amount || '',
    branchId: voucher?.branchId || '',
    narration: voucher?.narration || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.branchId) return
    setSaving(true)
    const branch = branches.find((b) => b.id === form.branchId)
    const payload = {
      type: 'Contra',
      contraDirection: form.contraDirection,
      date: form.date,
      amount: Number(form.amount),
      branchId: form.branchId,
      branchName: branch?.name || '',
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
        <h2>{isEdit ? t('editContraEntry') : t('newContraEntry')}</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          {t('contraExplain')}
        </p>
        <form onSubmit={handleSave}>
          <label>{t('direction')}</label>
          <select value={form.contraDirection} onChange={(e) => setForm({ ...form, contraDirection: e.target.value })}>
            <option value="CashToBank">{t('cashDepositedIntoBank')}</option>
            <option value="BankToCash">{t('cashWithdrawnFromBank')}</option>
          </select>

          <div className="grid-2">
            <div>
              <label>{t('date')}</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label>{t('amount')}</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>

          <label>{t('branch')}</label>
          <select required value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
            <option value="">{t('selectBranch')}</option>
            {branches.filter((b) => b.active !== false).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <label>{t('narration')}</label>
          <textarea rows="2" value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? t('saving') : isEdit ? t('saveChanges') : t('addContraEntry')}</button>
            <button className="secondary" type="button" onClick={onClose}>{t('cancel')}</button>
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
