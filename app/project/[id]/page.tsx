'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const TABS = ['Upload', 'Procesando', 'Resultados'] as const
type Tab = (typeof TABS)[number]
type ProcessMode = 'professional' | 'declutter' | 'renovation'

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
  originalBase64: string
  originalMimeType: string
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('Upload')
  const [uploads, setUploads] = useState<UploadedPhoto[]>([])
  const [processing, setProcessing] = useState<ProcessingPhoto[]>([])
  const [results, setResults] = useState<ResultPhoto[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processMode, setProcessMode] = useState<ProcessMode>('professional')
  const [renovationText, setRenovationText] = useState('')
  const [relightingId, setRelightingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const processPhotos = async () => {
    if (uploads.length === 0) return
    if (processMode === 'renovation' && !renovationText.trim()) return
    setIsProcessing(true)

    const toProcess = [...uploads]
    setUploads([])
    setActiveTab('Procesando')

    setProcessing(toProcess.map((p) => ({ id: p.id, name: p.name, progress: 0 })))

    for (const photo of toProcess) {
      try {
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

        const base64 = await fileToBase64(photo.file)

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 50 } : p))
        )

        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            mimeType: photo.file.type,
            processType: processMode,
            userRequest: processMode === 'renovation' ? renovationText.trim() : undefined,
          }),
        })

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 80 } : p))
        )

        if (!res.ok) throw new Error('Processing failed')

        const data = await res.json()

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

        setResults((prev) => [
          ...prev,
          {
            id: photo.id,
            name: photo.name,
            originalUrl,
            processedUrl,
            originalBase64: base64,
            originalMimeType: photo.file.type,
          },
        ])

        setTimeout(() => {
          setProcessing((prev) => prev.filter((p) => p.id !== photo.id))
        }, 600)
      } catch (err) {
        console.error(`Error processing ${photo.name}:`, err)
        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: -1 } : p))
        )
        setTimeout(() => {
          setProcessing((prev) => prev.filter((p) => p.id !== photo.id))
        }, 3000)
      }
    }

    setIsProcessing(false)

    setTimeout(() => {
      setActiveTab('Resultados')
    }, 800)
  }

  const relightPhoto = async (photo: ResultPhoto, relightType: 'relight-dawn' | 'relight-day' | 'relight-night') => {
    setRelightingId(photo.id)
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photo.originalBase64,
          mimeType: photo.originalMimeType,
          processType: relightType,
        }),
      })

      if (!res.ok) throw new Error('Relighting failed')

      const data = await res.json()

      const processedBytes = Uint8Array.from(atob(data.image), (c) => c.charCodeAt(0))
      const processedBlob = new Blob([processedBytes], {
        type: data.mimeType || 'image/jpeg',
      })
      const processedPath = `${params.id}/relight-${Date.now()}-${photo.name}`

      const { error: uploadErr } = await supabase.storage
        .from('photos')
        .upload(processedPath, processedBlob, { upsert: true })

      if (uploadErr) throw uploadErr

      const {
        data: { publicUrl: newUrl },
      } = supabase.storage.from('photos').getPublicUrl(processedPath)

      setResults((prev) =>
        prev.map((r) => (r.id === photo.id ? { ...r, processedUrl: newUrl } : r))
      )
    } catch (err) {
      console.error('Relight error:', err)
    } finally {
      setRelightingId(null)
    }
  }

  const MODE_OPTIONS: { value: ProcessMode; label: string; desc: string }[] = [
    { value: 'professional', label: 'Foto profesional', desc: 'Mejora calidad, luz y nitidez' },
    { value: 'declutter', label: 'Limpiar y ordenar', desc: 'Elimina desorden, organiza el espacio' },
    { value: 'renovation', label: 'Visualizar reforma', desc: 'Transforma el espacio según tu idea' },
  ]

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
            {/* Photography tip */}
            <div className="mb-6 bg-accent/5 border border-accent/20 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">Tip:</span> Para mejores resultados, fotografía en vertical, usa el modo 0.5x (gran angular) de tu móvil, y posiciónate desde una esquina de la habitación.
                </p>
              </div>
            </div>

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
                <div className="space-y-2 mb-8">
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

                {/* Process mode selection */}
                <h3 className="text-sm font-medium text-gray-400 mb-3">Modo de procesado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {MODE_OPTIONS.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setProcessMode(mode.value)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        processMode === mode.value
                          ? 'border-accent bg-accent/10'
                          : 'border-surface-border bg-surface-card hover:border-gray-600'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${processMode === mode.value ? 'text-accent' : 'text-white'}`}>
                        {mode.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{mode.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Renovation textarea */}
                {processMode === 'renovation' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Describe la reforma que quieres visualizar
                    </label>
                    <textarea
                      value={renovationText}
                      onChange={(e) => setRenovationText(e.target.value)}
                      placeholder="Ej: Cambiar el suelo a madera clara, pintar las paredes de blanco, modernizar la cocina con encimera de mármol..."
                      rows={3}
                      className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                )}

                <button
                  onClick={processPhotos}
                  disabled={isProcessing || (processMode === 'renovation' && !renovationText.trim())}
                  className="bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors"
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
                    <div className="p-4 border-t border-surface-border">
                      <div className="flex items-center justify-between mb-3">
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
                      {/* Relighting buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 mr-1">Relighting:</span>
                        {([
                          { type: 'relight-dawn' as const, label: 'Amanecer', icon: '~' },
                          { type: 'relight-day' as const, label: 'Día', icon: '~' },
                          { type: 'relight-night' as const, label: 'Noche', icon: '~' },
                        ]).map((rl) => (
                          <button
                            key={rl.type}
                            onClick={() => relightPhoto(photo, rl.type)}
                            disabled={relightingId === photo.id}
                            className="text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface hover:border-accent/50 hover:text-accent text-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {relightingId === photo.id ? 'Procesando...' : rl.label}
                          </button>
                        ))}
                      </div>
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
