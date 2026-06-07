import { useState } from 'react'

export default function ContactForm() {
  const [type, setType] = useState('Basic')
  const [budget, setBudget] = useState('')
  const [details, setDetails] = useState('')

  const sendToWhatsApp = () => {
    const msg = `Hello Tina, Custom Inquiry.%0A%0A*Type:* ${type}%0A*Budget:* ${budget}%0A*Brief:* ${details}`
    window.open(`https://wa.me/2348109321072?text=${msg}`, '_blank')
  }

  return (
    <section className="mt-24 p-10 bg-black/40 backdrop-blur-md rounded-3xl border border-gray-800">
      <h2 className="font-display text-3xl uppercase mb-8">Start Your Project</h2>
      <div className="mb-6">
        <label className="block text-[#00e6ff] font-bold text-sm mb-2">SERVICE TYPE</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        >
          <option>Basic</option>
          <option>Standard</option>
          <option>Premium</option>
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-[#00e6ff] font-bold text-sm mb-2">BUDGET</label>
        <input
          type="text"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          placeholder="Enter amount"
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />
      </div>
      <div className="mb-8">
        <label className="block text-[#00e6ff] font-bold text-sm mb-2">BRIEF DETAILS</label>
        <textarea
          rows="4"
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Describe your vision..."
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />
      </div>
      <button
        onClick={sendToWhatsApp}
        className="w-full py-4 bg-[#25d366] text-white rounded-xl font-extrabold hover:scale-105 transition"
      >
        SEND WHATSAPP BRIEF
      </button>
    </section>
  )
}