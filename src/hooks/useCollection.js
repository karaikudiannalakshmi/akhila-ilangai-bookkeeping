import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useCollection(name) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, name), (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [name])

  return { data, loading }
}
