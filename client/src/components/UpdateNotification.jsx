import { useEffect, useState } from 'react'

export default function UpdateNotification() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handleUpdateFound = () => {
      setShow(true)
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.addEventListener('updatefound', handleUpdateFound)
    })
    return () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.removeEventListener('updatefound', handleUpdateFound)
      }
    }
  }, [])

  const update = () => {
    navigator.serviceWorker.ready.then(reg => {
      reg.waiting?.postMessage('SKIP_WAITING')
      setShow(false)
      window.location.reload()
    })
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 bg-[#00e6ff] text-black p-4 rounded-xl shadow-lg flex items-center justify-between">
      <span className="text-sm font-semibold">New version available!</span>
      <button onClick={update} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">
        Update
      </button>
    </div>
  )
}