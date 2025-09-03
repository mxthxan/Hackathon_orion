import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '../types';

// Types and Interfaces
interface WakeWordMessage {
  type: 'AUDIO_CHUNK' | 'SET_LANGUAGE' | 'SET_SENSITIVITY' | 'START' | 'STOP';
  data?: any;
  timestamp?: number;
}

interface WakeWordResponse {
  type: 'DETECTION' | 'STATUS' | 'ERROR';
  confidence?: number;
  detected?: boolean;
  message?: string;
  timestamp: number;
}

interface WakeWordConfig {
  sensitivity: number;
  useLocalProcessing: boolean;
  webSocketUrl?: string;
  wakeWords: string[];
  enableVAD: boolean;
  bufferDuration: number;
}

interface UseWakeWordReturn {
  isActive: boolean;
  isDetected: boolean;
  confidence: number;
  lastDetectionTime: number | null;
  batteryImpact: 'low' | 'medium' | 'high';
  startWakeWorker: () => Promise<boolean>;
  stopWakeWorker: () => void;
  setLanguage: (language: Language) => void;
  setSensitivity: (sensitivity: number) => void;
  getStatus: () => string;
}

// WebSocket Service Class
class WakeWordService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(
    private url: string = 'ws://localhost:8080/wake-word-stream',
    private onMessage?: (response: WakeWordResponse) => void,
    private onStatusChange?: (status: string) => void
  ) {}

  async connect(): Promise<boolean> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return true;
    }

    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to wake word service');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onStatusChange?.('Connected to wake word service');
      };

      this.ws.onmessage = (event) => {
        try {
          const response: WakeWordResponse = JSON.parse(event.data);
          this.onMessage?.(response);
        } catch (error) {
          console.error('Failed to parse wake word response:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected from wake word service');
        this.isConnecting = false;
        this.handleReconnection();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.onStatusChange?.('Connection error');
      };

      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve(true);
          } else if (this.ws?.readyState === WebSocket.CLOSED) {
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    } catch (error) {
      console.error('Failed to connect to wake word service:', error);
      this.isConnecting = false;
      return false;
    }
  }

  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onStatusChange?.('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.onStatusChange?.(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  sendMessage(message: WakeWordMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    } else {
      console.warn('WebSocket not connected, message not sent:', message.type);
    }
  }

  sendAudioChunk(audioData: Float32Array) {
    const buffer = new ArrayBuffer(audioData.length * 4);
    const view = new Float32Array(buffer);
    view.set(audioData);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    this.sendMessage({
      type: 'AUDIO_CHUNK',
      data: base64
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
}

// Audio Processor Class
class WakeWordAudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private circularBuffer: Float32Array;
  private bufferIndex = 0;
  private isListening = false;
  private wakeWordThreshold = 0.7;
  private language = 'en';
  private onMessage?: (data: any) => void;
  private sampleRate = 16000;
  private bufferSize = 4096;

  constructor() {
    this.circularBuffer = new Float32Array(this.sampleRate * 2); // 2 second buffer
  }

  async initialize(): Promise<boolean> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });

      // Create script processor (fallback for older browsers)
      this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
      
      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isListening) return;

        const inputBuffer = event.inputBuffer.getChannelData(0);
        this.processAudioBuffer(inputBuffer);
      };

      // Connect audio pipeline
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      return true;
    } catch (error) {
      console.error('Failed to initialize audio processor:', error);
      return false;
    }
  }

  private processAudioBuffer(inputBuffer: Float32Array) {
    // Add to circular buffer
    for (let i = 0; i < inputBuffer.length; i++) {
      this.circularBuffer[this.bufferIndex] = inputBuffer[i];
      this.bufferIndex = (this.bufferIndex + 1) % this.circularBuffer.length;
    }

    // Voice Activity Detection
    if (this.hasVoiceActivity(inputBuffer)) {
      const audioChunk = this.getAudioChunk();
      this.processWakeWord(audioChunk);
    }
  }

  private hasVoiceActivity(audioData: Float32Array): boolean {
    const energy = audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length;
    return energy > 0.001; // Adjust threshold as needed
  }

  private getAudioChunk(): Float32Array {
    const chunkSize = this.sampleRate; // 1 second chunk
    const chunk = new Float32Array(chunkSize);
    
    for (let i = 0; i < chunkSize; i++) {
      const index = (this.bufferIndex - chunkSize + i + this.circularBuffer.length) % this.circularBuffer.length;
      chunk[i] = this.circularBuffer[index];
    }
    
    return chunk;
  }

  private processWakeWord(audioChunk: Float32Array) {
    // Simple energy-based detection (replace with actual ML model)
    const energy = audioChunk.reduce((sum, sample) => sum + Math.abs(sample), 0) / audioChunk.length;
    const spectralCentroid = this.calculateSpectralCentroid(audioChunk);
    
    // Mock confidence calculation based on audio features
    const mockConfidence = Math.min(0.99, (energy * 50 + spectralCentroid * 0.1) * Math.random());
    
    if (mockConfidence > this.wakeWordThreshold) {
      this.onMessage?.({
        type: 'WAKE_WORD_DETECTED',
        confidence: mockConfidence,
        timestamp: Date.now()
      });
    }
  }

  private calculateSpectralCentroid(audioData: Float32Array): number {
    // Simple spectral centroid calculation
    const fftSize = 1024;
    const fft = new Float32Array(fftSize);
    const windowSize = Math.min(audioData.length, fftSize);
    
    // Apply window and copy data
    for (let i = 0; i < windowSize; i++) {
      fft[i] = audioData[i] * 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowSize - 1))); // Hanning window
    }
    
    // Simplified spectral centroid
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 1; i < windowSize / 2; i++) {
      const magnitude = Math.abs(fft[i]);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  setOnMessage(callback: (data: any) => void) {
    this.onMessage = callback;
  }

  startDetection() {
    this.isListening = true;
    this.onMessage?.({ type: 'STATUS', message: 'Detection started' });
  }

  stopDetection() {
    this.isListening = false;
    this.onMessage?.({ type: 'STATUS', message: 'Detection stopped' });
  }

  setLanguage(language: string) {
    this.language = language;
    // TODO: Load language-specific model
  }

  setSensitivity(sensitivity: number) {
    this.wakeWordThreshold = sensitivity;
  }

  cleanup() {
    this.stopDetection();
    
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}

// Constants
const DEFAULT_CONFIG: WakeWordConfig = {
  sensitivity: 0.7,
  useLocalProcessing: true,
  wakeWords: ['orion', 'hey orion'],
  enableVAD: true,
  bufferDuration: 2000, // 2 seconds
};

// Main Hook
export const useWakeWord = (
  onWakeWordDetected?: (confidence: number) => void,
  onStatusChange?: (status: string) => void,
  config: Partial<WakeWordConfig> = {}
): UseWakeWordReturn => {
  const [isActive, setIsActive] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<number | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [status, setStatus] = useState('Idle');
  const [batteryImpact, setBatteryImpact] = useState<'low' | 'medium' | 'high'>('low');

  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const audioProcessorRef = useRef<WakeWordAudioProcessor | null>(null);
  const wakeWordServiceRef = useRef<WakeWordService | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batteryMonitorRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio processor
  const initializeAudioProcessor = useCallback(async (): Promise<boolean> => {
    try {
      audioProcessorRef.current = new WakeWordAudioProcessor();
      
      audioProcessorRef.current.setOnMessage((data) => {
        const { type, confidence: detectionConfidence, message } = data;

        switch (type) {
          case 'WAKE_WORD_DETECTED':
            handleWakeWordDetection(detectionConfidence);
            break;
          case 'STATUS':
            updateStatus(message);
            break;
        }
      });

      const success = await audioProcessorRef.current.initialize();
      if (success) {
        updateStatus('Audio processor initialized');
      }
      return success;
    } catch (error) {
      console.error('Failed to initialize audio processor:', error);
      updateStatus(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  // Initialize WebSocket service
  const initializeWebSocketService = useCallback(() => {
    if (!fullConfig.webSocketUrl) return;

    wakeWordServiceRef.current = new WakeWordService(
      fullConfig.webSocketUrl,
      (response) => {
        switch (response.type) {
          case 'DETECTION':
            if (response.detected && response.confidence) {
              handleWakeWordDetection(response.confidence);
            }
            break;
          case 'STATUS':
            updateStatus(response.message || 'Status update');
            break;
          case 'ERROR':
            updateStatus(`Error: ${response.message}`);
            break;
        }
      },
      updateStatus
    );
  }, [fullConfig.webSocketUrl]);

  // Handle wake word detection
  const handleWakeWordDetection = useCallback((detectionConfidence: number) => {
    setIsDetected(true);
    setConfidence(detectionConfidence);
    setLastDetectionTime(Date.now());
    
    onWakeWordDetected?.(detectionConfidence);
    updateStatus(`Wake word detected (confidence: ${(detectionConfidence * 100).toFixed(1)}%)`);

    // Clear detection state after 3 seconds
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
    
    detectionTimeoutRef.current = setTimeout(() => {
      setIsDetected(false);
      setConfidence(0);
    }, 3000);
  }, [onWakeWordDetected]);

  // Update status with callback
  const updateStatus = useCallback((newStatus: string) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Monitor battery impact
  const monitorBatteryImpact = useCallback(() => {
    if (!('getBattery' in navigator)) {
      setBatteryImpact('medium'); // Assume medium if we can't check
      return;
    }

    (navigator as any).getBattery().then((battery: any) => {
      const updateBatteryImpact = () => {
        if (battery.charging) {
          setBatteryImpact('low');
        } else if (battery.level < 0.2) {
          setBatteryImpact('high');
        } else if (battery.level < 0.5) {
          setBatteryImpact('medium');
        } else {
          setBatteryImpact('low');
        }
      };

      updateBatteryImpact();
      battery.addEventListener('chargingchange', updateBatteryImpact);
      battery.addEventListener('levelchange', updateBatteryImpact);

      batteryMonitorRef.current = setInterval(updateBatteryImpact, 30000);
    }).catch(() => {
      setBatteryImpact('medium');
    });
  }, []);

  // Start wake word detection
  const startWakeWorker = useCallback(async (): Promise<boolean> => {
    if (isActive) {
      return true;
    }

    updateStatus('Starting wake word detection...');

    try {
      let success = false;

      if (fullConfig.useLocalProcessing) {
        success = await initializeAudioProcessor();
        
        if (success && audioProcessorRef.current) {
          audioProcessorRef.current.startDetection();
        }
      } else {
        initializeWebSocketService();
        if (wakeWordServiceRef.current) {
          success = await wakeWordServiceRef.current.connect();
          if (success) {
            wakeWordServiceRef.current.sendMessage({ type: 'START' });
          }
        }
      }

      if (success) {
        setIsActive(true);
        monitorBatteryImpact();
        updateStatus(`Wake word detection started (${fullConfig.useLocalProcessing ? 'local' : 'remote'})`);
      } else {
        updateStatus('Failed to start wake word detection');
      }

      return success;
    } catch (error) {
      console.error('Error starting wake word detection:', error);
      updateStatus(`Start failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [isActive, fullConfig.useLocalProcessing, initializeAudioProcessor, initializeWebSocketService, monitorBatteryImpact, updateStatus]);

  // Stop wake word detection
  const stopWakeWorker = useCallback(() => {
    updateStatus('Stopping wake word detection...');

    setIsActive(false);
    setIsDetected(false);
    setConfidence(0);

    // Clear timeouts
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }

    if (batteryMonitorRef.current) {
      clearInterval(batteryMonitorRef.current);
      batteryMonitorRef.current = null;
