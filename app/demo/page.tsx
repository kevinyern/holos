import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Demo — Resultados reales | Holos',
  description: 'Mira lo que Holos hace con fotos reales de inmuebles. Sin trampa.',
}

const examples = [
  {
    before: '/images/orden-antes-2.jpeg',
    after: '/images/orden-despues-2.jpeg',
    label: 'Salón',
  },
  {
    before: '/images/orden-antes-3.jpeg',
    after: '/images/orden-despues-3.jpeg',
    label: 'Habitación',
  },
  {
    before: '/images/orden-antes-4.jpeg',
    after: '/images/orden-despues-4.jpeg',
    label: 'Cocina',
  },
  {
    before: '/images/antes-obra-1.jpeg',
    after: '/images/despues-obra-1.jpeg',
    label: 'Obra → Listo para vender',
  },
  {
    before: '/images/antes-obra-2.jpeg',
    after: '/images/despues-obra-2.jpeg',
    label: 'Reforma virtual',
  },
  {
    before: '/images/antes-obra-3.jpeg',
    after: '/images/despues-obra-3.jpeg',
    label: 'Acabados profesionales',
  },
]

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">Sin filtros. Sin Photoshop.</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5">
            Resultados reales. Sin trampa.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Fotos de clientes reales, procesadas con IA en menos de 30 segundos.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {examples.map((ex, i) => (
            <div key={i} className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-surface-border">
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Antes
                    </span>
                  </div>
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={ex.before}
                      alt={`Antes — ${ex.label}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-accent/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Después
                    </span>
                  </div>
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={ex.after}
                      alt={`Después — ${ex.label}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3">
                <p className="text-sm text-gray-400 font-medium">{ex.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6 text-lg">¿Quieres ver qué hace con tus fotos?</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.35)]"
          >
            Prueba con tu propia foto →
          </Link>
          <p className="text-gray-600 text-sm mt-4">Sin tarjeta · Resultado en 30 segundos</p>
        </div>

      </div>
    </main>
  )
}
