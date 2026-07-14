import { useEffect, useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Ledger from './components/Ledger'
import CashBook from './components/CashBook'
import BankBook from './components/BankBook'
import GeneralLedger from './components/GeneralLedger'
import TrialBalance from './components/TrialBalance'
import BalanceSheet from './components/BalanceSheet'
import ExpenditureAnalysis from './components/ExpenditureAnalysis'
import RentCollection from './components/RentCollection'
import FixedAssets from './components/FixedAssets'
import Admin from './components/Admin'
import OpeningBalances from './components/OpeningBalances'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'cashbook', label: 'Cash Book' },
  { id: 'bankbook', label: 'Bank Book' },
  { id: 'ledger', label: 'All Entries' },
  { id: 'genledger', label: 'Ledgers' },
  { id: 'trial', label: 'Trial Balance' },
  { id: 'balancesheet', label: 'Balance Sheet' },
  { id: 'analysis', label: 'Expenditure Analysis' },
  { id: 'rent', label: 'Rent Collection' },
  { id: 'assets', label: 'Fixed Assets' },
  { id: 'opening', label: 'Opening Balances' },
  { id: 'admin', label: 'Admin' },
]

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    if (sessionStorage.getItem('akk_auth') === 'true') setAuthed(true)
  }, [])

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  return (
    <div>
      <div className="app-header">
        <div>
          <h1>Akhila Ilangai Kamban Kazhakam</h1>
          <div className="sub">Aishwarya Lakshmi Temple - Bookkeeping</div>
        </div>
        <button
          className="secondary"
          style={{ background: 'transparent', color: 'white', borderColor: 'white' }}
          onClick={() => { sessionStorage.removeItem('akk_auth'); setAuthed(false) }}
        >
          Logout
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="container">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'cashbook' && <CashBook />}
        {tab === 'bankbook' && <BankBook />}
        {tab === 'ledger' && <Ledger />}
        {tab === 'genledger' && <GeneralLedger />}
        {tab === 'trial' && <TrialBalance />}
        {tab === 'balancesheet' && <BalanceSheet />}
        {tab === 'analysis' && <ExpenditureAnalysis />}
        {tab === 'rent' && <RentCollection />}
        {tab === 'assets' && <FixedAssets />}
        {tab === 'opening' && <OpeningBalances />}
        {tab === 'admin' && <Admin />}
      </div>
    </div>
  )
}
