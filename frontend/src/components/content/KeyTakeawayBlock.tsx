import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card } from '../cards/Card';

export interface KeyTakeawayBlockProps {
  takeaways: string[];
}

export const KeyTakeawayBlock: React.FC<KeyTakeawayBlockProps> = ({ takeaways }) => {
  return (
    <Card className="my-6 p-lg" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary)' }}>
      <div className="flex items-center gap-sm mb-3">
        <Lightbulb size={22} className="text-primary" />
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Key Actionable Takeaways</h3>
      </div>
      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {takeaways.map((point, index) => (
          <li key={index} className="text-small" style={{ color: 'var(--text-main)' }}>
            {point}
          </li>
        ))}
      </ul>
    </Card>
  );
};
