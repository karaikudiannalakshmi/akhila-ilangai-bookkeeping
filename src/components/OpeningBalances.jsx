import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'
import { FUNDS } from '../constants/chartOfAccounts'

export default function OpeningBalances() {
  const { data: openingBalances } = useCollection('openingBalances')
  const { data: openingAssets } = useCollection('fixedAssetsOpening')
  const { data: openingCashBankData } = useCollection('openingCashBank')
  const openingCashBank = openingCashBankData.find((d) => d.id === 'main')

  const [asOfDate, setAsOfDate] = useState('')
  const [balForm, setBalForm] = useState(
    FUNDS.reduce((acc, f) => ({ ...acc, [f.id]: '' }), {})
  )
  const [cashBankForm, setCashBankForm] = useState({ cash: '', bank: '' })

  const [assetForm, setAssetForm] = useState({ name: '', fundId: 'general', value: '', dateAcquired: '' })
  const [editingAssetId, setEditingAssetId] = useState(null)
  const [editAssetForm, setEditAssetForm] = useState({})

  const saveFundBalances = async (e) => {
    e.preventDefault()
    if (!asOfDate) { alert('Please set the as-of date (usually the balance sheet date).'); return }
    for (const f of FUNDS) {
      const amount = Number(balForm[f.id]) || 0
      await setDoc(doc(db, 'openingBalances', f.id), { fundId: f.id, amount, asOfDate })
    }
    alert('Opening fund balances saved.')
  }

  const saveCashBank = async (e) => {
    e.preventDefault()
    if (!asOfDate) { alert('Please set the as-of date (usually the balance sheet date).'); return }
    await setDoc(doc(db, 'openingCashBank', 'main'), {
      cash: Number(cashBankForm.cash) || 0,
      bank: Number(cashBankForm.bank) || 0,
      asOfDate,
    })
    alert('Opening cash & bank balances saved.')
  }

  const addAsset = async (e) => {
    e.preventDefault()
    if (!assetForm.name.trim() || !assetForm.value) return
    await addDoc(collection(db, 'fixedAssetsOpening'), {
      name: assetForm.name,
      fundId: assetForm.fundId,
      value: Number(assetForm.value),
      dateAcquired: assetForm.dateAcquired || null,
      asOfDate,
    })
    setAssetForm({ name: '', fundId: 'general', value: '', dateAcquired: '' })
  }

  const deleteAsset = async (id) => {
    if (confirm('Delete this opening asset entry?')) await deleteDoc(doc(db, 'fixedAssetsOpening', id))
  }

  const startEditAsset = (a) => {
    setEditingAssetId(a.id)
    setEditAssetForm({ name: a.name, fundId: a.fundId, value: a.value, dateAcquired: a.dateAcquired || '' })
  }

  const saveAsset = async (id) => {
    if (!editAssetForm.name.trim() || !editAssetForm.value) return
    await updateDoc(doc(db, 'fixedAssetsOpening', id), {
      name: editAssetForm.name,
      fundId: editAssetForm.fundId,
      value: Number(editAssetForm.value),
      dateAcquired: editAssetForm.dateAcquired || null,
    })
    setEditingAssetId(null)
  }

  const existingBalance = (fundId) => openingBalances.find((b) => b.fundId === fundId)?.amount

  return (
    <div>
      <div className="card">
        <h2>Opening Cash & Bank Balances</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          Used for the Cash Book and Bank Book running balances, and for the Balance Sheet.
        </p>
        <form onSubmit={saveCashBank}>
          <label>Balance Sheet / As-of Date</label>
          <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          <div className="grid-2">
            <div>
              <label>Opening Cash in Hand (LKR)</label>
              <input
                type="number"
                value={cashBankForm.cash}
                onChange={(e) => setCashBankForm({ ...cashBankForm, cash: e.target.value })}
                placeholder={openingCashBank ? `Current: ${openingCashBank.cash.toLocaleString()}` : ''}
              />
            </div>
            <div>
              <label>Opening Bank Balance (LKR)</label>
              <input
                type="number"
                value={cashBankForm.bank}
                onChange={(e) => setCashBankForm({ ...cashBankForm, bank: e.target.value })}
                placeholder={openingCashBank ? `Current: ${openingCashBank.bank.toLocaleString()}` : ''}
              />
            </div>
          </div>
          <button className="primary" type="submit">Save Cash & Bank Opening Balances</button>
        </form>
      </div>

      <div className="card">
        <h2>Opening Fund Balances (from last Balance Sheet)</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          Enter the cash/bank balance held under each fund as of the date of your last balance sheet.
          The Dashboard will add this to activity recorded in the app so fund balances stay accurate.
        </p>
        <form onSubmit={saveFundBalances}>
          <label>Balance Sheet / As-of Date</label>
          <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          {FUNDS.map((f) => (
            <div key={f.id}>
              <label>{f.name} — Opening Balance (LKR)</label>
              <input
                type="number"
                value={balForm[f.id]}
                onChange={(e) => setBalForm({ ...balForm, [f.id]: e.target.value })}
                placeholder={existingBalance(f.id) !== undefined ? `Current: ${existingBalance(f.id).toLocaleString()}` : ''}
              />
            </div>
          ))}
          <button className="primary" type="submit">Save Opening Balances</button>
        </form>
      </div>

      <div className="card">
        <h2>Opening Fixed Assets (existing assets as per last Balance Sheet)</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b6258' }}>
          List assets the trust already owns — land, building, vehicles, equipment — with the value shown
          on the last balance sheet. These appear in the Fixed Assets register alongside new capital purchases.
        </p>
        <form onSubmit={addAsset}>
          <label>Asset Name</label>
          <input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} />
          <div className="grid-2">
            <div>
              <label>Fund</label>
              <select value={assetForm.fundId} onChange={(e) => setAssetForm({ ...assetForm, fundId: e.target.value })}>
                {FUNDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label>Value as per Balance Sheet (LKR)</label>
              <input type="number" value={assetForm.value} onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })} />
            </div>
          </div>
          <label>Original Date Acquired (optional)</label>
          <input type="date" value={assetForm.dateAcquired} onChange={(e) => setAssetForm({ ...assetForm, dateAcquired: e.target.value })} />
          <button className="primary" type="submit">Add Opening Asset</button>
        </form>
      </div>

      <div className="card">
        <h2>Opening Assets Recorded ({openingAssets.length})</h2>
        <table>
          <thead><tr><th>Asset</th><th>Fund</th><th>Value</th><th>Acquired</th><th></th></tr></thead>
          <tbody>
            {openingAssets.map((a) => (
              <tr key={a.id}>
                {editingAssetId === a.id ? (
                  <>
                    <td><input value={editAssetForm.name} onChange={(e) => setEditAssetForm({ ...editAssetForm, name: e.target.value })} /></td>
                    <td>
                      <select value={editAssetForm.fundId} onChange={(e) => setEditAssetForm({ ...editAssetForm, fundId: e.target.value })}>
                        {FUNDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </td>
                    <td><input type="number" value={editAssetForm.value} onChange={(e) => setEditAssetForm({ ...editAssetForm, value: e.target.value })} /></td>
                    <td><input type="date" value={editAssetForm.dateAcquired} onChange={(e) => setEditAssetForm({ ...editAssetForm, dateAcquired: e.target.value })} /></td>
                    <td>
                      <button className="secondary small-btn" onClick={() => saveAsset(a.id)}>Save</button>{' '}
                      <button className="secondary small-btn" onClick={() => setEditingAssetId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{a.name}</td>
                    <td>{FUNDS.find((f) => f.id === a.fundId)?.name}</td>
                    <td>LKR {Number(a.value).toLocaleString()}</td>
                    <td>{a.dateAcquired || '—'}</td>
                    <td>
                      <button className="secondary small-btn" onClick={() => startEditAsset(a)}>Edit</button>{' '}
                      <button className="secondary small-btn" onClick={() => deleteAsset(a.id)}>Delete</button>
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
