import React from 'react';

interface StatusAnnouncerProps {
  message: string;
}

export const StatusAnnouncer: React.FC<StatusAnnouncerProps> = ({ message }) => {
  return (
    <div 
      aria-live="polite" 
      aria-atomic="true" 
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
};