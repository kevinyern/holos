import Navbar from '@/components/Navbar'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  )
}
