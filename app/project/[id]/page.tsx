'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const TABS = ['Upload', 'Procesando', 'Resultados'] as const
type Tab = (typeof TABS)[number]

interface UploadedPhoto {
  id: string
  name: string
  size: string
  file: File
  storagePath?: string
  publicUrl?: string
}

interface ProcessingPhoto {
  id: string
  name: string
  progress: number
}

interface ResultPhoto {
  id: string
  name: string
  originalUrl: string
  processedUrl: string
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('Upload')
  const [uploads, setUploads] = useState<UploadedPhoto[]>([])
  const [processing, setProcessing] = useState<ProcessingPhoto[]>([])
  const [results, setResults] = useState<ResultPhoto[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Ensure bucket exists on mount
  useEffect(() => {
    fetch('/api/ensure-bucket', { method: 'POST' }).catch(() => {})
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newPhotos: UploadedPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: formatSize(file.size),
        file,
      }))
    setUploads((prev) => [...prev, ...newPhotos])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((p) => p.id !== id))
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Strip the data URL prefix to get raw base64
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const processPhotos = async () => {
    if (uploads.length === 0) return
    setIsProcessing(true)

    // Move to Procesando tab
    const toProcess = [...uploads]
    setUploads([])
    setActiveTab('Procesando')

    // Initialize processing entries
    setProcessing(toProcess.map((p) => ({ id: p.id, name: p.name, progress: 0 })))

    for (const photo of toProcess) {
      try {
        // Step 1: Upload original to Supabase Storage (20%)
        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 10 } : p))
        )

        const storagePath = `${params.id}/${Date.now()}-${photo.name}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(storagePath, photo.file, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl: originalUrl },
        } = supabase.storage.from('photos').getPublicUrl(storagePath)

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 30 } : p))
        )

        // Step 2: Convert to base64 and send to Gemini (30% -> 80%)
        const base64 = await fileToBase64(photo.file)

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 50 } : p))
        )

        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: photo.file.type }),
        })

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 80 } : p))
        )

        if (!res.ok) throw new Error('Processing failed')

        const data = await res.json()

        // Step 3: Upload processed image to Storage (80% -> 100%)
        const processedBytes = Uint8Array.from(atob(data.image), (c) => c.charCodeAt(0))
        const processedBlob = new Blob([processedBytes], {
          type: data.mimeType || 'image/jpeg',
        })
        const processedPath = `${params.id}/processed-${Date.now()}-${photo.name}`

        const { error: processedUploadError } = await supabase.storage
          .from('photos')
          .upload(processedPath, processedBlob, { upsert: true })

        if (processedUploadError) throw processedUploadError

        const {
          data: { publicUrl: processedUrl },
        } = supabase.storage.from('photos').getPublicUrl(processedPath)

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 100 } : p))
        )

        // Add to results
        setResults((prev) => [
          ...prev,
          { id: photo.id, name: photo.name, originalUrl, processedUrl },
        ])

        // Remove from processing after a short delay
        setTimeout(() => {
          setProcessing((prev) => prev.filter((p) => p.id !== photo.id))
        }, 600)
      } catch (err) {
        console.error(`Error processing ${photo.name}:`, err)
        // Mark as failed and remove
        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: -1 } : p))
        )
        setTimeout(() => {
          setProcessing((prev) => prev.filter((p) => p.id !== photo.id))
        }, 3000)
      }
    }

    setIsProcessing(false)

    // Auto-switch to results when all done
    setTimeout(() => {
      setActiveTab('Resultados')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Casa Polanco 42</h1>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
            Activo
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              {tab === 'Procesando' && processing.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-[10px] font-bold rounded-full flex items-center justify-center">
                  {processing.length}
                </span>
              )}
              {tab === 'Resultados' && results.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {results.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {activeTab === 'Upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center mb-8 transition-colors cursor-pointer ${
                isDragging
                  ? 'border-accent bg-accent/5'
                  : 'border-surface-border hover:border-accent/50'
              }`}
            >
              <svg
                className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-accent' : 'text-gray-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-gray-400 mb-1">
                Arrastra tus fotos aquí o haz clic para seleccionar
              </p>
              <p className="text-gray-600 text-sm">JPG, PNG, WebP hasta 20MB</p>
            </div>

            {uploads.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-400 mb-4">
                  Archivos seleccionados ({uploads.length})
                </h3>
                <div className="space-y-2">
                  {uploads.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center justify-between bg-surface-card border border-surface-border rounded-xl px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-light flex-shrink-0">
                          <img
                            src={URL.createObjectURL(photo.file)}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{photo.name}</p>
                          <p className="text-xs text-gray-500">{photo.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUpload(photo.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={processPhotos}
                  disabled={isProcessing}
                  className="mt-6 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Procesar {uploads.length} foto{uploads.length !== 1 ? 's' : ''}
                </button>
              </>
            )}

            {uploads.length === 0 && (
              <p className="text-center text-gray-600 text-sm">
                Aún no hay fotos. Arrastra o selecciona imágenes para empezar.
              </p>
            )}
          </div>
        )}

        {/* Procesando tab */}
        {activeTab === 'Procesando' && (
          <div className="space-y-4">
            {processing.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                No hay fotos procesándose
              </div>
            ) : (
              processing.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-surface-card border border-surface-border rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">{photo.name}</p>
                    {photo.progress === -1 ? (
                      <span className="text-sm text-red-400">Error</span>
                    ) : (
                      <span className="text-sm text-accent">{photo.progress}%</span>
                    )}
                  </div>
                  <div className="w-full bg-surface-light rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        photo.progress === -1 ? 'bg-red-500' : 'bg-accent'
                      }`}
                      style={{ width: `${photo.progress === -1 ? 100 : photo.progress}%` }}
                    />
                  </div>
                  {photo.progress === -1 && (
                    <p className="text-xs text-red-400 mt-2">
                      Error al procesar. Intenta de nuevo.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Resultados tab */}
        {activeTab === 'Resultados' && (
          <div>
            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Aún no hay resultados. Sube y procesa fotos primero.
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-surface-card border border-surface-border rounded-xl overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-0">
                      {/* Original */}
                      <div className="relative">
                        <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-xs font-medium text-gray-300 px-2.5 py-1 rounded-md">
                          Original
                        </div>
                        <img
                          src={photo.originalUrl}
                          alt={`Original - ${photo.name}`}
                          className="w-full aspect-[4/3] object-cover"
                        />
                      </div>
                      {/* Processed */}
                      <div className="relative">
                        <div className="absolute top-3 left-3 z-10 bg-accent/80 backdrop-blur-sm text-xs font-medium text-white px-2.5 py-1 rounded-md">
                          Procesada
                        </div>
                        <img
                          src={photo.processedUrl}
                          alt={`Procesada - ${photo.name}`}
                          className="w-full aspect-[4/3] object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-surface-border">
                      <p className="text-sm font-medium text-white">{photo.name}</p>
                      <a
                        href={photo.processedUrl}
                        download={`processed-${photo.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-light text-sm transition-colors"
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
