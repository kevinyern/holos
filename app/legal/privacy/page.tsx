import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad · PhotoAgent',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Política de Privacidad</h1>
          <p className="text-gray-500 text-sm">Última actualización: 1 de enero de 2025</p>
        </div>

        <Section title="1. Responsable del tratamiento">
          <p><strong className="text-white">PhotoAgent SL</strong> es el responsable del tratamiento de los datos personales recogidos a través de este sitio web y servicio.</p>
          <p>Contacto: <a href="mailto:hola@photoagent.pro" className="text-blue-400 hover:text-blue-300">hola@photoagent.pro</a></p>
        </Section>

        <Section title="2. Datos que recogemos">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Datos de cuenta:</strong> nombre, dirección de email y contraseña cifrada.</li>
            <li><strong className="text-white">Imágenes subidas:</strong> fotografías que el usuario sube para su procesamiento con IA.</li>
            <li><strong className="text-white">Datos de uso:</strong> interacciones con la plataforma, logs técnicos, IP y agente de navegador.</li>
            <li><strong className="text-white">Datos de pago:</strong> gestionados exclusivamente por Stripe. PhotoAgent no almacena datos de tarjeta.</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <ul className="list-disc pl-5 space-y-1">
            <li>Prestar el servicio de transformación de imágenes con IA.</li>
            <li>Gestionar tu cuenta y comunicaciones relacionadas con el servicio.</li>
            <li>Mejorar la plataforma mediante análisis de uso agregado y anonimizado.</li>
            <li>Cumplir obligaciones legales y fiscales.</li>
          </ul>
        </Section>

        <Section title="4. Base legal">
          <p>El tratamiento se basa en la ejecución del contrato de servicio (art. 6.1.b RGPD) y, cuando proceda, en el interés legítimo de PhotoAgent (art. 6.1.f RGPD).</p>
        </Section>

        <Section title="5. Conservación de datos">
          <p>Los datos se conservan mientras tu cuenta esté activa. Las imágenes subidas se eliminan automáticamente a los 30 días salvo que las guardes en tu biblioteca.</p>
        </Section>

        <Section title="6. Tus derechos (RGPD)">
          <p>Tienes derecho a acceder, rectificar, suprimir, oponerte y portar tus datos. Para ejercer cualquier derecho, escríbenos a <a href="mailto:hola@photoagent.pro" className="text-blue-400 hover:text-blue-300">hola@photoagent.pro</a>. Responderemos en un plazo máximo de 30 días.</p>
        </Section>

        <Section title="7. Cancelación de cuenta">
          <p>Puedes cancelar tu cuenta en cualquier momento desde los ajustes de tu perfil o escribiendo a <a href="mailto:hola@photoagent.pro" className="text-blue-400 hover:text-blue-300">hola@photoagent.pro</a>. Tus datos serán eliminados en un plazo de 30 días tras la cancelación.</p>
        </Section>

        <Section title="8. Cookies">
          <p>PhotoAgent utiliza únicamente cookies técnicas necesarias para el funcionamiento del servicio (sesión de usuario). No utilizamos cookies de seguimiento ni publicidad de terceros.</p>
        </Section>

        <Section title="9. Transferencias internacionales">
          <p>Algunos proveedores de infraestructura cloud pueden procesar datos fuera del EEE, siempre bajo garantías adecuadas conforme al RGPD (cláusulas contractuales tipo).</p>
        </Section>

        <Section title="10. Cambios en esta política">
          <p>Notificaremos cualquier cambio relevante por email o mediante aviso en la plataforma antes de su entrada en vigor.</p>
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
