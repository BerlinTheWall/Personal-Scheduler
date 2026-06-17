import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', show: false })

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2400)
  }, [])

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className={`toast${toast.show ? ' show' : ''}`}>{toast.msg}</div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)