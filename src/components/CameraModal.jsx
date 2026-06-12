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
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          try {
            await video.play()
          } catch {
            // play() rejects if the component unmounts mid-start; safe to ignore
          }
          if (!cancelled) setReady(true)
        }
      } catch (e) {
        if (cancelled) return
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setError('Camera access was denied. Please allow camera permissions in your browser and try again.')
        } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
          setError('No camera was found on this device.')
        } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
          setError('Camera is already in use by another application.')
        } else {
          setError(e.message || 'Could not start camera.')
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

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
            <button className="camera-error-close" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            {!ready && (
              <div className="camera-starting">
                <div className="camera-spinner" />
                Starting camera…
              </div>
            )}
            <div className="camera-controls">
              <div className="camera-hint">Point at your meal and tap to capture</div>
              <button className="camera-shutter" onClick={capture}>
                <div className="camera-shutter-inner" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
