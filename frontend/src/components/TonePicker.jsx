import React from 'react'
import { cn } from '../lib/utils'

const TonePicker = ({ onToneChange, disabled }) => {
  const formalityLevels = ['Casual', 'Neutral', 'Formal']
  const emotionLevels = ['Friendly', 'Neutral', 'Polite']

  const handleToneClick = (formality, emotion) => {
    if (!disabled) {
      onToneChange(formality, emotion)
    }
  }

  const getToneColor = (formality, emotion) => {
    if (formality === 'Neutral' && emotion === 'Neutral') {
      return 'from-gray-400 to-gray-500'
    }
    
    if (formality === 'Casual') {
      if (emotion === 'Friendly') return 'from-green-400 to-emerald-500'
      if (emotion === 'Neutral') return 'from-blue-400 to-cyan-500'
      if (emotion === 'Polite') return 'from-indigo-400 to-blue-500'
    }
    
    if (formality === 'Neutral') {
      if (emotion === 'Friendly') return 'from-yellow-400 to-orange-500'
      if (emotion === 'Polite') return 'from-purple-400 to-pink-500'
    }
    
    if (formality === 'Formal') {
      if (emotion === 'Friendly') return 'from-teal-400 to-green-500'
      if (emotion === 'Neutral') return 'from-slate-400 to-gray-500'
      if (emotion === 'Polite') return 'from-red-400 to-pink-500'
    }
    
    return 'from-gray-400 to-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Formality Labels */}
      <div className="flex justify-between text-sm font-medium">
        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full">Casual</span>
        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full">Neutral</span>
        <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-full">Formal</span>
      </div>

      {/* Enhanced 3x3 Tone Matrix */}
      <div className="grid grid-cols-3 gap-3">
        {emotionLevels.map((emotion, emotionIndex) => (
          <div key={emotion} className="grid grid-cols-3 gap-3">
            {formalityLevels.map((formality, formalityIndex) => {
              const isCenter = formalityIndex === 1 && emotionIndex === 1
              const toneColor = getToneColor(formality, emotion)
              
              return (
                <button
                  key={`${formality}-${emotion}`}
                  onClick={() => handleToneClick(formality, emotion)}
                  disabled={disabled}
                  className={cn(
                    "aspect-square rounded-2xl transition-all duration-300 flex items-center justify-center text-xs font-bold",
                    "hover:scale-110 hover:shadow-2xl transform",
                    "focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2",
                    "border-2 border-white/20 shadow-lg",
                    disabled
                      ? "opacity-50 cursor-not-allowed bg-gray-200"
                      : `bg-gradient-to-br ${toneColor} hover:shadow-xl`,
                    isCenter && "ring-4 ring-yellow-300 ring-offset-2 shadow-2xl"
                  )}
                  title={`${formality} + ${emotion}`}
                >
                  <div className="text-center text-white drop-shadow-sm">
                    <div className="font-bold text-sm leading-tight">{formality}</div>
                    <div className="text-xs opacity-80 mt-1">+</div>
                    <div className="font-bold text-sm leading-tight">{emotion}</div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Enhanced Emotion Labels */}
      <div className="flex flex-col items-center space-y-3 text-sm font-medium">
        <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full">Friendly</span>
        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full">Neutral</span>
        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">Polite</span>
      </div>

      {/* Enhanced Instructions */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
          How to use the Tone Picker
        </h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-semibold">Formality:</span> Left to right (Casual → Formal)
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-semibold">Emotion:</span> Top to bottom (Friendly → Polite)
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-semibold">Click any tone combination</span> to rewrite your text
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-semibold">Use Undo/Redo</span> to navigate through changes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TonePicker
