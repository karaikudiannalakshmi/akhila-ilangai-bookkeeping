import { useState, Fragment } from 'react'
import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'
import { DEFAULT_HEADS } from '../constants/chartOfAccounts'
import { BRANCH_SEED } from '../utils/branch'
import { sortHeads } from '../utils/headSort'
import { useLanguage } from '../i18n/LanguageContext'

export default function Admin() {
  const { t } = useLanguage()
  const { data: heads } = useCollection('coa')
  const { data: properties } = useCollection('properties')
  const { data: branches } = useCollection('branches')

  const [newHead, setNewHead] = useState({ name: '', type: 'Expense', category: 'Revenue' })
  const [newProperty, setNewProperty] = useState({ name: '', address: '', tenantName: '', tenantContact: '', monthlyRent: '' })
  const [newBranch, setNewBranch] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedingBranches, setSeedingBranches] = useState(false)
  const [msg, setMsg] = useState('')

  // Inline edit state
  const [editingHeadId, setEditingHeadId] = useState(null)
  const [editHeadForm, setEditHeadForm] = useState({})
  const [editingPropertyId, setEditingPropertyId] = useState(null)
  const [editPropertyForm, setEditPropertyForm] = useState({})
  const [editingBranchId, setEditingBranchId] = useState(null)
  const [editBranchName, setEditBranchName] = useState('')

  const seedBranches = async () => {
    setSeedingBranches(true)
    for (const b of BRANCH_SEED) {
      await setDoc(doc(db, 'branches', b.id), { name: b.name, active: true })
    }
    setSeedingBranches(false)
  }

  const addBranch = async (e) => {
    e.preventDefault()
    if (!newBranch.trim()) return
    await addDoc(collection(db, 'branches'), { name: newBranch.trim(), active: true })
    setNewBranch('')
  }

  const toggleBranch = async (b) => {
    await updateDoc(doc(db, 'branches', b.id), { active: !b.active })
  }

  const deleteBranch = async (id) => {
    if (confirm(t('confirmDeleteBranch'))) await deleteDoc(doc(db, 'branches', id))
  }

  const startEditBranch = (b) => {
    setEditingBranchId(b.id)
    setEditBranchName(b.name)
  }

  const saveBranch = async (id) => {
    if (!editBranchName.trim()) return
    await updateDoc(doc(db, 'branches', id), { name: editBranchName.trim() })
    setEditingBranchId(null)
  }

  const seedDefaults = async () => {
    setSeeding(true)
    for (const h of DEFAULT_HEADS) {
      await addDoc(collection(db, 'coa'), { ...h, active: true })
    }
    setSeeding(false)
    setMsg(t('loadedHeadsMsg').replace('{count}', DEFAULT_HEADS.length))
  }

  const addHead = async (e) => {
    e.preventDefault()
    if (!newHead.name.trim()) return
    await addDoc(collection(db, 'coa'), { ...newHead, active: true })
    setNewHead({ name: '', type: 'Expense', category: 'Revenue' })
  }

  const toggleHead = async (h) => {
    await updateDoc(doc(db, 'coa', h.id), { active: !h.active })
  }

  const deleteHead = async (id) => {
    if (confirm(t('confirmDeleteHead'))) {
      await deleteDoc(doc(db, 'coa', id))
    }
  }

  const startEditHead = (h) => {
    setEditingHeadId(h.id)
    setEditHeadForm({ name: h.name, type: h.type, category: h.category })
  }

  const saveHead = async (id) => {
    if (!editHeadForm.name.trim()) return
    await updateDoc(doc(db, 'coa', id), { ...editHeadForm })
    setEditingHeadId(null)
  }

  const addProperty = async (e) => {
    e.preventDefault()
    if (!newProperty.name.trim()) return
    await addDoc(collection(db, 'properties'), {
      ...newProperty,
      monthlyRent: Number(newProperty.monthlyRent) || 0,
    })
    setNewProperty({ name: '', address: '', tenantName: '', tenantContact: '', monthlyRent: '' })
  }

  const deleteProperty = async (id) => {
    if (confirm(t('confirmDeleteProperty'))) {
      await deleteDoc(doc(db, 'properties', id))
    }
  }

  const startEditProperty = (p) => {
    setEditingPropertyId(p.id)
    setEditPropertyForm({
      name: p.name || '',
      address: p.address || '',
      tenantName: p.tenantName || '',
      tenantContact: p.tenantContact || '',
      monthlyRent: p.monthlyRent || '',
    })
  }

  const saveProperty = async (id) => {
    if (!editPropertyForm.name.trim()) return
    await updateDoc(doc(db, 'properties', id), {
      ...editPropertyForm,
      monthlyRent: Number(editPropertyForm.monthlyRent) || 0,
    })
    setEditingPropertyId(null)
  }

  return (
    <div>
      {branches.length === 0 && (
        <div className="card">
          <h2>{t('getStartedBranches')}</h2>
          <p style={{ fontSize: '0.85rem' }}>{t('loadDefaultBranchesNote')}</p>
          <button className="primary" onClick={seedBranches} disabled={seedingBranches}>
            {seedingBranches ? t('loadingEllipsis') : t('loadDefaultBranchesBtn').replace('{count}', BRANCH_SEED.length)}
          </button>
        </div>
      )}

      <div className="card">
        <h2>{t('addBranchTitle')}</h2>
        <form onSubmit={addBranch}>
          <label>{t('branchName')}</label>
          <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder="e.g. Kilinochchi Training Centre" />
          <button className="primary" type="submit">{t('addBranchBtn')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('branchesTitle')} ({branches.length})</h2>
        <table>
          <thead><tr><th>{t('name')}</th><th></th></tr></thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} style={{ opacity: b.active === false ? 0.4 : 1 }}>
                {editingBranchId === b.id ? (
                  <>
                    <td><input value={editBranchName} onChange={(e) => setEditBranchName(e.target.value)} /></td>
                    <td>
                      <button className="secondary small-btn" onClick={() => saveBranch(b.id)}>{t('save')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => setEditingBranchId(null)}>{t('cancel')}</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{b.name}</td>
                    <td>
                      <button className="secondary small-btn" onClick={() => startEditBranch(b)}>{t('edit')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => toggleBranch(b)}>{b.active === false ? t('enable') : t('disable')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => deleteBranch(b.id)}>{t('delete')}</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {heads.length === 0 && (
        <div className="card">
          <h2>{t('getStartedHeads')}</h2>
          <p style={{ fontSize: '0.85rem' }}>{t('loadDefaultHeadsNote')}</p>
          <button className="primary" onClick={seedDefaults} disabled={seeding}>
            {seeding ? t('loadingEllipsis') : t('loadDefaultHeadsBtn').replace('{count}', DEFAULT_HEADS.length)}
          </button>
          {msg && <p style={{ color: 'var(--green)', fontSize: '0.8rem' }}>{msg}</p>}
        </div>
      )}

      <div className="card">
        <h2>{t('addHeadTitle')}</h2>
        <form onSubmit={addHead}>
          <label>{t('headName')}</label>
          <input value={newHead.name} onChange={(e) => setNewHead({ ...newHead, name: e.target.value })} />
          <div className="grid-2">
            <div>
              <label>{t('type')}</label>
              <select value={newHead.type} onChange={(e) => setNewHead({ ...newHead, type: e.target.value })}>
                <option value="Income">{t('income')}</option>
                <option value="Expense">{t('expense')}</option>
              </select>
            </div>
            <div>
              <label>{t('category')}</label>
              <select value={newHead.category} onChange={(e) => setNewHead({ ...newHead, category: e.target.value })}>
                <option value="Revenue">{t('revenue')}</option>
                <option value="Capital">{t('capital')}</option>
                <option value="Liability">{t('liability')}</option>
              </select>
            </div>
          </div>
          <button className="primary" type="submit">{t('addHeadBtn')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('existingHeadsTitle')} ({heads.length})</h2>
        <table>
          <thead>
            <tr><th>{t('name')}</th><th>{t('type')}</th><th>{t('category')}</th><th></th></tr>
          </thead>
          <tbody>
            {sortHeads(heads).map((h, i, arr) => {
              const labelFor = (head) => head.category === 'Liability' ? t('groupLiabilities') : head.category === 'Capital' ? t('groupAssets') : head.type === 'Income' ? t('groupIncome') : t('groupExpenses')
              const groupLabel = labelFor(h)
              const prevGroupLabel = i > 0 ? labelFor(arr[i - 1]) : null
              const showDivider = groupLabel !== prevGroupLabel
              return (
              <Fragment key={h.id}>
                {showDivider && (
                  <tr key={`divider-${groupLabel}`}>
                    <td colSpan={4} style={{ background: '#f5efe0', fontWeight: 700, fontSize: '0.75rem', color: 'var(--maroon)', textTransform: 'uppercase' }}>{groupLabel}</td>
                  </tr>
                )}
              <tr key={h.id} style={{ opacity: h.active === false ? 0.4 : 1 }}>
                {editingHeadId === h.id ? (
                  <>
                    <td><input value={editHeadForm.name} onChange={(e) => setEditHeadForm({ ...editHeadForm, name: e.target.value })} /></td>
                    <td>
                      <select value={editHeadForm.type} onChange={(e) => setEditHeadForm({ ...editHeadForm, type: e.target.value })}>
                        <option value="Income">{t('income')}</option>
                        <option value="Expense">{t('expense')}</option>
                      </select>
                    </td>
                    <td>
                      <select value={editHeadForm.category} onChange={(e) => setEditHeadForm({ ...editHeadForm, category: e.target.value })}>
                        <option value="Revenue">{t('revenue')}</option>
                        <option value="Capital">{t('capital')}</option>
                        <option value="Liability">{t('liability')}</option>
                      </select>
                    </td>
                    <td>
                      <button className="secondary small-btn" onClick={() => saveHead(h.id)}>{t('save')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => setEditingHeadId(null)}>{t('cancel')}</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{h.name}</td>
                    <td className={h.type === 'Income' ? 'income' : 'expense'}>{h.type === 'Income' ? t('income') : t('expense')}</td>
                    <td>{h.category === 'Revenue' ? t('revenue') : h.category === 'Capital' ? t('capital') : h.category === 'Liability' ? t('liability') : h.category}</td>
                    <td>
                      <button className="secondary small-btn" onClick={() => startEditHead(h)}>{t('edit')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => toggleHead(h)}>{h.active === false ? t('enable') : t('disable')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => deleteHead(h.id)}>{t('delete')}</button>
                    </td>
                  </>
                )}
              </tr>
              </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>{t('addRentalPropertyTitle')}</h2>
        <form onSubmit={addProperty}>
          <label>{t('propertyName')}</label>
          <input value={newProperty.name} onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} />
          <label>{t('address')}</label>
          <input value={newProperty.address} onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} />
          <div className="grid-2">
            <div>
              <label>{t('tenantName')}</label>
              <input value={newProperty.tenantName} onChange={(e) => setNewProperty({ ...newProperty, tenantName: e.target.value })} />
            </div>
            <div>
              <label>{t('tenantContact')}</label>
              <input value={newProperty.tenantContact} onChange={(e) => setNewProperty({ ...newProperty, tenantContact: e.target.value })} />
            </div>
          </div>
          <label>{t('monthlyRent')}</label>
          <input type="number" value={newProperty.monthlyRent} onChange={(e) => setNewProperty({ ...newProperty, monthlyRent: e.target.value })} />
          <button className="primary" type="submit">{t('addPropertyBtn')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('propertiesTitle')} ({properties.length})</h2>
        <table>
          <thead><tr><th>{t('name')}</th><th>{t('tenant')}</th><th>{t('monthlyRent')}</th><th></th></tr></thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                {editingPropertyId === p.id ? (
                  <>
                    <td>
                      <input style={{ marginBottom: 4 }} value={editPropertyForm.name} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, name: e.target.value })} placeholder={t('name')} />
                      <input value={editPropertyForm.address} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, address: e.target.value })} placeholder={t('address')} />
                    </td>
                    <td>
                      <input style={{ marginBottom: 4 }} value={editPropertyForm.tenantName} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, tenantName: e.target.value })} placeholder={t('tenantName')} />
                      <input value={editPropertyForm.tenantContact} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, tenantContact: e.target.value })} placeholder={t('tenantContact')} />
                    </td>
                    <td>
                      <input type="number" value={editPropertyForm.monthlyRent} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, monthlyRent: e.target.value })} />
                    </td>
                    <td>
                      <button className="secondary small-btn" onClick={() => saveProperty(p.id)}>{t('save')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => setEditingPropertyId(null)}>{t('cancel')}</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{p.name}</td>
                    <td>{p.tenantName}</td>
                    <td>LKR {Number(p.monthlyRent).toLocaleString()}</td>
                    <td>
                      <button className="secondary small-btn" onClick={() => startEditProperty(p)}>{t('edit')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => deleteProperty(p.id)}>{t('delete')}</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
