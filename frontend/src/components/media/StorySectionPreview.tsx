import React from 'react';
import { Card } from '../cards/Card';
import { QuoteBlock } from '../content/QuoteBlock';
import { CalloutBlock } from '../content/CalloutBlock';

export interface StorySectionPreviewProps {
  sectionOrder: number;
  title: string;
  content: string;
  quote?: string;
  reflectionQuestion?: string;
}

export const StorySectionPreview: React.FC<StorySectionPreviewProps> = ({
  sectionOrder,
  title,
  content,
  quote,
  reflectionQuestion,
}) => {
  return (
    <Card className="p-xl my-6 flex flex-col gap-md">
      <span className="badge badge-info">Chapter {sectionOrder}</span>
      <h2>{title}</h2>
      <p className="body-lg">{content}</p>

      {quote && <QuoteBlock quote={quote} />}

      {reflectionQuestion && (
        <CalloutBlock type="info" title="Self-Reflection Question">
          <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>{reflectionQuestion}</p>
        </CalloutBlock>
      )}
    </Card>
  );
};
