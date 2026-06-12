import { useState } from 'react'

export default function GoalsPanel({ apiKey, goals, onSaveApiKey, onSaveGoals, onResetDay, showToast }) {
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)
  const [goalInputs, setGoalInputs] = useState({ ...goals })
  const [showCalc, setShowCalc] = useState(false)
  const [calcInputs, setCalcInputs] = useState({
    age: '', sex: 'male', weight: '', height: '', activity: '1.55', goal: 'maintain',
  })
  const [calcResult, setCalcResult] = useState(null)

  const handleSaveGoals = () => {
    onSaveGoals({
      cal: parseInt(goalInputs.cal) || 2000,
      p: parseInt(goalInputs.p) || 150,
      c: parseInt(goalInputs.c) || 250,
      f: parseInt(goalInputs.f) || 65,
    })
  }

  const runCalc = () => {
    if (!calcInputs.weight || !calcInputs.height) {
      showToast('Enter weight and height')
      return
    }
    const age = parseInt(calcInputs.age) || 30
    const weight = parseFloat(calcInputs.weight)
    const height = parseFloat(calcInputs.height)
    const activity = parseFloat(calcInputs.activity)

    let bmr = calcInputs.sex === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161

    let tdee = Math.round(bmr * activity)
    if (calcInputs.goal === 'cut') tdee -= 500
    else if (calcInputs.goal === 'bulk') tdee += 300

    const pCal = Math.round(tdee * 0.30)
    const cCal = Math.round(tdee * 0.40)
    const fCal = tdee - pCal - cCal
    setCalcResult({
      cal: tdee,
      p: Math.round(pCal / 4),
      c: Math.round(cCal / 4),
      f: Math.round(fCal / 9),
    })
  }

  const applyCalcGoals = () => {
    if (!calcResult) return
    setGoalInputs({ ...calcResult })
    onSaveGoals(calcResult)
    setShowCalc(false)
    showToast('Goals applied ✓')
  }

  const updateCalc = (key) => (e) => setCalcInputs(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="panel">
      {/* API Key */}
      <div className="settings-card">
        <div className="settings-title">API Key</div>
        <div className="settings-desc">
          Required for AI food recognition. Get yours free at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
            console.anthropic.com
          </a>
        </div>
        <div className="input-row">
          <input
            className="api-input"
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="sk-ant-..."
          />
          <button className="save-btn" onClick={() => onSaveApiKey(apiKeyInput)}>Save</button>
        </div>
        <div className={`status-badge ${apiKey ? 'ok' : 'missing'}`}>
          {apiKey ? '● Connected' : '● No key saved'}
        </div>
      </div>

      {/* Macro Goals */}
      <div className="settings-card">
        <div className="settings-title">Daily Macro Goals</div>
        <div className="settings-desc">Set your targets manually or use the calculator below.</div>

        {[
          { key: 'cal', name: 'Calories', hint: 'kcal/day', unit: 'kcal' },
          { key: 'p', name: 'Protein', hint: 'g/day', unit: 'g' },
          { key: 'c', name: 'Carbohydrates', hint: 'g/day', unit: 'g' },
          { key: 'f', name: 'Fat', hint: 'g/day', unit: 'g' },
        ].map(({ key, name, hint, unit }) => (
          <div key={key} className="goal-row">
            <div className="goal-info">
              <div className="goal-name">{name}</div>
              <div className="goal-hint">{hint}</div>
            </div>
            <div className="goal-input-wrap">
              <input
                className="goal-input"
                type="number"
                value={goalInputs[key]}
                onChange={e => setGoalInputs(p => ({ ...p, [key]: e.target.value }))}
              />
              <div className="goal-unit">{unit}</div>
            </div>
          </div>
        ))}

        <button className="goals-save-btn" onClick={handleSaveGoals}>Save Goals</button>
        <button className="ai-goals-btn" onClick={() => setShowCalc(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          Calculate from my stats
        </button>
      </div>

      {/* Reset */}
      <div className="settings-card">
        <div className="settings-title">Reset Today</div>
        <div className="settings-desc">Clear all food entries for today.</div>
        <button
          className="reset-btn"
          onClick={() => { if (window.confirm("Clear all entries for today?")) onResetDay() }}
        >
          Clear Today's Log
        </button>
      </div>

      {/* Macro Calculator Modal */}
      {showCalc && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowCalc(false) }}
        >
          <div className="modal-sheet">
            <button className="modal-close" onClick={() => setShowCalc(false)}>✕</button>
            <div className="modal-title">Macro Calculator</div>
            <div className="modal-desc">Enter your stats and we'll calculate your daily macro targets.</div>

            <div className="profile-grid">
              <div className="profile-field">
                <label>Age</label>
                <input type="number" value={calcInputs.age} onChange={updateCalc('age')} placeholder="25" />
              </div>
              <div className="profile-field">
                <label>Sex</label>
                <select value={calcInputs.sex} onChange={updateCalc('sex')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="profile-field">
                <label>Weight (kg)</label>
                <input type="number" value={calcInputs.weight} onChange={updateCalc('weight')} placeholder="70" />
              </div>
              <div className="profile-field">
                <label>Height (cm)</label>
                <input type="number" value={calcInputs.height} onChange={updateCalc('height')} placeholder="170" />
              </div>
              <div className="profile-field full">
                <label>Activity Level</label>
                <select value={calcInputs.activity} onChange={updateCalc('activity')}>
                  <option value="1.2">Sedentary (little/no exercise)</option>
                  <option value="1.375">Light (1–3 days/week)</option>
                  <option value="1.55">Moderate (3–5 days/week)</option>
                  <option value="1.725">Active (6–7 days/week)</option>
                  <option value="1.9">Very Active (twice/day)</option>
                </select>
              </div>
              <div className="profile-field full">
                <label>Goal</label>
                <select value={calcInputs.goal} onChange={updateCalc('goal')}>
                  <option value="cut">Lose Weight (–500 kcal)</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="bulk">Gain Weight (+300 kcal)</option>
                </select>
              </div>
            </div>

            <button className="calc-btn" onClick={runCalc}>Calculate My Macros</button>

            {calcResult && (
              <div className="calc-result">
                <div className="calc-result-title">Your recommended daily targets</div>
                <div className="calc-macros-grid">
                  <div className="calc-cell">
                    <div className="calc-val">{calcResult.cal}</div>
                    <div className="calc-lbl">Calories</div>
                  </div>
                  <div className="calc-cell">
                    <div className="calc-val">{calcResult.p}g</div>
                    <div className="calc-lbl">Protein</div>
                  </div>
                  <div className="calc-cell">
                    <div className="calc-val">{calcResult.c}g</div>
                    <div className="calc-lbl">Carbs</div>
                  </div>
                  <div className="calc-cell">
                    <div className="calc-val">{calcResult.f}g</div>
                    <div className="calc-lbl">Fat</div>
                  </div>
                </div>
                <button className="apply-btn" onClick={applyCalcGoals}>Apply These Goals</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
