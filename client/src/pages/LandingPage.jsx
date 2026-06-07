import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Portfolio from '../components/Portfolio'
import Pricing from '../components/Pricing'
import ContactForm from '../components/ContactForm'
import Footer from '../components/Footer'

export default function LandingPage() {
  const [videos, setVideos] = useState([])
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    async function fetchData() {
      const { data: vData } = await supabase
        .from('videos')
        .select('*')
        .order('display_order', { ascending: true })
      if (vData) setVideos(vData)

      const { data: tData } = await supabase
        .from('price_tiers')
        .select('*')
        .order('display_order', { ascending: true })
      if (tData) setTiers(tData)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />
      <div className="w-full max-w-6xl px-5 pt-24 pb-16">
        <Hero />

        {/* Intro Image */}
        <div className="my-12 flex justify-center">
          <img
            src="https://lwejromtgdfysmvpmbvx.supabase.co/storage/v1/object/public/images/WhatsApp%20Image%202026-06-07%20at%2010.47.59%20PM.jpeg"
            alt="TDS Intro"
            className="w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-800"
          />
        </div>

        <Portfolio videos={videos} />
        <Pricing tiers={tiers} />
        <ContactForm />
        <Footer />
      </div>
    </div>
  )
}