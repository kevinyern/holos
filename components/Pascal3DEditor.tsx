'use client'

interface Props {
  referenceImageUrl?: string
  onScreenshot?: (dataUrl: string) => void
}

export default function Pascal3DEditor({ referenceImageUrl, onScreenshot }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Editor 3D</h3>
      <p className="text-gray-400 text-sm max-w-sm">
        El editor 3D interactivo está en desarrollo. Pronto podrás colocar muebles, cambiar materiales y previsualizar tu propiedad en 3D.
      </p>
      <div className="mt-6 px-4 py-2 bg-surface-card border border-surface-border rounded-full text-xs text-accent font-medium">
        Próximamente
      </div>
    </div>
  )
}
