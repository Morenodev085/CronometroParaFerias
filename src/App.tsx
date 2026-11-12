import { useEffect, useState } from 'react'
import { SpinningCredit } from './components/spinning-credit'
import { BubbleBackground } from './components/bubble-background'
import { FlipUnit } from './components/8starlabs-ui/flip-clock'

const vacationDate = '2026-12-17T17:40:00'

function remainingSeconds() {
  const deadline = new Date(vacationDate).getTime()
  if (!Number.isFinite(deadline)) return 0
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

function CountdownTimer() {
  const [seconds, setSeconds] = useState(remainingSeconds)

  useEffect(() => {
    const update = () => setSeconds(remainingSeconds())
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const units = [
    { label: 'Dias', value: Math.floor(seconds / 86400) },
    { label: 'Horas', value: Math.floor(seconds / 3600) % 24 },
    { label: 'Minutos', value: Math.floor(seconds / 60) % 60 },
    { label: 'Segundos', value: seconds % 60 },
  ]

  return (
    <div className="timer" role="timer" aria-label="Tempo restante até as férias">
      {units.map(({ label, value }) => (
        <div className="unit" key={label} aria-label={`${value} ${label}`}>
          <div className="flip-digits">
            {Array.from(String(value).padStart(2, '0')).map((digit, index) => (
              <FlipUnit key={index} digit={digit} size="sm" className="vacation-digit" />
            ))}
          </div>
          <span aria-hidden="true">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <main className="site">
      <BubbleBackground />
      <section className="countdown" aria-labelledby="title">
        <h1 id="title">Contador até férias</h1>
        <p>Contando os minutos para chegar às férias! Elas começam em:</p>
        <CountdownTimer />
      </section>
      <SpinningCredit />
    </main>
  )
}
