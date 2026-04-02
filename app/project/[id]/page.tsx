'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

const Pascal3DEditor = dynamic(() => import('@/components/Pascal3DEditor'), { ssr: false })

const ALL_TABS = ['Subir fotos', 'Procesando', 'Resultados', 'Editor 3D', 'Tour 3D'] as const
const TABS = ALL_TABS // kept for type inference
type Tab = (typeof TABS)[number]
type ProcessMode = 'professional' | 'renovation'

interface UploadedPhoto {
  id: string
  name: string
  size: string
  file: File
}

interface ProcessingPhoto {
  id: string
  name: string
  progress: number
  previewUrl?: string
}

interface ResultPhoto {
  id: string
  name: string
  originalUrl: string
  processedUrl: string
  originalBase64: string
  originalMimeType: string
}

interface ProjectData {
  id: string
  name: string
  status: string
}

// Tooltip component for chips
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-surface-border rounded-lg text-xs text-gray-200 whitespace-nowrap z-30 pointer-events-none shadow-xl"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-surface-border rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Before/After slider for results
function ResultSlider({ originalUrl, processedUrl, name }: { originalUrl: string; processedUrl: string; name: string }) {
  const [position, setPosition] = useState(50)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)))
    setHasInteracted(true)
  }, [])

  useEffect(() => {
    const handleMouseUp = () => { dragging.current = false }
    const handleMouseMove = (e: MouseEvent) => { if (dragging.current) update(e.clientX) }
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [update])

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden cursor-col-resize select-none rounded-t-xl"
      onMouseDown={(e) => { dragging.current = true; update(e.clientX) }}
      onTouchStart={(e) => { e.preventDefault(); update(e.touches[0].clientX) }}
      onTouchMove={(e) => { e.preventDefault(); update(e.touches[0].clientX) }}
    >
      {/* Processed (background) */}
      <img src={processedUrl} alt={`Mejorada - ${name}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
      {/* Original (clipped) — only if originalUrl exists */}
      {originalUrl && (
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={originalUrl} alt={`Original - ${name}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
      )}
      {/* Divider line */}
      <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)] z-10" style={{ left: `${position}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>
      {/* Labels */}
      <span className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">Original</span>
      <span className="absolute top-3 right-3 z-20 bg-accent/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">Mejorada</span>
      {/* Drag hint */}
      {!hasInteracted && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full"
          animate={{ x: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
          Arrastra para comparar
        </motion.div>
      )}
    </div>
  )
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [userPlan, setUserPlan] = useState<string>('free')
  const [activeTab, setActiveTab] = useState<Tab>('Subir fotos')
  const [uploads, setUploads] = useState<UploadedPhoto[]>([])
  const [processing, setProcessing] = useState<ProcessingPhoto[]>([])
  const [results, setResults] = useState<ResultPhoto[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  const [processMode, setProcessMode] = useState<ProcessMode>('professional')
  const [renovationText, setRenovationText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [relightingId, setRelightingId] = useState<string | null>(null)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [newResultIds, setNewResultIds] = useState<Set<string>>(new Set())
  const [photoErrors, setPhotoErrors] = useState<Map<string, string>>(new Map())
  const [failedFiles, setFailedFiles] = useState<Map<string, UploadedPhoto>>(new Map())
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-image-preview')
  // Pascal Editor state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null)
  const [editPanelText, setEditPanelText] = useState('')
  const [editApplying, setEditApplying] = useState(false)
  const [photoHistories, setPhotoHistories] = useState<Record<string, string[]>>({})
  // Editor 3D state
  const [editor3dScreenshot, setEditor3dScreenshot] = useState<string | null>(null)
  const [editor3dSending, setEditor3dSending] = useState(false)
  // Marble 3D Tour state
  const [marbleStatus, setMarbleStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [marbleWorldId, setMarbleWorldId] = useState<string | null>(null)
  const [marbleOperationId, setMarbleOperationId] = useState<string | null>(null)
  const [marbleProgress, setMarbleProgress] = useState(0)
  const [marbleError, setMarbleError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const marbleFileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { addToast } = useToast()

  useEffect(() => {
    loadProjectAndPhotos()
  }, [])

  // Load version histories from localStorage when results change
  useEffect(() => {
    if (results.length === 0) return
    const histories: Record<string, string[]> = {}
    results.forEach((r) => {
      try {
        const stored = localStorage.getItem(`holos_history_${r.id}`)
        histories[r.id] = stored ? (JSON.parse(stored) as string[]) : []
      } catch {
        histories[r.id] = []
      }
    })
    setPhotoHistories(histories)
  }, [results.length])

  function savePhotoHistory(photoId: string, urls: string[]) {
    const trimmed = urls.slice(0, 4)
    localStorage.setItem(`holos_history_${photoId}`, JSON.stringify(trimmed))
    setPhotoHistories((prev) => ({ ...prev, [photoId]: trimmed }))
  }

  const applyEdit = async () => {
    if (!editingPhotoId || !editPanelText.trim() || !userId) return
    const photo = results.find((r) => r.id === editingPhotoId)
    if (!photo) return
    setEditApplying(true)
    try {
      // Save current version to history before replacing
      const currentHistory = photoHistories[editingPhotoId] || []
      savePhotoHistory(editingPhotoId, [photo.processedUrl, ...currentHistory])

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: photo.processedUrl,
          processType: 'renovation',
          userRequest: editPanelText.trim(),
        }),
      })
      if (!res.ok) throw new Error('Edit failed')
      const data = await res.json()
      if (!data.image) throw new Error('No image returned')

      const processedBytes = Uint8Array.from(atob(data.image), (c) => c.charCodeAt(0))
      const processedBlob = new Blob([processedBytes], { type: data.mimeType || 'image/jpeg' })
      const processedPath = `${userId}/${params.id}/edit-${Date.now()}-${photo.name}`

      const { error: uploadErr } = await supabase.storage
        .from('PHOTOS')
        .upload(processedPath, processedBlob, { upsert: true })
      if (uploadErr) throw uploadErr

      const { data: { publicUrl: newUrl } } = supabase.storage
        .from('PHOTOS')
        .getPublicUrl(processedPath)

      await supabase.from('photos').update({ processed_url: newUrl }).eq('id', editingPhotoId)

      setResults((prev) =>
        prev.map((r) => (r.id === editingPhotoId ? { ...r, processedUrl: newUrl } : r))
      )
      setEditingPhotoId(null)
      setEditPanelText('')
      addToast('Edición aplicada', 'success')
    } catch (err) {
      console.error('Edit error:', err)
      addToast('Error al aplicar la edición', 'error')
    } finally {
      setEditApplying(false)
    }
  }

  async function loadProjectAndPhotos() {
    setLoadingProject(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load user plan
      const { data: userData } = await supabase.from('users').select('plan').eq('id', user.id).single()
      if (userData?.plan) setUserPlan(userData.plan)

      const { data: proj, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

      if (projErr || !proj) {
        console.error('Error loading project:', projErr)
        return
      }
      setProject(proj)

      const { data: photos, error: photosErr } = await supabase
        .from('photos')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false })

      if (photosErr) {
        console.error('Error loading photos:', photosErr)
        return
      }

      if (photos && photos.length > 0) {
        const loadedResults: ResultPhoto[] = photos
          .filter((p) => p.status === 'completed' && p.processed_url)
          .map((p) => ({
            id: p.id,
            name: p.original_url?.split('/').pop() || 'foto',
            originalUrl: p.original_url,
            processedUrl: p.processed_url,
            originalBase64: '',
            originalMimeType: 'image/jpeg',
          }))
        setResults(loadedResults)
      }

      // Load existing marble world
      const { data: marbleWorld } = await supabase
        .from('marble_worlds')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (marbleWorld) {
        if (marbleWorld.status === 'completed' && marbleWorld.world_id) {
          setMarbleStatus('completed')
          setMarbleWorldId(marbleWorld.world_id)
        } else if (marbleWorld.status === 'processing') {
          setMarbleStatus('processing')
          setMarbleOperationId(marbleWorld.operation_id)
        } else if (marbleWorld.status === 'failed') {
          setMarbleStatus('failed')
        }
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingProject(false)
    }
  }

  // Marble 3D Tour functions
  const handleMarbleUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setMarbleStatus('processing')
    setMarbleProgress(0)
    setMarbleError(null)
    setActiveTab('Tour 3D')

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/marble/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: params.id,
          imageBase64: base64,
          mimeType: file.type,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate 3D tour')
      }

      const { operationId } = await res.json()
      setMarbleOperationId(operationId)
    } catch (err: any) {
      console.error('Marble upload error:', err)
      setMarbleStatus('failed')
      setMarbleError(err.message || 'Error al generar el tour 3D')
    }
  }

  // Poll marble status
  useEffect(() => {
    if (marbleStatus !== 'processing' || !marbleOperationId) return

    const opId = marbleOperationId.replace('operations/', '')
    const startTime = Date.now()
    const estimatedDuration = 5 * 60 * 1000 // 5 minutes

    const interval = setInterval(async () => {
      // Update progress bar
      const elapsed = Date.now() - startTime
      setMarbleProgress(Math.min(95, (elapsed / estimatedDuration) * 100))

      try {
        const res = await fetch(`/api/marble/status/${opId}`)
        if (!res.ok) return

        const data = await res.json()
        if (data.done) {
          if (data.error) {
            setMarbleStatus('failed')
            setMarbleError(data.error.message || 'Error al generar el tour')
          } else {
            setMarbleStatus('completed')
            setMarbleWorldId(data.worldId)
            setMarbleProgress(100)
          }
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Marble poll error:', err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [marbleStatus, marbleOperationId])

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const tooLarge = Array.from(files).filter(f => f.size > 15 * 1024 * 1024)
    if (tooLarge.length > 0) {
      addToast(`${tooLarge.map(f => f.name).join(', ')} supera los 15 MB. Reduce el tamaño antes de subir.`, 'error')
    }
    const newPhotos: UploadedPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/') && f.size <= 15 * 1024 * 1024)
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: formatSize(file.size),
        file,
      }))
    setUploads((prev) => {
      const combined = [...prev, ...newPhotos]
      return combined.slice(0, 7)
    })
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

  // Descarga forzada via blob (evita que el browser abra nueva pestaña)
  const downloadPhoto = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    } catch {
      window.open(url, '_blank')
    }
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.80)
        URL.revokeObjectURL(url)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = reject
      img.src = url
    })

  const processPhotos = async () => {
    if (uploads.length === 0 || !userId) return
    if (processMode === 'renovation' && !renovationText.trim()) return
    setIsProcessing(true)
    setProcessError(null)

    const toProcess = [...uploads]
    setUploads([])
    setActiveTab('Procesando')

    setProcessing(toProcess.map((p) => ({ id: p.id, name: p.name, progress: 0, previewUrl: URL.createObjectURL(p.file) })))

    for (const photo of toProcess) {
      try {
        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 10 } : p))
        )

        const timestamp = Date.now()
        const originalPath = `${userId}/${params.id}/original-${timestamp}-${photo.name}`
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('PHOTOS')
          .upload(originalPath, photo.file, { upsert: true })

        if (uploadError) throw new Error(`Error subiendo foto: ${uploadError.message}`)
        if (!uploadData?.path) throw new Error('Upload completado pero sin path — reintenta')

        const {
          data: { publicUrl: originalUrl },
        } = supabase.storage.from('PHOTOS').getPublicUrl(originalPath)

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 40 } : p))
        )

        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: originalUrl,
            mimeType: photo.file.type,
            processType: processMode,
            userRequest: processMode === 'renovation' ? renovationText.trim() : undefined,
            ...(processMode === 'professional' ? { style: selectedStyle !== 'none' ? selectedStyle : undefined, extras: selectedExtras.length > 0 ? selectedExtras : undefined } : {}),
            ...(process.env.NODE_ENV === 'development' && selectedModel !== 'gemini-3-pro-image-preview' ? { model: selectedModel } : {}),
          }),
        })

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 80 } : p))
        )

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          const msg = errBody.error || 'Error desconocido'
          if (msg.toLowerCase().includes('heic')) {
            throw new Error('Foto en formato HEIC. En iPhone ve a Ajustes > Cámara > Formatos > Mayor compatibilidad')
          }
          if (msg.includes('limit') || msg.includes('limite') || msg.includes('quota') || msg.includes('cuota')) {
            throw new Error('Has usado todas tus fotos. Actualiza tu plan en /pricing')
          }
          if (msg.includes('size') || msg.includes('large')) {
            throw new Error('La foto es demasiado grande. Prueba con una imagen mas pequeña.')
          }
          throw new Error('Error al procesar. Intenta con otra foto o recarga la página.')
        }

        const data = await res.json()

        if (!data.image) {
          throw new Error(`La IA no pudo generar el resultado. Prueba con otra foto.`)
        }

        const processedBytes = Uint8Array.from(atob(data.image), (c) => c.charCodeAt(0))
        const processedBlob = new Blob([processedBytes], {
          type: data.mimeType || 'image/jpeg',
        })
        const processedPath = `${userId}/${params.id}/processed-${timestamp}-${photo.name}`

        const { error: processedUploadError } = await supabase.storage
          .from('PHOTOS')
          .upload(processedPath, processedBlob, { upsert: true })

        if (processedUploadError) throw processedUploadError

        const {
          data: { publicUrl: processedUrl },
        } = supabase.storage.from('PHOTOS').getPublicUrl(processedPath)

        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            project_id: params.id,
            original_url: originalUrl,
            processed_url: processedUrl,
            status: 'completed',
          })

        if (insertError) {
          console.error('Error guardando foto en BD:', insertError.message, insertError.details)
        }

        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: 100 } : p))
        )

        setNewResultIds((prev) => new Set(prev).add(photo.id))
        setResults((prev) => [
          ...prev,
          {
            id: photo.id,
            name: photo.name,
            originalUrl,
            processedUrl,
            originalBase64: '',
            originalMimeType: photo.file.type,
          },
        ])
        addToast(`${photo.name} lista`, 'success')

        setTimeout(() => {
          setProcessing((prev) => prev.filter((p) => p.id !== photo.id))
        }, 600)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`Error processing ${photo.name}:`, errMsg)
        setProcessError(errMsg)
        addToast(`Error con ${photo.name}`, 'error')
        setProcessing((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, progress: -1 } : p))
        )
        setPhotoErrors((prev) => new Map(prev).set(photo.id, errMsg))
        setFailedFiles((prev) => new Map(prev).set(photo.id, photo))
      }
    }

    setIsProcessing(false)

    setTimeout(() => {
      setResults(prev => {
        if (prev.length > 0) setActiveTab('Resultados')
        return prev
      })
    }, 800)
  }

  const relightPhoto = async (photo: ResultPhoto, relightType: 'relight-dawn' | 'relight-day' | 'relight-night') => {
    if (!userId) return
    setRelightingId(photo.id)
    addToast('Procesando iluminación — puede tardar hasta 60 segundos', 'success')
    try {
      // Usamos la URL directamente — el servidor fetchea la imagen (evita límite 4.5MB)
      const sourceUrl = photo.processedUrl || photo.originalUrl

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: sourceUrl,
          mimeType: photo.originalMimeType || 'image/jpeg',
          processType: relightType,
        }),
      })

      if (!res.ok) throw new Error('Relighting failed')

      const data = await res.json()

      const processedBytes = Uint8Array.from(atob(data.image), (c) => c.charCodeAt(0))
      const processedBlob = new Blob([processedBytes], {
        type: data.mimeType || 'image/jpeg',
      })
      const processedPath = `${userId}/${params.id}/relight-${Date.now()}-${photo.name}`

      const { error: uploadErr } = await supabase.storage
        .from('PHOTOS')
          .upload(processedPath, processedBlob, { upsert: true })

      if (uploadErr) throw uploadErr

      const {
        data: { publicUrl: newUrl },
      } = supabase.storage.from('PHOTOS').getPublicUrl(processedPath)

      await supabase
        .from('photos')
        .update({ processed_url: newUrl })
        .eq('id', photo.id)

      setResults((prev) =>
        prev.map((r) => (r.id === photo.id ? { ...r, processedUrl: newUrl } : r))
      )
      addToast('Iluminacion cambiada', 'success')
    } catch (err) {
      console.error('Relight error:', err)
      addToast('Error al cambiar iluminacion. Intentalo de nuevo.', 'error')
    } finally {
      setRelightingId(null)
    }
  }

  const MODE_OPTIONS: { value: ProcessMode; label: string; desc: string }[] = [
    {
      value: 'professional',
      label: 'Foto profesional',
      desc: 'Mejora la foto automaticamente',
    },
    {
      value: 'renovation',
      label: 'Reforma virtual',
      desc: 'Transforma el espacio',
    },
  ]

  const STYLE_OPTIONS = [
    { value: 'none', label: 'Sin estilo definido', tip: 'La IA decide el mejor estilo segun la foto' },
    { value: 'Modern and minimalist', label: 'Moderno', tip: 'Lineas limpias, colores neutros, espacios abiertos' },
    { value: 'Nordic and cozy', label: 'Nordico', tip: 'Madera clara, textiles suaves, ambiente calido' },
    { value: 'Warm Mediterranean', label: 'Mediterraneo', tip: 'Terracota, piedra natural, luz calida' },
    { value: 'Urban industrial', label: 'Industrial', tip: 'Ladrillo visto, metal, hormigon' },
  ]

  const EXTRAS_OPTIONS = [
    { value: 'Clean and declutter the space completely, remove all mess, organize everything neatly', label: '🧹 Ordenar y limpiar', tip: 'Elimina el desorden y organiza el espacio' },
    { value: 'Golden sunset lighting, warm tones', label: '☀️ Luz de atardecer', tip: 'Tonos dorados y calidos como al atardecer' },
    { value: 'Night ambient atmosphere, interior lights on', label: '🌙 Ambiente nocturno', tip: 'Luces interiores encendidas, ambiente acogedor' },
    { value: 'Add realistic green plants and vegetation', label: '🪴 Plantas', tip: 'Anade plantas verdes decorativas' },
    { value: 'Add basic realistic furniture (sofa, rug, table) if space is empty', label: '🛋️ Muebles', tip: 'Sofa, mesa, alfombra si el espacio esta vacio' },
    { value: 'Maximum quality finishes, premium materials, high-end look', label: '✨ Acabados premium', tip: 'Materiales de alta gama y acabados de lujo' },
  ]

  const toggleExtra = (value: string) => {
    setSelectedExtras((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const tabIcons: Record<string, React.ReactNode> = {
    'Subir fotos': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
    'Procesando': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>,
    'Resultados': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Editor 3D': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" /></svg>,
    'Tour 3D': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>,
  }

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando proyecto...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav with breadcrumb */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors hidden sm:block shrink-0">
              Mis proyectos
            </Link>
            <svg className="w-4 h-4 text-gray-600 shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <h1 className="text-lg font-semibold truncate">{project?.name || 'Proyecto'}</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 mb-8 w-full sm:w-fit overflow-x-auto">
          {ALL_TABS.filter(tab => tab !== 'Tour 3D' || userPlan === 'agency').map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-5 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap flex-1 sm:flex-none flex items-center justify-center gap-1.5 ${
                activeTab === tab ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">{tabIcons[tab]}</span>
              {tab}
              {tab === 'Procesando' && processing.length > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-[10px] font-bold rounded-full flex items-center justify-center ml-1">
                  {processing.length}
                </span>
              )}
              {tab === 'Resultados' && results.length > 0 && (
                <span className="w-4 h-4 bg-emerald-500 text-[10px] font-bold rounded-full flex items-center justify-center ml-1">
                  {results.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── SUBIR FOTOS ─── */}
        {activeTab === 'Subir fotos' && (
          <div>
            {/* Mode selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Que quieres hacer?</h3>
              <div className="grid grid-cols-2 gap-3">
                {MODE_OPTIONS.map((mode) => {
                  const locked = mode.value === 'renovation' && (userPlan === 'free' || userPlan === 'starter')
                  if (locked) {
                    return (
                      <a
                        key={mode.value}
                        href="/pricing"
                        className="text-left px-5 py-4 rounded-xl border-2 border-surface-border bg-surface-card text-gray-400 hover:border-gray-600 transition-all cursor-pointer"
                      >
                        <p className="text-base font-semibold text-white flex items-center gap-2">
                          🔒 {mode.label}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">Plan Professional</p>
                      </a>
                    )
                  }
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setProcessMode(mode.value)}
                      className={`text-left px-5 py-4 rounded-xl border-2 transition-all ${
                        processMode === mode.value
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-surface-border bg-surface-card text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <p className={`text-base font-semibold ${processMode === mode.value ? 'text-accent' : 'text-white'}`}>
                        {mode.label}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5">{mode.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Photography tips - plain text */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-white mb-2">Para mejores resultados:</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>· Dispara en horizontal</p>
                <p>· Altura de 1 metro aproximadamente</p>
                <p>· Usa luz natural, abre las persianas</p>
                <p>· Desde las esquinas de la habitacion</p>
                <p>· Sin zoom, mejor con gran angular (0.5x)</p>
                <p>· Manten el movil recto, sin inclinar</p>
              </div>
            </div>

            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            {/* Drag & drop area */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center mb-8 transition-all cursor-pointer ${
                isDragging
                  ? 'border-accent bg-accent/10'
                  : 'border-surface-border hover:border-accent/50 hover:bg-surface-card/50'
              }`}
            >
              <p className="text-white font-medium text-base mb-2">
                {isDragging ? 'Suelta las fotos aqui' : 'Arrastra tus fotos aqui'}
              </p>
              <p className="text-gray-500 text-sm mb-3">o</p>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent font-medium px-5 py-2.5 rounded-xl border border-accent/30">
                Seleccionar fotos
              </div>
              <p className="text-gray-600 text-xs mt-3">JPG, PNG o WebP — maximo 7 fotos</p>
            </div>

            {uploads.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-white mb-4">
                  {uploads.length} foto{uploads.length !== 1 ? 's' : ''} seleccionada{uploads.length !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-2 mb-8">
                  {uploads.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center justify-between bg-surface-card border border-surface-border rounded-xl px-4 sm:px-5 py-3 sm:py-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-light flex-shrink-0">
                          <img
                            src={URL.createObjectURL(photo.file)}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{photo.name}</p>
                          <p className="text-xs text-gray-500">{photo.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUpload(photo.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors shrink-0 ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Renovation chips + textarea */}
                {processMode === 'renovation' && (
                  <div className="mb-8 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">Accion:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Limpiar y ordenar', text: 'clean and declutter the space, remove all mess and debris', tip: 'Quita el desorden y deja el espacio limpio' },
                          { label: 'Anadir muebles', text: 'add modern furniture appropriate for the space', tip: 'Sofa, mesa, sillas... lo que necesite' },
                          { label: 'Pintar paredes', text: 'paint all walls in clean bright white', tip: 'Paredes blancas y luminosas' },
                          { label: 'Suelo de madera', text: 'replace the floor with light natural wood flooring', tip: 'Parquet de madera clara natural' },
                          { label: 'Acabados de lujo', text: 'upgrade all finishes to premium luxury quality', tip: 'Materiales premium y acabados de alta gama' },
                        ].filter((chip) => !chip.text.includes('declutter') || userPlan === 'pro' || userPlan === 'agency').map((chip) => (
                          <Tooltip key={chip.label} text={chip.tip}>
                            <button
                              type="button"
                              onClick={() => setRenovationText(prev =>
                                prev.includes(chip.text) ? prev.replace(chip.text + ', ', '').replace(chip.text, '').trim() : (prev ? prev + ', ' + chip.text : chip.text)
                              )}
                              className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                                renovationText.includes(chip.text)
                                  ? 'bg-accent/20 border-accent text-white'
                                  : 'bg-surface-light border-surface-border text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {chip.label}
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white mb-2">Estilo:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Moderno', text: 'modern minimalist style with clean lines', tip: 'Minimalista, lineas limpias' },
                          { label: 'Nordico', text: 'nordic scandinavian style with warm wood and white tones', tip: 'Madera clara y tonos blancos' },
                          { label: 'Mediterraneo', text: 'mediterranean style with warm terracotta and natural textures', tip: 'Terracota y texturas naturales' },
                          { label: 'Industrial', text: 'urban industrial style with exposed concrete and metal', tip: 'Hormigon visto y metal' },
                          { label: 'Clasico', text: 'classic elegant style with refined traditional details', tip: 'Elegante y tradicional' },
                        ].map((chip) => (
                          <Tooltip key={chip.label} text={chip.tip}>
                            <button
                              type="button"
                              onClick={() => {
                                const styleTexts = ['modern minimalist style with clean lines', 'nordic scandinavian style with warm wood and white tones', 'mediterranean style with warm terracotta and natural textures', 'urban industrial style with exposed concrete and metal', 'classic elegant style with refined traditional details']
                                setRenovationText(prev => {
                                  let base = prev
                                  styleTexts.forEach(s => { base = base.replace(', ' + s, '').replace(s + ', ', '').replace(s, '') })
                                  base = base.trim().replace(/,$/, '').trim()
                                  return base ? base + ', ' + chip.text : chip.text
                                })
                              }}
                              className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                                renovationText.includes(chip.text)
                                  ? 'bg-accent/20 border-accent text-white'
                                  : 'bg-surface-light border-surface-border text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {chip.label}
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <textarea
                        value={renovationText}
                        onChange={(e) => setRenovationText(e.target.value)}
                        placeholder="O describe la reforma: cambiar suelo a madera, pintar paredes de blanco..."
                        rows={3}
                        className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent resize-none"
                      />
                    </div>
                  </div>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <label className="block text-xs font-medium text-amber-400 mb-1.5">DEV: Modelo de IA</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full sm:w-auto bg-surface border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="gemini-3-pro-image-preview">gemini-3-pro-image-preview (default)</option>
                      <option value="gemini-3.1-flash-image-preview">gemini-3.1-flash-image-preview</option>
                      <option value="gemini-2.5-flash-image">gemini-2.5-flash-image</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={processPhotos}
                  disabled={isProcessing || (processMode === 'renovation' && !renovationText.trim())}
                  className="w-full sm:w-auto bg-accent hover:bg-accent-light hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base px-8 py-3.5 min-h-[52px] rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  Procesar {uploads.length} foto{uploads.length !== 1 ? 's' : ''} con IA
                </button>
              </>
            )}

            {uploads.length === 0 && (
              <p className="text-center text-gray-600 text-sm">
                Selecciona o arrastra fotos para empezar
              </p>
            )}
          </div>
        )}

        {/* ─── PROCESANDO ─── */}
        {activeTab === 'Procesando' && (
          <div className="space-y-4">
            {processError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-red-400 mb-1">Algo fue mal</p>
                <p className="text-sm text-red-300/80">{processError}</p>
                <p className="text-xs text-gray-500 mt-2">Prueba con otra foto o intentalo de nuevo.</p>
              </div>
            )}
            {processing.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">⏳</div>
                <p className="text-gray-400 font-medium">No hay fotos procesandose</p>
                <p className="text-sm text-gray-600 mt-1">Sube fotos y pulsa "Procesar" para empezar</p>
              </div>
            ) : (
              processing.map((photo) => {
                const blurAmount = photo.progress >= 0 ? Math.max(0, 20 - (photo.progress / 100) * 20) : 0
                return (
                  <div
                    key={photo.id}
                    className="bg-surface-card border border-surface-border rounded-xl overflow-hidden"
                  >
                    {photo.previewUrl && photo.progress >= 0 && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={photo.previewUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover transition-[filter] duration-1000 ease-out"
                          style={{ filter: `blur(${blurAmount}px)` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-white font-medium">La IA esta trabajando... esto tarda unos segundos</span>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-white">{photo.name}</p>
                        {photo.progress === -1 ? (
                          <span className="text-sm text-red-400 font-medium">Error</span>
                        ) : (
                          <span className="text-sm text-accent font-medium">{photo.progress}%</span>
                        )}
                      </div>
                      <div className="w-full bg-surface-light rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            photo.progress === -1 ? 'bg-red-500' : 'bg-accent'
                          }`}
                          style={{ width: `${photo.progress === -1 ? 100 : photo.progress}%` }}
                        />
                      </div>
                      {photo.progress === -1 && (() => {
                        const errMsg = photoErrors.get(photo.id) || 'Error al procesar. Intenta con otra foto o recarga la página.'
                        const isQuota = errMsg.includes('/pricing') || errMsg.includes('plan')
                        return (
                          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                            <p className="text-sm text-red-400">{errMsg}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {isQuota ? (
                                <Link
                                  href="/pricing"
                                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
                                >
                                  Ver planes
                                </Link>
                              ) : (
                                <button
                                  onClick={() => {
                                    const savedPhoto = failedFiles.get(photo.id)
                                    if (savedPhoto) {
                                      setPhotoErrors((prev) => { const n = new Map(prev); n.delete(photo.id); return n })
                                      setFailedFiles((prev) => { const n = new Map(prev); n.delete(photo.id); return n })
                                      setProcessing((prev) => prev.filter((p) => p.id !== photo.id))
                                      setUploads((prev) => [...prev, savedPhoto])
                                      setTimeout(() => processPhotos(), 100)
                                    } else {
                                      addToast('Sube la foto de nuevo para reintentar', 'error')
                                    }
                                  }}
                                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                  Reintentar
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ─── PASCAL EDITOR PANEL ─── */}
        <AnimatePresence>
          {editingPhotoId && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !editApplying && setEditingPhotoId(null)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              />
              {/* Side panel */}
              <motion.div
                key="panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-96 z-50 bg-surface/95 backdrop-blur-xl border-l border-surface-border flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
                  <div>
                    <h2 className="text-base font-semibold text-white">Editar resultado</h2>
                    <p className="text-xs text-gray-400 mt-0.5">La IA aplicará los cambios sobre la foto mejorada</p>
                  </div>
                  <button
                    onClick={() => !editApplying && setEditingPhotoId(null)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe qué cambiar
                  </label>
                  <textarea
                    value={editPanelText}
                    onChange={(e) => setEditPanelText(e.target.value)}
                    placeholder="Describe qué cambiar: quita el sofá rojo, añade luz natural, cambia el suelo a parquet..."
                    rows={6}
                    className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    Sé específico para mejores resultados. El modelo usará la foto procesada como base.
                  </p>
                </div>
                <div className="px-6 py-5 border-t border-surface-border">
                  <button
                    onClick={applyEdit}
                    disabled={editApplying || !editPanelText.trim()}
                    className="w-full bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {editApplying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Aplicar
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ─── EDITOR 3D ─── */}
        {activeTab === 'Editor 3D' && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">🚀</div>
            <h3 className="text-xl font-bold text-white">Próximamente</h3>
            <p className="text-gray-400 text-sm text-center max-w-xs">Estamos trabajando en esta funcionalidad. Disponible en las próximas semanas.</p>
          </div>
        )}

        {/* ─── TOUR 3D ─── */}
        {activeTab === 'Tour 3D' && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">🚀</div>
            <h3 className="text-xl font-bold text-white">Próximamente</h3>
            <p className="text-gray-400 text-sm text-center max-w-xs">Estamos trabajando en esta funcionalidad. Disponible en las próximas semanas.</p>
          </div>
        )}

        {/* ─── RESULTADOS ─── */}
        {activeTab === 'Resultados' && (
          <div>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🖼️</div>
                <p className="text-gray-400 font-medium text-lg">Aun no hay resultados</p>
                <p className="text-sm text-gray-600 mt-1 mb-6">Sube fotos y procesalas para ver la magia</p>
                <button
                  onClick={() => setActiveTab('Subir fotos')}
                  className="bg-accent hover:bg-accent-light text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Subir fotos
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Success message */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4">
                  <div className="text-2xl">🎉</div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Listo! {results.length} foto{results.length !== 1 ? 's' : ''} mejorada{results.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Arrastra el deslizador para comparar el antes y el despues</p>
                  </div>
                </div>

                {results.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-surface-card border border-surface-border rounded-xl overflow-hidden"
                  >
                    {/* Before/After slider */}
                    <ResultSlider
                      originalUrl={photo.originalUrl}
                      processedUrl={photo.processedUrl}
                      name={photo.name}
                    />

                    {/* Scan reveal for new results */}
                    {newResultIds.has(photo.id) && (
                      <motion.div
                        className="absolute inset-0 z-20 pointer-events-none"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.8 }}
                        onAnimationComplete={() => {
                          setNewResultIds((prev) => {
                            const next = new Set(prev)
                            next.delete(photo.id)
                            return next
                          })
                        }}
                      />
                    )}

                    <div className="p-4 sm:p-5 border-t border-surface-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <p className="text-sm font-medium text-white">{photo.name}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => downloadPhoto(photo.originalUrl, `original-${photo.name}`)}
                            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
                          >
                            Descargar original
                          </button>
                          <button
                            onClick={() => downloadPhoto(photo.processedUrl, `mejorada-${photo.name}`)}
                            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors min-h-[44px]"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar foto mejorada
                          </button>
                        </div>
                      </div>
                      {/* Pascal Editor button */}
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => {
                            setEditingPhotoId(photo.id)
                            setEditPanelText('')
                          }}
                          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-surface-border bg-surface-light hover:border-accent/50 hover:text-accent text-gray-300 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                          Editar más
                        </button>
                      </div>

                      {/* Version history strip */}
                      {(photoHistories[photo.id]?.length ?? 0) > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Versiones anteriores:</p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {(photoHistories[photo.id] ?? []).map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setResults((prev) =>
                                    prev.map((r) => (r.id === photo.id ? { ...r, processedUrl: url } : r))
                                  )
                                }
                                className="shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 border-surface-border hover:border-accent transition-colors"
                                title={`Versión ${idx + 1}`}
                              >
                                <img src={url} alt={`v${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Relighting buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 mr-1">Cambiar iluminacion:</span>
                        {([
                          { type: 'relight-dawn' as const, label: '🌅 Amanecer', tip: 'Luz calida de amanecer' },
                          { type: 'relight-day' as const, label: '☀️ Dia', tip: 'Luz natural de dia' },
                          { type: 'relight-night' as const, label: '🌙 Noche', tip: 'Ambiente nocturno acogedor' },
                        ]).map((rl) => (
                          <Tooltip key={rl.type} text={rl.tip}>
                            <button
                              onClick={() => relightPhoto(photo, rl.type)}
                              disabled={relightingId === photo.id}
                              className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-light hover:border-accent/50 hover:text-accent text-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {relightingId === photo.id ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                  ~30 seg...
                                </span>
                              ) : rl.label}
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* CTA to process more */}
                <div className="text-center py-8 bg-surface-card border border-surface-border rounded-2xl">
                  <p className="text-lg font-semibold text-white mb-2">Quieres procesar mas fotos?</p>
                  <p className="text-sm text-gray-400 mb-5">Sube mas imagenes de esta propiedad</p>
                  <button
                    onClick={() => setActiveTab('Subir fotos')}
                    className="bg-accent hover:bg-accent-light text-white font-medium px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Subir mas fotos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
