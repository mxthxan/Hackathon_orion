import type { Language, ChatMessage } from '../types';

/**
 * OpenAI Service with Fallback Support
 * 
 * TODO: Production Configuration:
 * 
 * 1. API Provider Fallbacks:
 *    - Primary: OpenAI GPT-4 (requires credits/subscription)
 *    - Fallback 1: Hugging Face Inference API (free tier available)
 *    - Fallback 2: Local Ollama instance (fully offline)
 *    - Fallback 3: Custom backend with multiple model support
 * 
 * 2. Environment Variables:
 *    - VITE_OPENAI_API_KEY: OpenAI API key (optional)
 *    - VITE_HUGGINGFACE_API_KEY: HF API key (optional)
 *    - VITE_LOCAL_OLLAMA_URL: Local Ollama endpoint (optional)
 *    - VITE_BACKEND_BASE_URL: Custom backend URL
 * 
 * 3. Rate Limiting and Costs:
 *    - OpenAI: Pay per token, rate limits apply
 *    - Hugging Face: Free tier with limits, paid tiers available
 *    - Ollama: Free but requires local setup and GPU/CPU resources
 *    - Custom: Depends on implementation
 * 
 * 4. Model Selection:
 *    - Vision: GPT-4V (OpenAI) or BLIP-2 (HF) or LLaVA (Ollama)
 *    - Chat: GPT-4 (OpenAI) or Llama-2 (HF/Ollama) or Mistral (HF/Ollama)
 *    - Code: GPT-4 (OpenAI) or CodeLlama (HF/Ollama)
 */
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private apiKey: string;
  private huggingFaceKey: string;
  private ollamaUrl: string;
  private backendUrl: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.huggingFaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    this.ollamaUrl = import.meta.env.VITE_LOCAL_OLLAMA_URL || 'http://localhost:11434';
    this.backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Falling back to alternative providers.');
      console.log('Available fallbacks: Hugging Face, Ollama, Custom Backend');
    }
  }

  private async tryOpenAI(messages: OpenAIMessage[], model: string = 'gpt-4'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not available');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response generated.';
  }

  private async tryHuggingFace(prompt: string): Promise<string> {
    console.log('TODO: Implement Hugging Face Inference API fallback');
    console.log('- Use HF Inference API with models like Llama-2 or Mistral');
    console.log('- Handle rate limiting and model loading delays');
    console.log('- Implement proper prompt formatting for different models');
    
    if (!this.huggingFaceKey) {
      throw new Error('Hugging Face API key not available');
    }

    // TODO: Implement actual HF API call
    throw new Error('Hugging Face fallback not implemented yet');
  }

  private async tryOllama(prompt: string): Promise<string> {
    console.log('TODO: Implement Ollama local inference fallback');
    console.log('- Connect to local Ollama instance');
    console.log('- Use models like Llama-2, Mistral, or CodeLlama');
    console.log('- Handle model loading and inference timeouts');
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama2', // TODO: Make configurable
          prompt,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        throw new Error('Ollama not available');
      }
    } catch (error) {
      throw new Error('Local Ollama instance not available');
    }
  }

  private async tryBackend(messages: OpenAIMessage[]): Promise<string> {
    console.log('TODO: Implement custom backend fallback');
    console.log('- Send request to custom inference backend');
    console.log('- Handle multiple model providers in backend');
    console.log('- Implement proper error handling and retries');
    
    try {
      const response = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      throw new Error('Custom backend not available');
    }
  }
  private getSystemPrompt(language: Language): string {
    const prompts = {
      en: 'You are Orion, a helpful AI assistant designed specifically for blind and visually impaired users. Provide clear, concise, and helpful responses. Always be respectful and patient.',
      hi: 'आप ओरियन हैं, एक सहायक AI सहायक जो विशेष रूप से अंधे और दृष्टिबाधित उपयोगकर्ताओं के लिए डिज़ाइन किया गया है। स्पष्ट, संक्षिप्त और सहायक उत्तर प्रदान करें।',
      ta: 'நீங்கள் ஓரியன், குருடு மற்றும் பார்வையற்ற பயனர்களுக்காக வடிவமைக்கப்பட்ட ஒரு உதவிகரமான AI உதவியாளர். தெளிவான, சுருக்கமான மற்றும் உதவிகரமான பதில்களை வழங்கவும்.',
      te: 'మీరు ఓరియన్, అంధులు మరియు దృష్టిలేని వినియోగదారుల కోసం ప్రత్యేకంగా రూపొందించబడిన సహాయక AI సహాయకుడు. స్పష్టమైన, సంక్షిప్త మరియు సహాయకరమైన ప్రతిస్పందనలను అందించండి.',
      kn: 'ನೀವು ಓರಿಯನ್, ಅಂಧರು ಮತ್ತು ದೃಷ್ಟಿಹೀನ ಬಳಕೆದಾರರಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಸಹಾಯಕ AI ಸಹಾಯಕ. ಸ್ಪಷ್ಟ, ಸಂಕ್ಷಿಪ್ತ ಮತ್ತು ಸಹಾಯಕ ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಒದಗಿಸಿ.',
      bn: 'আপনি ওরিয়ন, অন্ধ এবং দৃষ্টিপ্রতিবন্ধী ব্যবহারকারীদের জন্য বিশেষভাবে ডিজাইন করা একটি সহায়ক AI সহায়ক। স্পষ্ট, সংক্ষিপ্ত এবং সহায়ক প্রতিক্রিয়া প্রদান করুন।'
    };
    
    return prompts[language] || prompts.en;
  }

  async chat(messages: ChatMessage[], language: Language): Promise<string> {
    try {
      const openAIMessages: OpenAIMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(language)
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      // Try providers in order of preference
      try {
        return await this.tryOpenAI(openAIMessages);
      } catch (openAIError) {
        console.log('OpenAI failed, trying Hugging Face...');
        try {
          const prompt = openAIMessages.map(m => `${m.role}: ${m.content}`).join('\n');
          return await this.tryHuggingFace(prompt);
        } catch (hfError) {
          console.log('Hugging Face failed, trying Ollama...');
          try {
            const prompt = openAIMessages.map(m => `${m.role}: ${m.content}`).join('\n');
            return await this.tryOllama(prompt);
          } catch (ollamaError) {
            console.log('Ollama failed, trying custom backend...');
            return await this.tryBackend(openAIMessages);
          }
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async analyzeCode(code: string, language: Language): Promise<string> {
    const prompt = `Analyze this Python code and provide helpful feedback, suggestions for improvement, and explain what it does. Respond in ${language === 'en' ? 'English' : 'the user\'s selected language'}:\n\n${code}`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful coding tutor. Provide clear, educational feedback on code.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });
      // TODO: Implement fallback chain for code analysis
      return await this.tryOpenAI([
        { role: 'system', content: 'You are a helpful coding tutor. Provide clear, educational feedback on code.' },
        { role: 'user', content: prompt }
      ], 'gpt-4');
    } catch (error) {
      console.error('Code analysis error:', error);
      // Return helpful fallback response
      return 'Code analysis temporarily unavailable. Please check your API configuration or try again later.';
    }
  }

  async summarizeText(text: string, language: Language): Promise<string> {
    const prompt = `Summarize the following text in a clear and concise manner. Respond in ${language === 'en' ? 'English' : 'the user\'s selected language'}:\n\n${text}`;

    try {
      // TODO: Implement fallback chain for text summarization
      return await this.tryOpenAI([
        { role: 'system', content: 'You are a helpful assistant that creates clear, concise summaries.' },
        { role: 'user', content: prompt }
      ], 'gpt-4');
    } catch (error) {
      console.error('Summarization error:', error);
      // Return helpful fallback response
      return 'Text summarization temporarily unavailable. Please check your API configuration or try again later.';
    }
  }

  async describeImage(imageFile: File, language: Language): Promise<string> {
    try {
      if (!this.apiKey) {
        // TODO: Implement fallback image description
        console.log('TODO: Implement fallback image description service');
        console.log('- Use Hugging Face BLIP-2 or similar vision model');
        console.log('- Implement local vision model with Ollama + LLaVA');
        console.log('- Send to custom backend with multiple vision models');
        throw new Error('Image description requires OpenAI API key');
      }

      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `Describe this image in detail for a blind or visually impaired person. Include important visual elements, text content, colors, layout, and any other relevant information. Respond in ${language === 'en' ? 'English' : 'the user\'s selected language'}.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI Vision API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Could not describe the image.';
    } catch (error) {
      console.error('Image description error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey || this.huggingFaceKey || this.ollamaUrl || this.backendUrl);
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const openAIService = new OpenAIService();