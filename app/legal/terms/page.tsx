import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio · PhotoAgent',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Términos de Servicio</h1>
          <p className="text-gray-500 text-sm">Última actualización: 1 de enero de 2025</p>
        </div>

        <Section title="1. Descripción del servicio">
          <p>PhotoAgent es una plataforma SaaS que utiliza inteligencia artificial para mejorar y transformar fotografías inmobiliarias. Operado por <strong className="text-white">PhotoAgent SL</strong> y accesible en <a href="https://photoagent.pro" className="text-blue-400 hover:text-blue-300">photoagent.pro</a>.</p>
        </Section>

        <Section title="2. Aceptación de los términos">
          <p>Al crear una cuenta o usar el servicio, aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses la plataforma.</p>
        </Section>

        <Section title="3. Uso aceptable">
          <p>Te comprometes a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usar el servicio únicamente para fines legales y legítimos.</li>
            <li>No subir imágenes que infrinjan derechos de terceros o contengan material ilícito.</li>
            <li>No intentar acceder a cuentas ajenas ni realizar ingeniería inversa del servicio.</li>
            <li>No usar el servicio para generar contenido engañoso o fraudulento.</li>
          </ul>
        </Section>

        <Section title="4. Propiedad intelectual">
          <p>Las imágenes que subes siguen siendo tuyas. Al subirlas, nos otorgas una licencia temporal y limitada para procesarlas con el fin de prestarte el servicio. PhotoAgent no reclamará derechos de propiedad sobre tu contenido.</p>
          <p>La plataforma, su código, diseño y modelos de IA son propiedad exclusiva de PhotoAgent SL.</p>
        </Section>

        <Section title="5. Planes y pagos">
          <p>Los precios y características de cada plan están detallados en la página de <a href="/pricing" className="text-blue-400 hover:text-blue-300">Planes</a>. Los pagos son procesados por Stripe. El acceso se activa inmediatamente tras la confirmación del pago.</p>
        </Section>

        <Section title="6. Cancelación">
          <p>Puedes cancelar tu suscripción en cualquier momento desde tu perfil. El acceso se mantendrá hasta el final del período facturado en curso. No se realizan reembolsos parciales salvo error imputable a PhotoAgent.</p>
        </Section>

        <Section title="7. Limitación de responsabilidad">
          <p>PhotoAgent ofrece el servicio &ldquo;tal cual&rdquo;, sin garantías implícitas de resultados específicos. En ningún caso la responsabilidad total de PhotoAgent superará el importe abonado en los últimos 3 meses. No somos responsables de decisiones de negocio basadas en las imágenes generadas.</p>
        </Section>

        <Section title="8. Disponibilidad del servicio">
          <p>Nos esforzamos por mantener una disponibilidad del 99%. No garantizamos un servicio ininterrumpido. Los mantenimientos planificados serán comunicados con antelación.</p>
        </Section>

        <Section title="9. Modificaciones">
          <p>Podemos actualizar estos términos. Los cambios relevantes se notificarán por email con al menos 15 días de antelación.</p>
        </Section>

        <Section title="10. Legislación aplicable">
          <p>Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los juzgados competentes de España.</p>
        </Section>

        <Section title="Contacto">
          <p><a href="mailto:hola@photoagent.pro" className="text-blue-400 hover:text-blue-300">hola@photoagent.pro</a></p>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}
