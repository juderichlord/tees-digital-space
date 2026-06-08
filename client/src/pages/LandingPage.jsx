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
  const [introImage, setIntroImage] = useState(null)

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

      // Fetch intro image
      const { data: setting } = await supabase
        .from('site_settings')
        .select('intro_image_url')
        .single()
      if (setting?.intro_image_url) setIntroImage(setting.intro_image_url)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />
      <div className="w-full max-w-6xl px-5 pt-24 pb-16">
        <Hero />

        {/* Dynamic Intro Image */}
        {introImage && (
  <div className="my-8 flex justify-center">
    <img
      src={introImage}
      alt="TDS Intro"
      className="w-auto max-w-sm h-auto rounded-2xl shadow-lg border border-gray-800"
    />
  </div>
)}

        <Portfolio videos={videos} />
        <Pricing tiers={tiers} />
        <ContactForm />
        <Footer />
      </div>
    </div>
  )
}