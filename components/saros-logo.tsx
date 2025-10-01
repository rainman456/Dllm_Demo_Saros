export function SarosLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
      <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="currentColor" opacity="0.8" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
    </svg>
  )
}
