import { useState } from 'react'
import logo from '../assets/logo.jpg'

export default function Login({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const correct = import.meta.env.VITE_APP_PASSWORD
    if (pin === correct) {
      sessionStorage.setItem('akk_auth', 'true')
      onSuccess()
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="login-screen">
      <img src={logo} alt="Kamban Lanka" style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }} />
      <div className="card">
        <h2>Akhila Ilangai Kamban Kazhakam</h2>
        <form onSubmit={handleSubmit}>
          <label>Enter Password</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          {error && <div className="error-text">{error}</div>}
          <button className="primary" type="submit" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  )
}
