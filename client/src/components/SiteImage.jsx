import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SiteImage() {
  const [currentImage, setCurrentImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchCurrentImage()
  }, [])

  async function fetchCurrentImage() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('intro_image_url, intro_image_path')
      .single()
    if (data) {
      setCurrentImage({ url: data.intro_image_url, path: data.intro_image_path })
    } else if (error) {
      console.warn('Could not fetch site settings:', error)
    }
  }

  const handleUpload = async () => {
    if (!file) return alert('Select an image')
    setUploading(true)
    setStatus('')

    // Delete old image if exists
    if (currentImage?.path) {
      await supabase.storage.from('images').remove([currentImage.path])
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `intro_${Date.now()}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      setStatus('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)
    const newUrl = urlData.publicUrl
    console.log('New image URL:', newUrl) // Debug

    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        intro_image_url: newUrl,
        intro_image_path: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    if (updateError) {
      setStatus('Failed to update settings: ' + updateError.message)
    } else {
      setCurrentImage({ url: newUrl, path: filePath })
      setStatus('Image updated!')
      setFile(null)
      if (document.getElementById('imageFileInput')) {
        document.getElementById('imageFileInput').value = ''
      }
    }
    setUploading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-[#00e6ff] mb-8">Site Intro Image</h2>
      <div className="bg-black/40 p-6 rounded-xl border border-gray-800 space-y-4">
        {currentImage?.url ? (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Current Image:</p>
            <img
              src={currentImage.url}
              alt="Intro"
              className="w-full max-h-48 object-cover rounded-xl border border-gray-700"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">No image set.</p>
        )}

        <input
          id="imageFileInput"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00e6ff] file:text-black"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full py-3 bg-[#00e6ff] text-black rounded-xl font-extrabold disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Replace Image'}
        </button>

        {status && (
          <div className="p-4 bg-green-900/30 border border-green-500 rounded-xl text-green-300 text-sm">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}