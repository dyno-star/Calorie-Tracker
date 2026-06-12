import { useState } from 'react'
import CameraModal from './CameraModal'

const CHIPS = [
  { label: '🍌 Banana', value: 'banana' },
  { label: '☕ Coffee', value: 'coffee with milk' },
  { label: '🍗 Chicken', value: 'chicken breast 150g' },
  { label: '🥣 Oats', value: 'bowl of oatmeal' },
]

function groupEntries(entries) {
  const groups = { Morning: [], Afternoon: [], Evening: [], Night: [] }
  entries.forEach(e => {
    const h = new Date(e.ts).getHours()
    if (h < 12) groups.Morning.push(e)
    else if (h < 17) groups.Afternoon.push(e)
    else if (h < 21) groups.Evening.push(e)
    else groups.Night.push(e)
  })
  return groups
}

function imageStatusLabel(status) {
  if (status === 'analyzing') return '🔍 AI analyzing your meal…'
  if (status === 'done') return '📸 Photo analyzed'
  if (status === 'error') return '⚠️ Analysis failed'
  return '📸 Ready to analyze'
}

export default function LogPanel({
  entries, foodInput, setFoodInput,
  imageData, pendingEntry, isAnalyzing,
  onImageFile, onClearImage, onAnalyze, onConfirmLog, onDismissResult, onDeleteEntry,
}) {
  const [showCamera, setShowCamera] = useState(false)
  const groups = groupEntries(entries)

  return (
    <div className="panel">
      {showCamera && (
        <CameraModal
          onCapture={(file) => { onImageFile(file); setShowCamera(false) }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="ai-card">
        <div className="ai-lbl">
          <div className="ai-dot" />
          AI Food Recognition
        </div>

        <div className="photo-btns">
          {/* Opens live camera via getUserMedia */}
          <button className="photo-btn" onClick={() => setShowCamera(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Take Photo
          </button>

          {/* File picker for existing images */}
          <label className="photo-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Upload Photo
            <input
              type="file"
              accept="image/*"
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', fontSize: 0 }}
              onChange={e => { onImageFile(e.target.files[0]); e.target.value = '' }}
            />
          </label>
        </div>

        {imageData && (
          <div className="img-preview-wrap">
            <img src={imageData.url} alt="food" />
            <div className="img-preview-overlay" />
            <div className="img-preview-label">{imageStatusLabel(imageData.status)}</div>
            <button className="img-clear-btn" onClick={onClearImage}>✕</button>
          </div>
        )}

        <div className="mode-divider">
          <div className="mode-divider-line" />
          <div className="mode-divider-txt">or describe</div>
          <div className="mode-divider-line" />
        </div>

        <textarea
          className="ai-textarea"
          value={foodInput}
          onChange={e => setFoodInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onAnalyze()
            }
          }}
          placeholder="Describe what you ate… e.g. '2 scrambled eggs with toast and butter'"
        />

        {isAnalyzing && <div className="loading-bar" />}

        {pendingEntry && (
          <div className="result-preview">
            <div className="result-food-name">{pendingEntry.emoji} {pendingEntry.name}</div>
            <div className="result-macros-txt">
              <strong>{pendingEntry.cal} kcal</strong><br />
              Protein: {pendingEntry.p}g &nbsp;·&nbsp; Carbs: {pendingEntry.c}g &nbsp;·&nbsp; Fat: {pendingEntry.f}g
            </div>
            <div className="confirm-row">
              <button className="confirm-btn yes" onClick={onConfirmLog}>✓ Add to log</button>
              <button className="confirm-btn no" onClick={onDismissResult}>Discard</button>
            </div>
          </div>
        )}

        <div className="ai-actions">
          <div className="chips">
            {CHIPS.map(chip => (
              <div
                key={chip.value}
                className="chip"
                onClick={() => {
                  setFoodInput(chip.value)
                  onAnalyze(chip.value)
                }}
              >
                {chip.label}
              </div>
            ))}
          </div>
          <button className="log-btn" disabled={isAnalyzing} onClick={() => onAnalyze()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2" />
              <path d="m15 9-6 6M9 9h6v6" />
            </svg>
            {isAnalyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className="section-hdr">Today's food log</div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-txt">Nothing logged yet.<br />Describe your meal above.</div>
        </div>
      ) : (
        Object.entries(groups).map(([name, items]) =>
          items.length > 0 ? (
            <div key={name} className="meal-group">
              <div className="meal-group-title">{name}</div>
              {items.map(e => (
                <div key={e.id} className="entry-card">
                  <div className="entry-icon">{e.emoji}</div>
                  <div className="entry-info">
                    <div className="entry-name">{e.name}</div>
                    <div className="entry-detail">P: {e.p}g · C: {e.c}g · F: {e.f}g</div>
                  </div>
                  <div className="entry-cal">{e.cal}</div>
                  <button className="entry-del" onClick={() => onDeleteEntry(e.id)}>✕</button>
                </div>
              ))}
            </div>
          ) : null
        )
      )}
    </div>
  )
}
