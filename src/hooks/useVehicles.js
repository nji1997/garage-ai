import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import { db } from '../firebase'

export function useVehicles(uid) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setVehicles([]); setLoading(false); return }
    const q = query(
      collection(db, 'users', uid, 'vehicles'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [uid])

  const addVehicle = useCallback(async (data) => {
    return addDoc(collection(db, 'users', uid, 'vehicles'), {
      ...data,
      records: [],
      reminders: [],
      mods: [],
      createdAt: serverTimestamp(),
    })
  }, [uid])

  const updateVehicle = useCallback(async (vehicleId, data) => {
    return updateDoc(doc(db, 'users', uid, 'vehicles', vehicleId), data)
  }, [uid])

  const deleteVehicle = useCallback(async (vehicleId) => {
    return deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId))
  }, [uid])

  return { vehicles, loading, addVehicle, updateVehicle, deleteVehicle }
}
