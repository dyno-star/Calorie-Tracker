import { useRef, useEffect, useState } from 'react'

export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (e) {
        if (!cancelled) setError(e.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow camera permissions and try again.'
          : (e.message || 'Could not access camera.')
        )
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleVideoReady = () => setReady(true)

  const capture = () => {
    const video = videoRef.current
    if (!video || !ready) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'meal-photo.jpg', { type: 'image/jpeg' })
        streamRef.current?.getTracks().forEach(t => t.stop())
        onCapture(file)
      },
      'image/jpeg',
      0.85,
    )
  }

  return (
    <div className="camera-overlay">
      <div className="camera-shell">
        <button className="camera-close-btn" onClick={onClose}>✕</button>

        {error ? (
          <div className="camera-error">
            <div className="camera-error-icon">📷</div>
            <div className="camera-error-msg">{error}</div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              onCanPlay={handleVideoReady}
            />
            {!ready && (
              <div className="camera-starting">
                <div className="camera-spinner" />
                Starting camera…
              </div>
            )}
            <div className="camera-controls">
              <div className="camera-hint">Tap the button to capture your meal</div>
              <button
                className={`camera-shutter${ready ? '' : ' disabled'}`}
                onClick={capture}
                disabled={!ready}
              >
                <div className="camera-shutter-inner" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
