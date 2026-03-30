function BrandLogo({ className = '', textClassName = '', compact = false }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <span
        className={`font-display font-bold tracking-tight ${
          compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
        } ${textClassName}`}
      >
        LaunchPad CICF
      </span>
    </div>
  )
}

export default BrandLogo