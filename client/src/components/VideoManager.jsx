import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

function extractYouTubeId(url) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : url
}

export default function VideoManager() {
  const [videos, setVideos] = useState([])
  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState('youtube') // 'youtube' or 'upload'
  const [youtubeInput, setYoutubeInput] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [category, setCategory] = useState('General')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchVideos() }, [])

  async function fetchVideos() {
    const { data } = await supabase.from('videos').select('*').order('display_order')
    if (data) setVideos(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title) return alert('Title is required')
    if (mediaType === 'youtube' && !youtubeInput) return alert('Enter a YouTube URL')
    if (mediaType === 'upload' && !uploadFile && !editingId) return alert('Select a video file')

    setLoading(true)

    let youtubeId = null
    let videoUrl = null

    if (mediaType === 'youtube') {
      youtubeId = extractYouTubeId(youtubeInput)
    }

    if (mediaType === 'upload' && uploadFile) {
      const file = uploadFile
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = `videos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('videos') // bucket name
        .upload(filePath, file)

      if (uploadError) {
        alert('Upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath)
      videoUrl = urlData.publicUrl
    }

    const payload = {
      title,
      youtube_id: youtubeId || null,
      video_url: videoUrl || null,
      category,
      display_order: editingId ? undefined : videos.length,
    }

    if (editingId) {
      // When editing, if no new file is uploaded and it's a file type, keep existing video_url
      if (mediaType === 'upload' && !uploadFile) {
        delete payload.video_url
      }
      await supabase.from('videos').update(payload).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('videos').insert(payload)
    }

    // Reset form
    setTitle('')
    setYoutubeInput('')
    setUploadFile(null)
    setCategory('General')
    setMediaType('youtube')
    if (fileInputRef.current) fileInputRef.current.value = ''

    fetchVideos()
    setLoading(false)
  }

  async function handleEdit(video) {
    setEditingId(video.id)
    setTitle(video.title)
    setCategory(video.category)
    if (video.youtube_id) {
      setMediaType('youtube')
      setYoutubeInput(video.youtube_id)
    } else {
      setMediaType('upload')
      // For uploaded files, we can't pre‑fill the file input, but we can show the current URL
    }
  }

  async function handleDelete(video) {
    // If it's an uploaded video, delete from storage first
    if (video.video_url) {
      const path = video.video_url.split('/').pop()
      await supabase.storage.from('videos').remove([`videos/${path}`])
    }
    await supabase.from('videos').delete().eq('id', video.id)
    fetchVideos()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Manage Videos</h2>

      <form onSubmit={handleSubmit} className="bg-black/40 p-6 rounded-xl border border-gray-800 mb-10 space-y-4">
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mediaType"
              value="youtube"
              checked={mediaType === 'youtube'}
              onChange={() => setMediaType('youtube')}
            />
            <span>YouTube</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mediaType"
              value="upload"
              checked={mediaType === 'upload'}
              onChange={() => setMediaType('upload')}
            />
            <span>Upload File</span>
          </label>
        </div>

        {mediaType === 'youtube' && (
          <input
            type="text"
            placeholder="YouTube URL or Video ID"
            value={youtubeInput}
            onChange={e => setYoutubeInput(e.target.value)}
            required
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
          />
        )}

        {mediaType === 'upload' && (
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={e => setUploadFile(e.target.files[0])}
            required={!editingId} // not required when editing (keep existing)
            className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00e6ff] file:text-black hover:file:bg-white"
          />
        )}

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#00e6ff] text-black rounded-xl font-extrabold"
        >
          {editingId ? 'Update Video' : 'Add Video'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setTitle('')
              setYoutubeInput('')
              setUploadFile(null)
              setCategory('General')
              setMediaType('youtube')
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="w-full py-2 bg-gray-700 text-white rounded-xl"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="space-y-4">
        {videos.map(video => (
          <div key={video.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold">{video.title}</p>
              <p className="text-sm text-gray-400">
                {video.youtube_id
                  ? `YouTube: ${video.youtube_id}`
                  : video.video_url
                  ? `Uploaded: ${video.video_url.split('/').pop()}`
                  : 'No media'}
                {' | '}
                {video.category}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(video)} className="text-blue-400">Edit</button>
              <button onClick={() => handleDelete(video)} className="text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}