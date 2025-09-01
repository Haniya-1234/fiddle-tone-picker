import React, { useState } from 'react'
import { Search, Lightbulb, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

const ToneDetection = ({ text, onToneSelect, disabled }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [toneAnalysis, setToneAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const analyzeTone = async () => {
    if (disabled || !text || text.trim().length === 0) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/detect-tone`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setToneAnalysis(data)
    } catch (error) {
      console.error('Error detecting tone:', error)
      setError(error.message || 'Failed to detect tone. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSuggestionClick = (formality, emotion) => {
    onToneSelect(formality, emotion)
  }

  const getFormalityColor = (formality) => {
    switch (formality) {
      case 'Casual': return 'from-green-400 to-emerald-500'
      case 'Neutral': return 'from-blue-400 to-cyan-500'
      case 'Formal': return 'from-red-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'Friendly': return 'from-yellow-400 to-orange-500'
      case 'Neutral': return 'from-blue-400 to-cyan-500'
      case 'Polite': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const canAnalyze = text && text.trim().length > 0 && !disabled

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
          <Search className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Tone Detection & Suggestions</h3>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeTone}
        disabled={!canAnalyze || isAnalyzing}
        className={cn(
          "w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-105",
          "shadow-lg hover:shadow-xl font-semibold text-white",
          canAnalyze && !isAnalyzing
            ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            : "bg-gray-400 cursor-not-allowed",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        )}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing tone...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5" />
            <span>Analyze Current Tone</span>
          </div>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Tone Analysis Results */}
      {toneAnalysis && (
        <div className="space-y-6">
          {/* Current Tone */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Current Tone Analysis
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-white/50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Formality</div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-white text-sm font-bold",
                  `bg-gradient-to-r ${getFormalityColor(toneAnalysis.currentTone.formality)}`
                )}>
                  {toneAnalysis.currentTone.formality}
                </div>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Emotion</div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-white text-sm font-bold",
                  `bg-gradient-to-r ${getEmotionColor(toneAnalysis.currentTone.emotion)}`
                )}>
                  {toneAnalysis.currentTone.emotion}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {toneAnalysis.currentTone.description}
            </p>
          </div>

          {/* Tone Suggestions */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Suggested Alternative Tones
            </h4>
            
            <div className="space-y-4">
              {toneAnalysis.suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white/70 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion.formality, suggestion.emotion)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-white text-xs font-bold",
                        `bg-gradient-to-r ${getFormalityColor(suggestion.formality)}`
                      )}>
                        {suggestion.formality}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-white text-xs font-bold",
                        `bg-gradient-to-r ${getEmotionColor(suggestion.emotion)}`
                      )}>
                        {suggestion.emotion}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Click to apply
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {suggestion.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Apply Section */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
            <p className="text-sm text-gray-600 text-center">
              💡 <span className="font-semibold">Pro tip:</span> Click any suggestion above to automatically apply that tone to your text!
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!toneAnalysis && !isAnalyzing && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
          {!text || text.trim().length === 0 ? (
            <p className="text-sm text-gray-600 text-center">
              📝 <span className="font-semibold">Enter some text first</span> 
              <br />Then click "Analyze Current Tone" to get AI-powered suggestions!
            </p>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              🎯 <span className="font-semibold">Not sure what tone to choose?</span> 
              <br />Click "Analyze Current Tone" to get AI-powered suggestions!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ToneDetection
