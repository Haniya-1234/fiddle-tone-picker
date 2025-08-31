# Fiddle Tone Picker - Text Tool

A professional text tone adjustment application powered by Mistral AI, built with React, Express, and modern web technologies.

## 🚀 Features

- **Text Editor**: Clean, resizable text area for input
- **3×3 Tone Matrix**: Adjust formality (Casual → Formal) and emotion (Friendly → Polite)
- **AI-Powered Rewriting**: Uses Mistral AI (mistral-small) to rewrite text while preserving meaning
- **🎯 Tone Detection + Auto-Suggestion**: Analyze original text tone and get AI-powered suggestions
- **Undo/Redo System**: Navigate through tone changes with full history
- **Reset Functionality**: Return to original text
- **Local Storage**: Persist text and history across sessions
- **Responsive Design**: Clean, modern UI built with Tailwind CSS and shadcn/ui
- **Error Handling**: Comprehensive error handling for API failures
- **Loading States**: Visual feedback during AI processing
- **Caching**: Backend caching for improved performance

## 🎯 **New: Tone Detection + Auto-Suggestion**

### **What It Does:**
- **Analyzes** your original text to detect its current tone
- **Suggests** 3 alternative tones that would work well for your content
- **Explains** why each suggestion would be effective
- **One-click application** of suggested tones

### **How It Helps:**
- **For beginners**: Don't know what tone to choose? Get AI suggestions!
- **For professionals**: Understand your current tone and explore alternatives
- **For optimization**: Find the perfect tone for your audience and context

### **Example Workflow:**
1. **Enter text** in the editor
2. **Click "Analyze Current Tone"** 
3. **See results**: "Your text sounds Formal + Polite"
4. **Get suggestions**: "Try Casual + Friendly for a more approachable feel"
5. **Click any suggestion** to automatically apply that tone

## 🏗️ Architecture

### Frontend (React + Vite)
- **State Management**: Custom `useReducer` hook for complex state logic
- **Undo/Redo**: Implements past/present/future stack pattern
- **Components**: Modular React components with Tailwind CSS styling
- **Local Storage**: Custom hook for data persistence
- **Error Boundaries**: Graceful error handling and user feedback

### Backend (Node.js + Express)
- **API Proxy**: Lightweight proxy to Mistral AI API
- **Tone Detection**: `/api/detect-tone` endpoint for analyzing text
- **Tone Adjustment**: `/api/tone` endpoint for rewriting text
- **Caching**: In-memory caching with configurable TTL
- **Error Handling**: Comprehensive error handling for various failure scenarios
- **Security**: Environment variable management for API keys
- **Health Checks**: Built-in health monitoring endpoint

### State Management Pattern
```
State Structure:
{
  past: [text1, text2, ...],      // Previous text versions
  present: "current text",         // Current text
  future: [text3, text4, ...],    // Redo stack
  loading: boolean,                // API call status
  error: string | null,           // Error messages
  lastTone: {formality, emotion}  // Last applied tone
}
```

**Undo/Redo Logic:**
- **Undo**: Moves current text to future, pops from past
- **Redo**: Moves current text to past, pops from future
- **Tone Change**: Clears future stack, adds current to past
- **Text Edit**: Clears future stack, adds current to past

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Axios** - HTTP client for API calls
- **node-cache** - In-memory caching
- **CORS** - Cross-origin resource sharing

### AI Integration
- **Mistral AI** - Large language model API
- **Prompt Engineering** - Structured prompts for consistent results
- **Response Caching** - Reduce API calls and improve performance
- **Tone Analysis** - AI-powered text tone detection

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mistral AI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fiddle-tone-picker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   **Backend** (create `backend/.env`):
   ```bash
   MISTRAL_API_KEY=your_actual_mistral_api_key
   PORT=5000
   ```
   
   **Frontend** (create `frontend/.env`):
   ```bash
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## 🔧 Development

### Available Scripts

```bash
# Root level
npm run dev          # Start both frontend and backend
npm run server       # Start only backend
npm run client       # Start only frontend
npm run build        # Build frontend for production
npm run install-all  # Install all dependencies

# Backend
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Project Structure
```
fiddle-tone-picker/
├── backend/                 # Express server
│   ├── server.js           # Main server file with tone detection
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment template
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ToneDetection.jsx  # New tone detection component
│   │   │   ├── TonePicker.jsx     # Manual tone picker
│   │   │   └── TextEditor.jsx     # Text input component
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── env.example         # Environment template
├── package.json            # Root package.json
└── README.md               # This file
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Deploy automatically on push to main branch

### Backend (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables (MISTRAL_API_KEY)

### Environment Variables for Production
- **Backend**: Set `MISTRAL_API_KEY` and `PORT` in Render dashboard
- **Frontend**: Update `VITE_API_BASE_URL` to your backend URL

## 🔒 Security Considerations

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for local development
- **CORS**: Configure CORS appropriately for production
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Input Validation**: Backend validates all input parameters

## 🧪 Testing

### Manual Testing
1. **Text Input**: Enter text in the editor
2. **Tone Detection**: Click "Analyze Current Tone" to get suggestions
3. **Auto-Suggestions**: Click any suggested tone to apply it
4. **Manual Tone Picker**: Use the 3×3 matrix for manual selection
5. **Undo/Redo**: Test navigation through history
6. **Error Handling**: Test with invalid API responses
7. **Responsiveness**: Test on different screen sizes

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Tone detection
curl -X POST http://localhost:5000/api/detect-tone \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello! I would like to request a meeting."}'

# Tone adjustment
curl -X POST http://localhost:5000/api/tone \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","formality":"Casual","emotion":"Friendly"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if `MISTRAL_API_KEY` is set in `.env`
   - Ensure port 5000 is available
   - Check Node.js version (18+ required)

2. **Frontend can't connect to backend**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Ensure proxy settings in `vite.config.js`

3. **Mistral API errors**
   - Verify API key is valid
   - Check API rate limits
   - Ensure text input is not empty

4. **Tone detection not working**
   - Check if text is entered in the editor
   - Verify backend `/api/detect-tone` endpoint is working
   - Check browser console for errors

5. **Build errors**
   - Clear `node_modules` and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables are set

## 📈 Performance Optimizations

- **Caching**: Backend caches both tone detection and adjustment responses for 5 minutes
- **Debouncing**: Frontend debounces text input changes
- **Lazy Loading**: Components load only when needed
- **Optimized Bundles**: Vite provides efficient builds
- **Local Storage**: Reduces unnecessary API calls

## 🔮 Future Enhancements

- **User Accounts**: Save and share tone adjustments
- **Tone Presets**: Custom tone combinations
- **Batch Processing**: Process multiple texts at once
- **Export Options**: Export in various formats
- **Advanced Analytics**: Track tone usage patterns
- **Multi-language Support**: Support for different languages
- **Tone Templates**: Pre-built tone profiles for common use cases
- **Collaborative Editing**: Share and collaborate on tone adjustments

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the Mistral AI documentation

---

**Built with ❤️ for Fiddle Engineering Intern Take-Home Test**

**✨ New Feature: Tone Detection + Auto-Suggestion helps users choose the perfect tone!**
