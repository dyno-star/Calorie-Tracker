import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import LogPanel from './components/LogPanel'
import SummaryPanel from './components/SummaryPanel'
import GoalsPanel from './components/GoalsPanel'
import Toast from './components/Toast'

const FOOD_EMOJIS = {
  fruit: '🍎', vegetable: '🥦', grain: '🌾', bread: '🍞', rice: '🍚', pasta: '🍝',
  egg: '🥚', chicken: '🍗', meat: '🥩', fish: '🐟', seafood: '🦐', dairy: '🧀',
  milk: '🥛', yogurt: '🥛', coffee: '☕', tea: '🍵', juice: '🧃', water: '💧',
  salad: '🥗', soup: '🍲', pizza: '🍕', burger: '🍔', sandwich: '🥪', wrap: '🌯',
  taco: '🌮', sushi: '🍣', cake: '🎂', cookie: '🍪', chocolate: '🍫', ice: '🍦',
  dessert: '🍮', snack: '🥜', smoothie: '🥤', protein: '💪', oat: '🥣',
  banana: '🍌', apple: '🍎',
}

function getEmoji(name) {
  const n = name.toLowerCase()
  for (const [k, v] of Object.entries(FOOD_EMOJIS)) {
    if (n.includes(k)) return v
  }
  return '🍽️'
}

const todayKey = () => new Date().toISOString().slice(0, 10)
const DEFAULT_GOALS = { cal: 2000, p: 150, c: 250, f: 65 }

export default function App() {
  const [goals, setGoalsState] = useState(() => {
    try {
      const s = localStorage.getItem('nourish_goals')
      return s ? { ...DEFAULT_GOALS, ...JSON.parse(s) } : DEFAULT_GOALS
    } catch { return DEFAULT_GOALS }
  })

  const [entries, setEntries] = useState(() => {
    try {
      const s = localStorage.getItem('nourish_entries_' + todayKey())
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })

  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('nourish_api') || '')
  const [activeTab, setActiveTab] = useState('log')
  const [pendingEntry, setPendingEntry] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [foodInput, setFoodInput] = useState('')
  const [toast, setToast] = useState({ message: '', visible: false })

  useEffect(() => {
    localStorage.setItem('nourish_entries_' + todayKey(), JSON.stringify(entries))
  }, [entries])

  const showToast = useCallback((message) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400)
  }, [])

  const totals = {
    cal: entries.reduce((s, e) => s + e.cal, 0),
    p: entries.reduce((s, e) => s + e.p, 0),
    c: entries.reduce((s, e) => s + e.c, 0),
    f: entries.reduce((s, e) => s + e.f, 0),
    count: entries.length,
  }

  const handleImageFile = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      const parts = dataUrl.split(',')
      setImageData({
        url: dataUrl,
        b64: parts[1],
        mime: file.type || 'image/jpeg',
        status: 'ready',
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const clearImage = useCallback(() => {
    setImageData(null)
    setPendingEntry(null)
  }, [])

  const analyzeFood = useCallback(async (textOverride) => {
    const textInput = (textOverride ?? foodInput).trim()
    const hasImage = !!imageData?.b64

    if (!hasImage && !textInput) {
      showToast('Describe your food or take a photo!')
      return
    }

    const key = apiKey
    if (!key) {
      showToast('Add your API key in Goals tab')
      setActiveTab('goals')
      return
    }

    setIsAnalyzing(true)
    setPendingEntry(null)
    if (hasImage) setImageData(d => d ? { ...d, status: 'analyzing' } : d)

    try {
      let userContent
      if (hasImage) {
        userContent = [
          { type: 'image', source: { type: 'base64', media_type: imageData.mime, data: imageData.b64 } },
          {
            type: 'text',
            text: textInput
              ? `Analyze this food photo. Additional context: ${textInput}`
              : 'Analyze the food in this photo. Identify all visible items and estimate the portions.',
          },
        ]
      } else {
        userContent = `Analyze this food: ${textInput}`
      }

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: `You are a nutrition expert. When given a food description or photo, respond ONLY with valid JSON (no markdown, no extra text) in this exact format:
{"name":"Food Name","calories":000,"protein":00,"carbs":00,"fat":00}
For photos: identify all visible food items, estimate reasonable portion sizes, calculate combined nutrition. Round all numbers to integers. Use realistic USDA-style values.`,
          messages: [{ role: 'user', content: userContent }],
        }),
      })

      const data = await resp.json()
      if (data.error) throw new Error(data.error.message)

      const parsed = JSON.parse(data.content[0].text.trim())
      setPendingEntry({
        id: Date.now().toString(),
        name: parsed.name,
        cal: parseInt(parsed.calories) || 0,
        p: parseInt(parsed.protein) || 0,
        c: parseInt(parsed.carbs) || 0,
        f: parseInt(parsed.fat) || 0,
        emoji: getEmoji(parsed.name),
        ts: Date.now(),
      })
      if (hasImage) setImageData(d => d ? { ...d, status: 'done' } : d)
    } catch (e) {
      showToast('Error: ' + (e.message || 'Check your API key'))
      if (hasImage) setImageData(d => d ? { ...d, status: 'error' } : d)
    } finally {
      setIsAnalyzing(false)
    }
  }, [foodInput, imageData, apiKey, showToast])

  const confirmLog = useCallback(() => {
    if (!pendingEntry) return
    setEntries(prev => [...prev, pendingEntry])
    setPendingEntry(null)
    setFoodInput('')
    setImageData(null)
    showToast('Logged! ✓')
  }, [pendingEntry, showToast])

  const dismissResult = useCallback(() => setPendingEntry(null), [])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    showToast('Removed')
  }, [showToast])

  const saveApiKey = useCallback((key) => {
    localStorage.setItem('nourish_api', key)
    setApiKeyState(key)
    showToast('API key saved ✓')
  }, [showToast])

  const saveGoals = useCallback((newGoals) => {
    setGoalsState(newGoals)
    localStorage.setItem('nourish_goals', JSON.stringify(newGoals))
    showToast('Goals saved ✓')
  }, [showToast])

  const resetDay = useCallback(() => {
    setEntries([])
    showToast('Log cleared')
  }, [showToast])

  return (
    <div>
      <Header totals={totals} goals={goals} />

      <div className="tabs">
        {[
          { id: 'log', label: 'Log Food' },
          { id: 'summary', label: 'Summary' },
          { id: 'goals', label: 'Goals' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main>
        {activeTab === 'log' && (
          <LogPanel
            entries={entries}
            foodInput={foodInput}
            setFoodInput={setFoodInput}
            imageData={imageData}
            pendingEntry={pendingEntry}
            isAnalyzing={isAnalyzing}
            onImageFile={handleImageFile}
            onClearImage={clearImage}
            onAnalyze={analyzeFood}
            onConfirmLog={confirmLog}
            onDismissResult={dismissResult}
            onDeleteEntry={deleteEntry}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryPanel entries={entries} totals={totals} goals={goals} />
        )}
        {activeTab === 'goals' && (
          <GoalsPanel
            apiKey={apiKey}
            goals={goals}
            onSaveApiKey={saveApiKey}
            onSaveGoals={saveGoals}
            onResetDay={resetDay}
            showToast={showToast}
          />
        )}
      </main>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
