import React from 'react'
import { cn } from '../lib/utils'

const TextEditor = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your text here to adjust the tone..."
        className={cn(
          "w-full min-h-[300px] p-6 rounded-2xl resize-y",
          "focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2",
          "placeholder:text-gray-400/70 placeholder:font-medium",
          "font-mono text-base leading-relaxed",
          "border-0 shadow-inner",
          "transition-all duration-300",
          disabled
            ? "bg-gray-100/50 text-gray-400 cursor-not-allowed"
            : "bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white/90 focus:bg-white"
        )}
        style={{ 
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
        }}
      />
      
      {/* Enhanced Stats Display */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Characters: <span className="font-bold text-blue-600">{value.length}</span>
            </span>
          </div>
          <div className="w-px h-6 bg-blue-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Words: <span className="font-bold text-purple-600">{value.trim() ? value.trim().split(/\s+/).length : 0}</span>
            </span>
          </div>
        </div>
        
        {/* Text Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            value.length === 0 ? "bg-gray-300" : 
            value.length < 50 ? "bg-yellow-400" : 
            value.length < 200 ? "bg-green-400" : "bg-blue-400"
          )}></div>
          <span className="text-xs text-gray-500 font-medium">
            {value.length === 0 ? "Empty" : 
             value.length < 50 ? "Short" : 
             value.length < 200 ? "Medium" : "Long"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TextEditor
