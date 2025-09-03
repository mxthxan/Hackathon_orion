/**
 * Mock API Responses for Development
 * 
 * TODO: Replace these with actual API calls in production
 * These responses help with frontend development when backend is not available
 */

import type { CloudFile, Email } from '../types';

export const mockApiResponses = {
  // Cloud storage responses
  cloudFiles: {
    drive: [
      { id: 'drive_1', name: 'Annual Report 2024.pdf', mimeType: 'application/pdf' },
      { id: 'drive_2', name: 'Budget Analysis.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { id: 'drive_3', name: 'Team Presentation.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { id: 'drive_4', name: 'Meeting Notes', mimeType: 'application/vnd.google-apps.folder' }
    ] as CloudFile[],
    
    onedrive: [
      { id: 'od_1', name: 'Project Plan.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { id: 'od_2', name: 'Financial Data.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { id: 'od_3', name: 'Client Feedback.pdf', mimeType: 'application/pdf' },
      { id: 'od_4', name: 'Resources', mimeType: 'application/vnd.microsoft.folder' }
    ] as CloudFile[],
    
    dropbox: [
      { id: 'db_1', name: 'Research Paper.pdf', mimeType: 'application/pdf' },
      { id: 'db_2', name: 'Code Backup.zip', mimeType: 'application/zip' },
      { id: 'db_3', name: 'Screenshots', mimeType: 'application/vnd.dropbox.folder' },
      { id: 'db_4', name: 'Audio Recording.mp3', mimeType: 'audio/mpeg' }
    ] as CloudFile[]
  },

  // Email responses
  emails: [
    {
      id: 'email_1',
      from: 'manager@company.com',
      subject: 'Weekly Team Sync - Action Items',
      snippet: 'Following up on our team meeting yesterday. Here are the key action items we discussed and their deadlines...',
      date: new Date().toLocaleDateString()
    },
    {
      id: 'email_2',
      from: 'client@business.com',
      subject: 'Project Feedback and Next Steps',
      snippet: 'Thank you for the excellent work on the recent project. We have some feedback and would like to discuss next steps...',
      date: new Date(Date.now() - 86400000).toLocaleDateString()
    },
    {
      id: 'email_3',
      from: 'newsletter@accessibility.org',
      subject: 'Monthly Accessibility Newsletter',
      snippet: 'This month: New WCAG guidelines, assistive technology updates, and upcoming conferences in the accessibility space...',
      date: new Date(Date.now() - 172800000).toLocaleDateString()
    },
    {
      id: 'email_4',
      from: 'doctor@clinic.com',
      subject: 'Appointment Confirmation - January 15th',
      snippet: 'This confirms your appointment on January 15th at 2:00 PM. Please bring your insurance card and arrive 15 minutes early...',
      date: new Date(Date.now() - 259200000).toLocaleDateString()
    },
    {
      id: 'email_5',
      from: 'bank@securebank.com',
      subject: 'Security Alert: New Device Login',
      snippet: 'We detected a login from a new device. If this was you, no action is needed. If not, please secure your account immediately...',
      date: new Date(Date.now() - 345600000).toLocaleDateString()
    }
  ] as Email[],

  // AI analysis responses
  codeAnalysis: {
    python: "This function implements a bubble sort algorithm. While correct, it has O(n²) time complexity. Consider using Python's built-in sorted() function or implementing quicksort for better performance with large datasets.",
    
    javascript: "This React component handles user authentication. The implementation is solid but could benefit from error boundaries, loading states, and input validation for better user experience.",
    
    general: "The code structure is clean and readable. Consider adding type annotations, error handling, and unit tests to improve maintainability and reliability."
  },

  // Document summaries
  documentSummaries: {
    pdf: "This PDF document contains a comprehensive analysis of market trends in the technology sector, with particular focus on accessibility innovations and their business impact.",
    
    text: "The text discusses best practices for inclusive design, covering topics from color contrast and typography to keyboard navigation and screen reader compatibility.",
    
    email: "Email summary: 5 messages including 2 urgent items requiring response, 1 newsletter, 1 appointment confirmation, and 1 security notification."
  },

  // Image descriptions
  imageDescriptions: {
    chart: "This is a bar chart showing quarterly sales data. The chart has four bars representing Q1 through Q4, with values ranging from $50K to $120K. Q4 shows the highest performance.",
    
    document: "This appears to be a scanned document with text in multiple columns. The document contains headings, paragraphs, and what looks like a table or list structure.",
    
    photo: "This is a photograph showing a group of people in what appears to be an office setting. There are approximately 6 people visible, some sitting and some standing, in business casual attire."
  },

  // Daily brief content
  dailyBrief: {
    morning: "Good morning! You have 3 new documents in your cloud storage, 5 unread emails, and 2 calendar events today. The weather is partly cloudy at 72°F.",
    
    afternoon: "Good afternoon! You've completed 2 of 4 scheduled tasks. There are 3 new emails and 1 upcoming meeting at 3 PM.",
    
    evening: "Good evening! Today's summary: 8 emails processed, 4 documents reviewed, 3 meetings attended. Tomorrow you have 2 appointments scheduled."
  }
};

// Helper functions for generating dynamic mock data
export const generateMockResponse = {
  cloudConnection: (provider: string) => ({
    status: `Connected to ${provider} successfully (mock)`,
    connected: true,
    timestamp: new Date().toISOString()
  }),

  apiError: (operation: string) => ({
    error: `Mock error: ${operation} not implemented yet`,
    code: 'NOT_IMPLEMENTED',
    timestamp: new Date().toISOString()
  }),

  processingStatus: (operation: string) => ({
    status: `Processing ${operation}...`,
    progress: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString()
  })
};