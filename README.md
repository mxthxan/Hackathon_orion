# Orion – Multimodal AI Assistant for the Blind

A production-ready React application designed specifically for blind and visually impaired users, featuring advanced accessibility, voice interaction, and AI-powered assistance.

## Features

### 🎯 Core Accessibility
- **Screen Reader Optimized**: Semantic HTML, ARIA labels, live regions
- **Keyboard Navigation**: Full keyboard support with visible focus rings
- **High Contrast**: Dark theme with WCAG AAA compliance
- **Voice Interface**: Web Speech API with wake word detection
- **Multi-language Support**: English, Hindi, Tamil, Telugu, Kannada, Bengali

### 🤖 AI Capabilities
- **Visual Understanding**: Image and PDF description using GPT-4 Vision
- **Coding Tutor**: Python code analysis and feedback
- **Document Summarizer**: Text and file summarization
- **Intelligent Chat**: Conversational AI with context awareness
- **Wake Word Detection**: Say "Orion" to activate voice commands

### 📧 Email Integration
- **Gmail Integration**: Read, compose, and send emails
- **Voice Email**: Dictate and listen to emails
- **Smart Replies**: AI-suggested responses
- **Unread Management**: Focus on important messages

### ☁️ Cloud Services
- **Google Drive**: File access and management
- **OneDrive**: Microsoft cloud integration
- **Dropbox**: File sharing and storage
- **Cross-platform**: Unified file access

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required API keys:
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Gmail API**: Set up at [Google Cloud Console](https://console.cloud.google.com/)
- **Cloud Storage APIs**: Configure OAuth apps for each service

### 2. Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create credentials (OAuth 2.0 Client ID)
5. Add your domain to authorized origins
6. Copy Client ID and API Key to `.env`

### 3. OpenAI API Setup

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Generate an API key
3. Add to `.env` as `VITE_OPENAI_API_KEY`

## Usage

### Voice Commands

- **"Orion"** - Wake word to activate voice input
- **Alt+M** - Manual voice input toggle
- **Ctrl+O** - Manual wake word activation
- **Escape** - Close modals and stop voice input

### Keyboard Navigation

- **Tab** - Navigate between elements
- **Space/Enter** - Activate buttons and controls
- **Arrow Keys** - Navigate within components
- **Escape** - Close modals and dialogs

### Features

1. **Visual Understanding**
   - Upload images or PDFs
   - Get detailed descriptions
   - Export to Braille format
   - Send descriptions to chat

2. **Coding Tutor**
   - Paste Python code
   - Get analysis and suggestions
   - Learn best practices
   - Add explanations to chat

3. **Document Summarizer**
   - Paste text or upload files
   - Get concise summaries
   - Export summaries
   - Continue discussion in chat

4. **Email Management**
   - Connect Gmail account
   - Read unread emails aloud
   - Compose and send emails
   - Voice-to-text composition

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### AI Services
- **OpenAI GPT-4** for chat and analysis
- **GPT-4 Vision** for image description
- **Web Speech API** for voice interaction
- **Speech Synthesis** for text-to-speech

### Accessibility Features
- **ARIA Live Regions** for status updates
- **Semantic HTML** with proper landmarks
- **Focus Management** with visible indicators
- **Screen Reader Support** with descriptive labels
- **Keyboard Shortcuts** for power users

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration Notes

The application is designed to work with real APIs:

- **OpenAI Integration**: Fully functional with your API key
- **Gmail API**: Complete OAuth flow and email management
- **Wake Word Detection**: Advanced speech recognition with confidence scoring
- **Braille Export**: Currently exports text files (hardware integration ready)
- **Cloud Storage**: OAuth flows prepared for Google Drive, OneDrive, Dropbox

## Accessibility Compliance

- **WCAG 2.1 AAA** compliance for color contrast
- **Section 508** compliance for government accessibility
- **Screen Reader Testing** with NVDA, JAWS, and VoiceOver
- **Keyboard Navigation** following WAI-ARIA best practices
- **Focus Management** with logical tab order

## Browser Support

- **Chrome/Edge**: Full feature support including wake word detection
- **Firefox**: Core features (limited speech recognition)
- **Safari**: Core features with iOS/macOS speech support
- **Mobile**: Responsive design with touch accessibility

## Security

- **API Key Protection**: Environment variables for sensitive data
- **OAuth Security**: Secure authentication flows
- **Content Security**: No inline scripts or unsafe content
- **Privacy First**: No data collection or tracking

## Contributing

This application prioritizes accessibility and user experience for blind and visually impaired users. When contributing:

1. Test with screen readers
2. Ensure keyboard navigation works
3. Maintain high contrast ratios
4. Add appropriate ARIA labels
5. Test voice features thoroughly

## License

MIT License - see LICENSE file for details.