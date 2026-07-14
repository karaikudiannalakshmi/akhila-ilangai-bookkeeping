import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'
import { DEFAULT_HEADS, FUNDS, DEFAULT_LOCATIONS } from '../constants/chartOfAccounts'

export default function Admin() {
  const { data: heads } = useCollection('coa')
  const { data: properties } = useCollection('properties')
  const { data: locations } = useCollection('locations')

  const [newHead, setNewHead] = useState({ name: '', type: 'Expense', category: 'Revenue', fundId: 'general' })
  const [newProperty, setNewProperty] = useState({ name: '', address: '', tenantName: '', tenantContact: '', monthlyRent: '' })
  const [newLocation, setNewLocation] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedingLoc, setSeedingLoc] = useState(false)
  const [msg, setMsg] = useState('')

  const seedLocations = async () => {
    setSeedingLoc(true)
    for (const l of DEFAULT_LOCATIONS) {
      await addDoc(collection(db, 'locations'), { ...l, active: true })
    }
    setSeedingLoc(false)
  }

  const addLocation = async (e) => {
    e.preventDefault()
    if (!newLocation.trim()) return
    await addDoc(collection(db, 'locations'), { name: newLocation.trim(), active: true })
    setNewLocation('')
  }

  const toggleLocation = async (l) => {
    await updateDoc(doc(db, 'locations', l.id), { active: !l.active })
  }

  const deleteLocation = async (id) => {
    if (confirm('Delete this centre/location?')) await deleteDoc(doc(db, 'locations', id))
  }

  const seedDefaults = async () => {
    setSeeding(true)
    for (const h of DEFAULT_HEADS) {
      await addDoc(collection(db, 'coa'), { ...h, active: true })
    }
    setSeeding(false)
    setMsg(`Loaded ${DEFAULT_HEADS.length} default heads.`)
  }

  const addHead = async (e) => {
    e.preventDefault()
    if (!newHead.name.trim()) return
    await addDoc(collection(db, 'coa'), { ...newHead, active: true })
    setNewHead({ name: '', type: 'Expense', category: 'Revenue', fundId: 'general' })
  }

  const toggleHead = async (h) => {
    await updateDoc(doc(db, 'coa', h.id), { active: !h.active })
  }

  const deleteHead = async (id) => {
    if (confirm('Delete this head? Existing vouchers using it will keep the old name in records.')) {
      await deleteDoc(doc(db, 'coa', id))
    }
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
    if (confirm('Delete this property?')) {
      await deleteDoc(doc(db, 'properties', id))
    }
  }

  return (
    <div>
      {locations.length === 0 && (
        <div className="card">
          <h2>Get Started - Centres</h2>
          <p style={{ fontSize: '0.85rem' }}>Load the standard set of centres/locations for this organization.</p>
          <button className="primary" onClick={seedLocations} disabled={seedingLoc}>
            {seedingLoc ? 'Loading...' : `Load ${DEFAULT_LOCATIONS.length} Default Centres`}
          </button>
        </div>
      )}

      <div className="card">
        <h2>Add Centre / Location</h2>
        <form onSubmit={addLocation}>
          <label>Centre Name</label>
          <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Kilinochchi Training Centre" />
          <button className="primary" type="submit">Add Centre</button>
        </form>
      </div>

      <div className="card">
        <h2>Centres ({locations.length})</h2>
        <table>
          <thead><tr><th>Name</th><th></th></tr></thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id} style={{ opacity: l.active === false ? 0.4 : 1 }}>
                <td>{l.name}</td>
                <td>
                  <button className="secondary small-btn" onClick={() => toggleLocation(l)}>{l.active === false ? 'Enable' : 'Disable'}</button>{' '}
                  <button className="secondary small-btn" onClick={() => deleteLocation(l.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {heads.length === 0 && (
        <div className="card">
          <h2>Get Started</h2>
          <p style={{ fontSize: '0.85rem' }}>No chart of accounts found yet. Load the standard set of income/expense heads for a temple + trust + rental property.</p>
          <button className="primary" onClick={seedDefaults} disabled={seeding}>
            {seeding ? 'Loading...' : `Load ${DEFAULT_HEADS.length} Default Heads`}
          </button>
          {msg && <p style={{ color: 'var(--green)', fontSize: '0.8rem' }}>{msg}</p>}
        </div>
      )}

      <div className="card">
        <h2>Add Income/Expense Head</h2>
        <form onSubmit={addHead}>
          <label>Head Name</label>
          <input value={newHead.name} onChange={(e) => setNewHead({ ...newHead, name: e.target.value })} />
          <div className="grid-2">
            <div>
              <label>Type</label>
              <select value={newHead.type} onChange={(e) => setNewHead({ ...newHead, type: e.target.value })}>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label>Category</label>
              <select value={newHead.category} onChange={(e) => setNewHead({ ...newHead, category: e.target.value })}>
                <option>Revenue</option>
                <option>Capital</option>
              </select>
            </div>
          </div>
          <label>Fund</label>
          <select value={newHead.fundId} onChange={(e) => setNewHead({ ...newHead, fundId: e.target.value })}>
            {FUNDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="primary" type="submit">Add Head</button>
        </form>
      </div>

      <div className="card">
        <h2>Existing Heads ({heads.length})</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Category</th><th>Fund</th><th></th></tr>
          </thead>
          <tbody>
            {heads.map((h) => (
              <tr key={h.id} style={{ opacity: h.active === false ? 0.4 : 1 }}>
                <td>{h.name}</td>
                <td className={h.type === 'Income' ? 'income' : 'expense'}>{h.type}</td>
                <td>{h.category}</td>
                <td>{FUNDS.find((f) => f.id === h.fundId)?.name || h.fundId}</td>
                <td>
                  <button className="secondary small-btn" onClick={() => toggleHead(h)}>{h.active === false ? 'Enable' : 'Disable'}</button>{' '}
                  <button className="secondary small-btn" onClick={() => deleteHead(h.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Add Rental Property</h2>
        <form onSubmit={addProperty}>
          <label>Property Name</label>
          <input value={newProperty.name} onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} />
          <label>Address</label>
          <input value={newProperty.address} onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} />
          <div className="grid-2">
            <div>
              <label>Tenant Name</label>
              <input value={newProperty.tenantName} onChange={(e) => setNewProperty({ ...newProperty, tenantName: e.target.value })} />
            </div>
            <div>
              <label>Tenant Contact</label>
              <input value={newProperty.tenantContact} onChange={(e) => setNewProperty({ ...newProperty, tenantContact: e.target.value })} />
            </div>
          </div>
          <label>Monthly Rent (LKR)</label>
          <input type="number" value={newProperty.monthlyRent} onChange={(e) => setNewProperty({ ...newProperty, monthlyRent: e.target.value })} />
          <button className="primary" type="submit">Add Property</button>
        </form>
      </div>

      <div className="card">
        <h2>Properties ({properties.length})</h2>
        <table>
          <thead><tr><th>Name</th><th>Tenant</th><th>Monthly Rent</th><th></th></tr></thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.tenantName}</td>
                <td>LKR {Number(p.monthlyRent).toLocaleString()}</td>
                <td><button className="secondary small-btn" onClick={() => deleteProperty(p.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
