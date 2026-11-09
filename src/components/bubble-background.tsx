// CSS fallback inspired by Animate UI's Bubble Background.
// https://animate-ui.com/docs/backgrounds/bubble
export function BubbleBackground() {
  return (
    <div className="bubble-background" aria-hidden="true">
      <div className="bubble-clouds">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={`bubble bubble-${index + 1}`} key={index} />
        ))}
      </div>
    </div>
  )
}
