import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'
import { findRecordForBranch, resolveBranchId } from '../utils/branch'
import { useLanguage } from '../i18n/LanguageContext'

export default function OpeningBalances() {
  const { t } = useLanguage()
  const { data: openingBalances } = useCollection('openingBalances')
  const { data: openingAssets } = useCollection('fixedAssetsOpening')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const { data: branches } = useCollection('branches')
  const openingCashBank = openingCashBankData.find((d) => d.id === 'main')

  const [asOfDate, setAsOfDate] = useState('')
  const [balForm, setBalForm] = useState({})
  const [cashBankForm, setCashBankForm] = useState({ cash: '', bank: '' })

  const [assetForm, setAssetForm] = useState({ name: '', branchId: '', value: '', dateAcquired: '' })
  const [editingAssetId, setEditingAssetId] = useState(null)
  const [editAssetForm, setEditAssetForm] = useState({})

  const saveFundBalances = async (e) => {
    e.preventDefault()
    if (!asOfDate) { alert(t('pleaseSetAsOfDate')); return }
    for (const b of branches) {
      const amount = Number(balForm[b.id]) || 0
      await setDoc(doc(db, 'openingBalances', b.id), { branchId: b.id, amount, asOfDate })
    }
    alert(t('savedBranchBalances'))
  }

  const saveCashBank = async (e) => {
    e.preventDefault()
    if (!asOfDate) { alert(t('pleaseSetAsOfDate')); return }
    await setDoc(doc(db, 'openingCashBank', 'main'), {
      cash: Number(cashBankForm.cash) || 0,
      bank: Number(cashBankForm.bank) || 0,
      asOfDate,
    })
    alert(t('savedCashBank'))
  }

  const addAsset = async (e) => {
    e.preventDefault()
    if (!assetForm.name.trim() || !assetForm.value || !assetForm.branchId) return
    await addDoc(collection(db, 'fixedAssetsOpening'), {
      name: assetForm.name,
      branchId: assetForm.branchId,
      value: Number(assetForm.value),
      dateAcquired: assetForm.dateAcquired || null,
      asOfDate,
    })
    setAssetForm({ name: '', branchId: branches[0]?.id || '', value: '', dateAcquired: '' })
  }

  const deleteAsset = async (id) => {
    if (confirm(t('confirmDeleteOpeningAsset'))) await deleteDoc(doc(db, 'fixedAssetsOpening', id))
  }

  const startEditAsset = (a) => {
    setEditingAssetId(a.id)
    setEditAssetForm({ name: a.name, branchId: resolveBranchId(a) || branches[0]?.id || '', value: a.value, dateAcquired: a.dateAcquired || '' })
  }

  const saveAsset = async (id) => {
    if (!editAssetForm.name.trim() || !editAssetForm.value) return
    await updateDoc(doc(db, 'fixedAssetsOpening', id), {
      name: editAssetForm.name,
      branchId: editAssetForm.branchId,
      value: Number(editAssetForm.value),
      dateAcquired: editAssetForm.dateAcquired || null,
    })
    setEditingAssetId(null)
  }

  const existingBalance = (branchId) => findRecordForBranch(openingBalances, branchId)?.amount

  return (
    <div>
      <div className="card">
        <h2>{t('openingCashBankTitle')}</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          {t('openingCashBankNote')}
        </p>
        <form onSubmit={saveCashBank}>
          <label>{t('asOfDate')}</label>
          <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          <div className="grid-2">
            <div>
              <label>{t('openingCashInHand')}</label>
              <input
                type="number"
                value={cashBankForm.cash}
                onChange={(e) => setCashBankForm({ ...cashBankForm, cash: e.target.value })}
                placeholder={openingCashBank ? `Current: ${openingCashBank.cash.toLocaleString()}` : ''}
              />
            </div>
            <div>
              <label>{t('openingBankBalanceLabel')}</label>
              <input
                type="number"
                value={cashBankForm.bank}
                onChange={(e) => setCashBankForm({ ...cashBankForm, bank: e.target.value })}
                placeholder={openingCashBank ? `Current: ${openingCashBank.bank.toLocaleString()}` : ''}
              />
            </div>
          </div>
          <button className="primary" type="submit">{t('saveCashBankBtn')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('openingBranchBalancesTitle')}</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          {t('openingBranchBalancesNote')}
        </p>
        <form onSubmit={saveFundBalances}>
          <label>{t('asOfDate')}</label>
          <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          {branches.map((b) => (
            <div key={b.id}>
              <label>{b.name} — {t('openingBalanceLKR')}</label>
              <input
                type="number"
                value={balForm[b.id] ?? ''}
                onChange={(e) => setBalForm({ ...balForm, [b.id]: e.target.value })}
                placeholder={existingBalance(b.id) !== undefined ? `Current: ${existingBalance(b.id).toLocaleString()}` : ''}
              />
            </div>
          ))}
          {branches.length === 0 && <p style={{ fontSize: '0.85rem', color: '#6b6258' }}>{t('addBranchesFirstNote')}</p>}
          <button className="primary" type="submit">{t('saveOpeningBalancesBtn')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('openingFixedAssetsTitle')}</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          {t('openingFixedAssetsNote')}
        </p>
        <form onSubmit={addAsset}>
          <label>{t('assetName')}</label>
          <input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} />
          <div className="grid-2">
            <div>
              <label>{t('branch')}</label>
              <select value={assetForm.branchId} onChange={(e) => setAssetForm({ ...assetForm, branchId: e.target.value })}>
                <option value="">{t('selectHead')}</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label>{t('valueAsPerBS')}</label>
              <input type="number" value={assetForm.value} onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })} />
            </div>
          </div>
          <label>{t('originalDateAcquired')}</label>
          <input type="date" value={assetForm.dateAcquired} onChange={(e) => setAssetForm({ ...assetForm, dateAcquired: e.target.value })} />
          <button className="primary" type="submit">{t('addOpeningAssetBtn')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('openingAssetsRecorded')} ({openingAssets.length})</h2>
        <table>
          <thead><tr><th>{t('assetName')}</th><th>{t('branch')}</th><th>{t('amount')}</th><th>{t('acquired')}</th><th></th></tr></thead>
          <tbody>
            {openingAssets.map((a) => (
              <tr key={a.id}>
                {editingAssetId === a.id ? (
                  <>
                    <td><input value={editAssetForm.name} onChange={(e) => setEditAssetForm({ ...editAssetForm, name: e.target.value })} /></td>
                    <td>
                      <select value={editAssetForm.branchId} onChange={(e) => setEditAssetForm({ ...editAssetForm, branchId: e.target.value })}>
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </td>
                    <td><input type="number" value={editAssetForm.value} onChange={(e) => setEditAssetForm({ ...editAssetForm, value: e.target.value })} /></td>
                    <td><input type="date" value={editAssetForm.dateAcquired} onChange={(e) => setEditAssetForm({ ...editAssetForm, dateAcquired: e.target.value })} /></td>
                    <td>
                      <button className="secondary small-btn" onClick={() => saveAsset(a.id)}>{t('save')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => setEditingAssetId(null)}>{t('cancel')}</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{a.name}</td>
                    <td>{branches.find((b) => b.id === resolveBranchId(a))?.name || 'Unclassified'}</td>
                    <td>LKR {Number(a.value).toLocaleString()}</td>
                    <td>{a.dateAcquired || '—'}</td>
                    <td>
                      <button className="secondary small-btn" onClick={() => startEditAsset(a)}>{t('edit')}</button>{' '}
                      <button className="secondary small-btn" onClick={() => deleteAsset(a.id)}>{t('delete')}</button>
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
