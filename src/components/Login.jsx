import { useState } from 'react'
import logo from '../assets/logo.jpg'
import { useLanguage } from '../i18n/LanguageContext'

export default function Login({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { lang, toggleLang, t } = useLanguage()

  const handleSubmit = (e) => {
    e.preventDefault()
    const correct = import.meta.env.VITE_APP_PASSWORD
    if (pin === correct) {
      sessionStorage.setItem('akk_auth', 'true')
      onSuccess()
    } else {
      setError(t('incorrectPassword'))
    }
  }

  return (
    <div className="login-screen">
      <button
        className="secondary small-btn"
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={toggleLang}
        title="Switch language / மொழியை மாற்று"
      >
        {lang === 'en' ? 'த' : 'EN'}
      </button>
      <img src={logo} alt="Kamban Lanka" style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }} />
      <div className="card">
        <h2>Akhila Ilangai Kamban Kazhakam</h2>
        <form onSubmit={handleSubmit}>
          <label>{t('enterPassword')}</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          {error && <div className="error-text">{error}</div>}
          <button className="primary" type="submit" style={{ width: '100%' }}>{t('login')}</button>
        </form>
      </div>
    </div>
  )
}
