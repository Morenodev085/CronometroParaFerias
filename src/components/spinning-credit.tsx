const credit = 'feito por Trama Cultural • '

// Local CSS fallback while the Magic UI registry is unavailable.
export function SpinningCredit() {
  return (
    <footer className="credit" aria-label="Feito por Trama Cultural">
      <div className="credit-ring" aria-hidden="true">
        {Array.from(credit).map((letter, index) => (
          <span
            key={index}
            style={{ transform: `rotate(${index * 360 / Array.from(credit).length}deg)` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <span className="credit-star" aria-hidden="true">✳</span>
    </footer>
  )
}
