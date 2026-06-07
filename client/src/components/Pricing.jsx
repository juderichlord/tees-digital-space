export default function Pricing({ tiers }) {
  if (!tiers.length) return <p className="text-center">Loading pricing...</p>

  return (
    <section>
      <h2 className="section-title">Production Rates</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map(tier => (
          <div
            key={tier.id}
            className={`bg-[#111] p-10 rounded-3xl border ${
              tier.is_featured ? 'border-[#00e6ff] bg-[#161616]' : 'border-gray-800'
            } text-center`}
          >
            <h3 className="text-xl font-bold">{tier.name}</h3>
            <span className="block text-4xl font-extrabold text-[#00e6ff] my-4">
              ₦{tier.min_price} - ₦{tier.max_price}
            </span>
            <ul className="text-sm text-gray-400 text-left space-y-3 mt-8 mb-10">
              {tier.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00e6ff] mt-1">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/2348109321072?text=${tier.name}%20Inquiry`}
              target="_blank"
              className={`block w-full py-4 rounded-xl font-extrabold transition ${
                tier.is_featured
                  ? 'bg-[#00e6ff] text-black'
                  : 'bg-white text-black hover:bg-[#00e6ff]'
              }`}
            >
              CHOOSE {tier.name.toUpperCase()}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}