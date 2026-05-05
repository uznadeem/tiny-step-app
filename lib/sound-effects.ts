type AudioWindow = Window & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null

  const audioWindow = window as AudioWindow
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext

  if (!AudioContextConstructor) return null

  audioContext ||= new AudioContextConstructor()
  return audioContext
}

function playTone(frequency: number, startOffset: number, duration: number, gain = 0.045) {
  const context = getAudioContext()
  if (!context) return

  const oscillator = context.createOscillator()
  const volume = context.createGain()
  const startAt = context.currentTime + startOffset
  const endAt = startAt + duration

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startAt)
  volume.gain.setValueAtTime(0.0001, startAt)
  volume.gain.exponentialRampToValueAtTime(gain, startAt + 0.012)
  volume.gain.exponentialRampToValueAtTime(0.0001, endAt)

  oscillator.connect(volume)
  volume.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(endAt + 0.02)
}

export function playCheckboxSound() {
  playTone(660, 0, 0.08, 0.035)
}

export function playCompletionSound() {
  playTone(523.25, 0, 0.1)
  playTone(659.25, 0.08, 0.11)
  playTone(783.99, 0.17, 0.14)
}
