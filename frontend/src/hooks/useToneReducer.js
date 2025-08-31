// Action types
export const ACTIONS = {
  SET_TEXT: 'SET_TEXT',
  APPLY_TONE_CHANGE: 'APPLY_TONE_CHANGE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  RESET: 'RESET',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_HISTORY: 'LOAD_HISTORY'
}

// Initial state
export const initialState = {
  past: [],
  present: 'Hello! I would like to request a meeting to discuss our upcoming project collaboration. Please let me know when you might be available.',
  future: [],
  loading: false,
  error: null,
  lastTone: null
}

// Reducer function
export function toneReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TEXT:
      return {
        ...state,
        past: [...state.past, state.present],
        present: action.payload,
        future: [],
        error: null
      }

    case ACTIONS.APPLY_TONE_CHANGE:
      return {
        ...state,
        past: [...state.past, state.present],
        present: action.payload.newText,
        future: [],
        lastTone: {
          formality: action.payload.formality,
          emotion: action.payload.emotion
        },
        error: null
      }

    case ACTIONS.UNDO:
      if (state.past.length === 0) return state
      
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, state.past.length - 1)
      
      return {
        ...state,
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
        error: null
      }

    case ACTIONS.REDO:
      if (state.future.length === 0) return state
      
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      
      return {
        ...state,
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
        error: null
      }

    case ACTIONS.RESET:
      // Reset to the very first text (if available) or clear
      const firstText = state.past.length > 0 ? state.past[0] : ''
      return {
        ...state,
        past: [],
        present: firstText,
        future: [],
        lastTone: null,
        error: null
      }

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    case ACTIONS.LOAD_HISTORY:
      if (action.payload.length === 0) return state
      
      const middleIndex = Math.floor(action.payload.length / 2)
      return {
        ...state,
        past: action.payload.slice(0, middleIndex),
        present: action.payload[middleIndex] || '',
        future: action.payload.slice(middleIndex + 1),
        error: null
      }

    default:
      return state
  }
}
