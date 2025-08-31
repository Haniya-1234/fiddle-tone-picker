import React, { useReducer, useEffect, useCallback } from 'react'
import { Undo2, Redo2, RotateCcw, Loader2, Sparkles, Zap, Palette, Search } from 'lucide-react'
import { cn } from './lib/utils'
import TonePicker from './components/TonePicker'
import ToneDetection from './components/ToneDetection'
import TextEditor from './components/TextEditor'
import { toneReducer, initialState } from './hooks/useToneReducer'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [state, dispatch] = useReducer(toneReducer, initialState)
  const [savedText, setSavedText] = useLocalStorage('tone-picker-text', '')
  const [savedHistory, setSavedHistory] = useLocalStorage('tone-picker-history', [])

  // Load saved text and history on mount only
  useEffect(() => {
    if (savedText && !state.present) {
      dispatch({ type: 'SET_TEXT', payload: savedText })
    }
    if (savedHistory.length > 0 && state.past.length === 0 && state.future.length === 0) {
      dispatch({ type: 'LOAD_HISTORY', payload: savedHistory })
    }
  }, []) // Empty dependency array - only run on mount

  // Save text and history when they change, but prevent infinite loops
  const saveToStorage = useCallback(() => {
    if (state.present !== savedText) {
      setSavedText(state.present)
    }
    
    const currentHistory = [...state.past, state.present, ...state.future]
    if (JSON.stringify(currentHistory) !== JSON.stringify(savedHistory)) {
      setSavedHistory(currentHistory)
    }
  }, [state.present, state.past, state.future, savedText, savedHistory, setSavedText, setSavedHistory])

  useEffect(() => {
    saveToStorage()
  }, [saveToStorage])

  const handleToneChange = useCallback(async (formality, emotion) => {
    if (!state.present.trim()) return

    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const response = await fetch('/api/tone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: state.present,
          formality,
          emotion,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      dispatch({ 
        type: 'APPLY_TONE_CHANGE', 
        payload: { 
          newText: data.rewrittenText, 
          formality, 
          emotion 
        } 
      })
    } catch (error) {
      console.error('Error changing tone:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to change tone. Please try again.' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.present])

  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <header className="text-center mb-12 slide-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">
              Fiddle Tone Picker
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your text with AI-powered tone adjustment. 
            <span className="font-semibold text-blue-600"> Professional, casual, friendly, or formal </span> 
            - all with a single click!
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-white/20">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-white/20">
              <Palette className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">9 Tone Options</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-white/20">
              <Undo2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Undo/Redo</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-white/20">
              <Search className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Smart Detection</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Text Editor */}
          <div className="space-y-6 bounce-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Text Editor
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => dispatch({ type: 'UNDO' })}
                  disabled={!canUndo || state.loading}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300 transform hover:scale-105",
                    "shadow-lg hover:shadow-xl",
                    canUndo && !state.loading
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  title="Undo"
                >
                  <Undo2 size={20} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'REDO' })}
                  disabled={!canRedo || state.loading}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300 transform hover:scale-105",
                    "shadow-lg hover:shadow-xl",
                    canRedo && !state.loading
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  title="Redo"
                >
                  <Redo2 size={20} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'RESET' })}
                  disabled={state.loading}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300 transform hover:scale-105",
                    "shadow-lg hover:shadow-xl",
                    !state.loading
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
            
            <div className="glass-effect rounded-2xl p-1 shadow-2xl">
              <TextEditor
                value={state.present}
                onChange={(text) => dispatch({ type: 'SET_TEXT', payload: text })}
                disabled={state.loading}
              />
            </div>

            {/* Enhanced Error Display */}
            {state.error && (
              <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg slide-in">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-700 font-medium">{state.error}</p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 hover:underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Tone Tools */}
          <div className="space-y-6 bounce-in" style={{ animationDelay: '0.2s' }}>
            {/* Tone Detection Section */}
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <ToneDetection
                text={state.present}
                onToneSelect={handleToneChange}
                disabled={state.loading}
              />
            </div>

            {/* Manual Tone Picker Section */}
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                Manual Tone Picker
              </h2>
              
              <TonePicker
                onToneChange={handleToneChange}
                disabled={state.loading || !state.present.trim()}
              />
            </div>

            {/* Enhanced Loading State */}
            {state.loading && (
              <div className="glass-effect rounded-2xl p-8 shadow-2xl text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-700">Adjusting tone...</p>
                    <p className="text-sm text-gray-500">AI is rewriting your text with the selected tone</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced History Info */}
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full"></div>
                History & Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{state.past.length}</div>
                  <div className="text-sm text-gray-600">Past Changes</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{state.future.length}</div>
                  <div className="text-sm text-gray-600">Future Changes</div>
                </div>
              </div>
              {state.lastTone && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Last tone:</span> {state.lastTone.formality} + {state.lastTone.emotion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200/50">
          <p className="text-gray-500">
            Powered by <span className="font-semibold text-blue-600">Mistral AI</span> • 
            Built with <span className="font-semibold text-purple-600">React</span> & <span className="font-semibold text-indigo-600">Tailwind CSS</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
