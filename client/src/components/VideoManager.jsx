import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

function extractYouTubeId(url) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : url
}

const MAX_VIDEOS = 6

export default function VideoManager() {
  const [videos, setVideos] = useState([])
  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState('upload')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [uploadFiles, setUploadFiles] = useState([])
  const [category, setCategory] = useState('General')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchVideos() }, [])

  async function fetchVideos() {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setVideos(data)
  }

  async function deleteVideo(video) {
    if (video.video_url) {
      const path = video.video_url.split('/').pop()
      await supabase.storage.from('videos').remove([`videos/${path}`])
    }
    await supabase.from('videos').delete().eq('id', video.id)
  }

  async function removeOldestVideo(list) {
    if (list.length >= MAX_VIDEOS) {
      const oldest = list[0] // oldest by created_at ascending
      await deleteVideo(oldest)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title) return alert('Title is required')
    if (mediaType === 'youtube' && !youtubeInput) return alert('Enter a YouTube URL')
    if (mediaType === 'upload' && uploadFiles.length === 0 && !editingId) {
      return alert('Select at least one video file')
    }

    setLoading(true)
    setUploadProgress(0)
    setCurrentFileIndex(0)

    if (mediaType === 'youtube') {
      const youtubeId = extractYouTubeId(youtubeInput)
      const { error } = await supabase.from('videos').insert({
        title,
        youtube_id: youtubeId,
        category,
        video_url: null,
      })
      if (error) {
        alert('Insert failed: ' + error.message)
        setLoading(false)
        return
      }
      // Enforce 6‑slot limit
      const updatedList = await fetchAndReturnVideos()
      await removeOldestVideo(updatedList)
    } else {
      const files = uploadFiles
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentFileIndex(i + 1)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
        const filePath = `videos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              if (progress.total) {
                const percent = Math.round((progress.loaded / progress.total) * 100)
                setUploadProgress(percent)
              }
            },
          })

        if (uploadError) {
          alert(`Upload failed for ${file.name}: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath)
        const videoUrl = urlData.publicUrl

        const videoTitle = files.length === 1 ? title : `${title} (${i + 1}/${files.length})`

        const { error: insertError } = await supabase.from('videos').insert({
          title: videoTitle,
          youtube_id: null,
          video_url: videoUrl,
          category,
        })
        if (insertError) {
          alert(`Insert failed for ${file.name}: ${insertError.message}`)
          setLoading(false)
          return
        }

        // After each insert, enforce 6‑slot limit
        const updatedList = await fetchAndReturnVideos()
        await removeOldestVideo(updatedList)
        setUploadProgress(0)
      }
    }

    // Reset form
    setTitle('')
    setYoutubeInput('')
    setUploadFiles([])
    setCategory('General')
    setMediaType('upload')
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchVideos()
    setLoading(false)
  }

  async function fetchAndReturnVideos() {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setVideos(data)
    return data || []
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
    }
  }

  async function handleDelete(video) {
    await deleteVideo(video)
    fetchVideos()
  }

  const slotsRemaining = MAX_VIDEOS - videos.length

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Manage Videos</h2>

      <form onSubmit={handleSubmit} className="bg-black/40 p-6 rounded-xl border border-gray-800 mb-10 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Slots used: {videos.length}/{MAX_VIDEOS}
          </p>
          {slotsRemaining > 0 && (
            <p className="text-xs text-green-400">You can add up to {slotsRemaining} more video(s).</p>
          )}
        </div>

        <input
          type="text"
          placeholder="Video Title (used as prefix for multiple files)"
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
            <span>Upload Files</span>
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
          <div className="space-y-2">
            <input
              type="file"
              accept="video/*"
              multiple
              ref={fileInputRef}
              onChange={e => setUploadFiles(Array.from(e.target.files))}
              className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00e6ff] file:text-black hover:file:bg-white"
            />
            {uploadFiles.length > 0 && (
              <p className="text-xs text-gray-400">
                {uploadFiles.length} file(s) selected: {uploadFiles.map(f => f.name).join(', ')}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Tip: Hold Ctrl (Cmd) to select multiple files, or drag them all at once.
            </p>
          </div>
        )}

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white"
        />

        {/* Progress indicator */}
        {loading && mediaType === 'upload' && (
          <div className="mt-2">
            {uploadProgress === 0 ? (
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-[#00e6ff] animate-loading-bar w-full" />
              </div>
            ) : (
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-[#00e6ff] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1 text-center">
              {uploadProgress === 0
                ? `Uploading file ${currentFileIndex} of ${uploadFiles.length}...`
                : `File ${currentFileIndex} of ${uploadFiles.length}: ${uploadProgress}%`}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#00e6ff] text-black rounded-xl font-extrabold"
        >
          {loading ? 'Uploading...' : editingId ? 'Update Video' : 'Add Video'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setTitle('')
              setYoutubeInput('')
              setUploadFiles([])
              setCategory('General')
              setMediaType('upload')
              setUploadProgress(0)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="w-full py-2 bg-gray-700 text-white rounded-xl"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Current videos */}
      <div className="space-y-4">
        {videos.map(video => (
          <div key={video.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-gray-800">
            <div>
              <p className="font-bold">{video.title}</p>
              <p className="text-sm text-gray-400">
                {video.youtube_id
                  ? `YouTube: ${video.youtube_id}`
                  : `Uploaded: ${video.video_url?.split('/').pop()}`
                }
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
        {videos.length === 0 && (
          <p className="text-center text-gray-500">No videos added yet.</p>
        )}
      </div>
    </div>
  )
}