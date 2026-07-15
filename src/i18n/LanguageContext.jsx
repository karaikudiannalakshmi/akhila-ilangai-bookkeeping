import { createContext, useContext, useEffect, useState } from 'react'
import { TRANSLATIONS } from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('akk_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('akk_lang', lang)
  }, [lang])

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key
  }

  const toggleLang = () => setLang((l) => (l === 'en' ? 'ta' : 'en'))

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
