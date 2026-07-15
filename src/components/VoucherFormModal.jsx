import { useMemo, useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { PAYMENT_MODES } from '../constants/chartOfAccounts'
import { sortHeads } from '../utils/headSort'
import { useLanguage } from '../i18n/LanguageContext'

const todayStr = () => new Date().toISOString().slice(0, 10)

const CLASSIFICATIONS = [
  ['Income', 'income'],
  ['Expenses', 'expenses'],
  ['Assets', 'assets'],
  ['Liabilities', 'liabilities'],
]

function classifyHead(h) {
  if (h.category === 'Liability') return 'Liabilities'
  if (h.category === 'Capital') return 'Assets'
  if (h.type === 'Income') return 'Income'
  return 'Expenses'
}

export default function VoucherFormModal({ mode, voucher, allowedModes, heads, properties, branches, onClose }) {
  const { t, lang } = useLanguage()
  const isEdit = mode === 'edit'
  const initialHead = heads.find((h) => h.id === voucher?.headId)

  const [form, setForm] = useState({
    date: voucher?.date || todayStr(),
    classification: initialHead ? classifyHead(initialHead) : 'Income',
    headId: voucher?.headId || '',
    branchId: voucher?.branchId || '',
    propertyId: voucher?.propertyId || '',
    amount: voucher?.amount || '',
    paymentMode: voucher?.paymentMode || allowedModes[0],
    narration: voucher?.narration || '',
  })
  const [saving, setSaving] = useState(false)

  const activeHeads = useMemo(
    () => sortHeads(heads.filter((h) => h.active !== false && classifyHead(h) === form.classification)),
    [heads, form.classification]
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
      type: head.type, // cash-flow direction always comes from the head itself
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
        <h2>{isEdit ? t('editEntry') : t('newEntry')}</h2>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div>
              <label>{t('date')}</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label>{t('classification')}</label>
              <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value, headId: '' })}>
                {CLASSIFICATIONS.map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}
              </select>
            </div>
          </div>

          <label>{t('branch')}</label>
          <select required value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
            <option value="">{t('selectBranch')}</option>
            {branches.filter((b) => b.active !== false).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <label>{t('head')}</label>
          <select value={form.headId} onChange={(e) => setForm({ ...form, headId: e.target.value })}>
            <option value="">{t('selectHead')}</option>
            {activeHeads.map((h) => (
              <option key={h.id} value={h.id}>{h.name} {h.type === 'Income' ? t('inLabel') : t('outLabel')}</option>
            ))}
          </select>
          {form.classification === 'Liabilities' && activeHeads.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: '#6b6258', marginTop: 4 }}>
              {t('liabilityInOutNote')}
            </p>
          )}
          {activeHeads.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--red)', marginTop: 4 }}>
              {t('noHeadsForClassification').replace('{classification}', t(form.classification.toLowerCase()).toLowerCase())}
            </p>
          )}

          {isRentHead && (
            <>
              <label>{t('property')}</label>
              <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                <option value="">{t('selectProperty')}</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.tenantName})</option>)}
              </select>
            </>
          )}

          <div className="grid-2">
            <div>
              <label>{t('amount')}</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label>{t('paymentMode')}</label>
              {allowedModes.length > 1 ? (
                <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                  {allowedModes.map((m) => <option key={m}>{m}</option>)}
                </select>
              ) : (
                <input value={allowedModes[0]} disabled />
              )}
            </div>
          </div>

          <label>{t('narration')}</label>
          <textarea rows="2" value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? t('saving') : isEdit ? t('saveChanges') : t('addEntry')}</button>
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
