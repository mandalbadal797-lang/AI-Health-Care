import React from 'react';

export interface ReadingContainerProps {
  children: React.ReactNode;
}

export const ReadingContainer: React.FC<ReadingContainerProps> = ({ children }) => {
  return (
    <article className="container-reading py-4" style={{ fontSize: '1.0625rem', lineHeight: 1.7 }}>
      {children}
    </article>
  );
};
