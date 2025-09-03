import type { Language, ChatMessage } from '../types';

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
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file');
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
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

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

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: openAIMessages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async analyzeCode(code: string, language: Language): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

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

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Could not analyze the code.';
    } catch (error) {
      console.error('Code analysis error:', error);
      throw error;
    }
  }

  async summarizeText(text: string, language: Language): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Summarize the following text in a clear and concise manner. Respond in ${language === 'en' ? 'English' : 'the user\'s selected language'}:\n\n${text}`;

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
              content: 'You are a helpful assistant that creates clear, concise summaries.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Could not generate summary.';
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  }

  async describeImage(imageFile: File, language: Language): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
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