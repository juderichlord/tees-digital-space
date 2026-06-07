export default function Hero() {
  return (
    <header className="text-center pt-10 pb-16">
      <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
        TEES DIGITAL <span className="text-[#00e6ff]">SPACE</span>
      </h1>
      <p className="tracking-[6px] text-[#00e6ff] font-extrabold text-xs mt-4 uppercase">
        CINEMATIC AI PRODUCTION • 2026
      </p>
      <div className="max-w-xl mx-auto mt-12 p-8 border-l-4 border-[#00e6ff] bg-white/5 backdrop-blur-md rounded-r-3xl">
        <span className="font-script text-2xl text-[#00e6ff]">Meet the Visionary</span>
        <p className="mt-3 text-gray-300 leading-relaxed">
          <strong>TeeDigital</strong>, spearheaded by the visionary{' '}
          <span className="text-[#00e6ff] font-extrabold">Tina Oreke</span>, specializes in
          bridging the gap between imagination and digital reality through elite AI filmmaking
          and design.
        </p>
      </div>
    </header>
  )
}