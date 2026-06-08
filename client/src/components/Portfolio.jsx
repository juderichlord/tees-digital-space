import { useState, useEffect, useRef } from 'react'

function YouTubeEmbed({ videoId }) {
  // Using iframe API for reliable autoplay
  return (
    <iframe
      className="absolute inset-0 w-full h-full"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&modestbranding=1`}
      allow="autoplay; encrypted-media"
      allowFullScreen
      title="YouTube video"
    />
  )
}

function VideoPlayer({ src }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {
        // Autoplay blocked? Fallback: add a click listener to play
        const playOnClick = () => {
          videoRef.current.play()
          document.removeEventListener('click', playOnClick)
        }
        document.addEventListener('click', playOnClick)
      })
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      src={src}
      autoPlay
      muted
      loop
      playsInline
    />
  )
}

export default function Portfolio({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <section>
        <h2 className="section-title">Visual Portfolio</h2>
        <p className="text-center text-gray-500">No videos yet.</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="section-title">Visual Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-black/30 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-800"
          >
            <div className="relative aspect-[9/16] max-h-[550px] bg-black">
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <span className="text-white/10 font-display text-6xl rotate-[-15deg] select-none">
                  TDS
                </span>
              </div>
              {video.youtube_id ? (
                <YouTubeEmbed videoId={video.youtube_id} />
              ) : video.video_url ? (
                <VideoPlayer src={video.video_url} />
              ) : null}
            </div>
            <div className="p-5 text-center">
              <h3 className="font-semibold">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}