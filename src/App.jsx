import { useEffect, useState } from 'react'
import logo from './assets/logo.jpg'
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
import { useLanguage } from './i18n/LanguageContext'

const TAB_IDS = [
  ['dashboard', 'tab_dashboard'],
  ['cashbook', 'tab_cashbook'],
  ['bankbook', 'tab_bankbook'],
  ['ledger', 'tab_ledger'],
  ['genledger', 'tab_genledger'],
  ['trial', 'tab_trial'],
  ['balancesheet', 'tab_balancesheet'],
  ['analysis', 'tab_analysis'],
  ['rent', 'tab_rent'],
  ['assets', 'tab_assets'],
  ['opening', 'tab_opening'],
  ['admin', 'tab_admin'],
]

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const { lang, toggleLang, t } = useLanguage()

  useEffect(() => {
    if (sessionStorage.getItem('akk_auth') === 'true') setAuthed(true)
  }, [])

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  return (
    <div>
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logo} alt="Kamban Lanka" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h1>Akhila Ilangai Kamban Kazhakam</h1>
            <div className="sub" style={{ fontSize: '0.7rem' }}>{t('orgSubtitle')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="secondary"
            style={{ background: 'transparent', color: 'white', borderColor: 'white', fontWeight: lang === 'en' ? 700 : 400 }}
            onClick={toggleLang}
            title="Switch language / மொழியை மாற்று"
          >
            {lang === 'en' ? 'த' : 'EN'}
          </button>
          <button
            className="secondary"
            style={{ background: 'transparent', color: 'white', borderColor: 'white' }}
            onClick={() => { sessionStorage.removeItem('akk_auth'); setAuthed(false) }}
          >
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="tabs">
        {TAB_IDS.map(([id, key]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {t(key)}
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
