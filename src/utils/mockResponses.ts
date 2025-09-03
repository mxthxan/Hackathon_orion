import type { CloudFile, Email } from '../types';

/**
 * Mock Data for Development and Testing
 * 
 * TODO: Replace with actual API responses in production
 * These mock responses help with UI development and testing
 * when backend services are not available.
 */

export const mockCloudFiles: CloudFile[] = [
  {
    id: 'file_1',
    name: 'Annual Report 2024.pdf',
    mimeType: 'application/pdf'
  },
  {
    id: 'file_2',
    name: 'Budget Spreadsheet.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  {
    id: 'file_3',
    name: 'Project Presentation.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  },
  {
    id: 'file_4',
    name: 'Meeting Notes.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  {
    id: 'file_5',
    name: 'Team Photo.jpg',
    mimeType: 'image/jpeg'
  },
  {
    id: 'file_6',
    name: 'Code Archive.zip',
    mimeType: 'application/zip'
  },
  {
    id: 'file_7',
    name: 'Research Data.csv',
    mimeType: 'text/csv'
  },
  {
    id: 'file_8',
    name: 'Design Mockups',
    mimeType: 'application/vnd.google-apps.folder'
  }
];

export const mockEmails: Email[] = [
  {
    id: 'email_1',
    from: 'john.doe@company.com',
    subject: 'Quarterly Review Meeting',
    snippet: 'Hi there, I wanted to schedule our quarterly review meeting for next week. Please let me know your availability...',
    date: new Date().toLocaleDateString()
  },
  {
    id: 'email_2',
    from: 'newsletter@techblog.com',
    subject: 'Weekly Tech Updates - AI and Accessibility',
    snippet: 'This week in technology: Major breakthroughs in AI accessibility tools, new screen reader features, and upcoming conferences...',
    date: new Date(Date.now() - 86400000).toLocaleDateString()
  },
  {
    id: 'email_3',
    from: 'support@bankingapp.com',
    subject: 'Your Monthly Statement is Ready',
    snippet: 'Your monthly account statement for December 2024 is now available. You can view it in your online banking portal...',
    date: new Date(Date.now() - 172800000).toLocaleDateString()
  },
  {
    id: 'email_4',
    from: 'team@accessibility.org',
    subject: 'Invitation: Accessibility Workshop',
    snippet: 'You are invited to join our upcoming workshop on "Building Inclusive Web Applications". The event will cover...',
    date: new Date(Date.now() - 259200000).toLocaleDateString()
  },
  {
    id: 'email_5',
    from: 'noreply@calendar.com',
    subject: 'Reminder: Doctor Appointment Tomorrow',
    snippet: 'This is a reminder that you have a doctor appointment scheduled for tomorrow at 2:00 PM. Please arrive 15 minutes early...',
    date: new Date(Date.now() - 345600000).toLocaleDateString()
  }
];

export const mockSummaries = {
  shortText: "This document discusses the importance of accessibility in modern web development, highlighting key principles and implementation strategies.",
  
  longDocument: "This comprehensive report analyzes current trends in artificial intelligence and accessibility technology. Key findings include significant improvements in voice recognition accuracy, better screen reader compatibility, and emerging standards for inclusive design. The document recommends increased investment in accessibility research and development.",
  
  technicalCode: "This Python function implements a recursive Fibonacci sequence calculator. While functional, it has exponential time complexity and could benefit from memoization or iterative implementation for better performance with large numbers.",
  
  emailSummary: "Recent emails include meeting requests, newsletter updates, banking notifications, workshop invitations, and appointment reminders. Priority items require responses within 24-48 hours."
};

export const mockNewsHeadlines = [
  {
    title: "Major Breakthrough in AI Accessibility Technology",
    summary: "Researchers announce new AI system that can describe complex visual content with 95% accuracy for blind users.",
    source: "Tech News Daily",
    timestamp: new Date().toISOString()
  },
  {
    title: "New Screen Reader Features Improve Web Navigation",
    summary: "Latest updates to popular screen readers include better support for modern web applications and improved voice commands.",
    source: "Accessibility Today",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    title: "Government Announces Enhanced Digital Accessibility Standards",
    summary: "New regulations require all public websites to meet WCAG 2.2 AA standards by end of 2025.",
    source: "Policy Update",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

export const mockDailyBrief = {
  greeting: "Good morning! Here's your daily brief for today.",
  summary: "You have 3 new documents in your cloud storage, 5 unread emails requiring attention, and 2 calendar events scheduled for today.",
  priorities: [
    "Review quarterly budget spreadsheet (urgent)",
    "Respond to meeting invitation from John",
    "Prepare for 2 PM client presentation"
  ],
  weather: "Partly cloudy, 72°F with light winds",
  news: "Top story: Major accessibility technology breakthrough announced"
};

// Helper function to get random mock data
export const getRandomMockData = {
  files: (count: number = 5): CloudFile[] => {
    return mockCloudFiles.slice(0, count);
  },
  
  emails: (count: number = 5): Email[] => {
    return mockEmails.slice(0, count);
  },
  
  summary: (type: 'short' | 'long' | 'code' | 'email' = 'short'): string => {
    const summaryMap = {
      short: mockSummaries.shortText,
      long: mockSummaries.longDocument,
      code: mockSummaries.technicalCode,
      email: mockSummaries.emailSummary
    };
    
    return summaryMap[type];
  }
};

export { mockCloudFiles, mockEmails }

export { mockDailyBrief }