interface LogoProps {
  className?: string
}

export default function Logo({ className = 'text-xl' }: LogoProps) {
  return (
    <a href="#" className={`font-bold tracking-tight ${className}`}>
      <span className="text-white">PhotoAgent</span>
      <span className="text-accent">.</span>
    </a>
  )
}
