#!/bin/bash

echo "🚀 Deploying Fiddle Tone Picker..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build complete!"
echo ""
echo "🌐 To deploy:"
echo "1. Frontend: Push to GitHub and connect to Vercel"
echo "2. Backend: Push to GitHub and connect to Render"
echo ""
echo "📝 Don't forget to:"
echo "- Set MISTRAL_API_KEY in Render environment variables"
echo "- Update vercel.json with your backend URL"
echo "- Configure CORS in backend for production domain"
