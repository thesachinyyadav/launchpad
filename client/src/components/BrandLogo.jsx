function BrandLogo({ className = '', textClassName = '', compact = false }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img src="/logo.svg" alt="LaunchPad CICF logo" className="h-10 w-auto sm:h-12" />
      {!compact ? (
        <span className={`font-display text-xl font-bold tracking-tight sm:text-2xl ${textClassName}`}>
          LaunchPad CICF
        </span>
      ) : null}
    </div>
  )
}

export default BrandLogo