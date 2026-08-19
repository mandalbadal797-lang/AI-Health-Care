import React from 'react';
import { Card } from '../cards/Card';

export interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
  visualElement?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  visualElement,
}) => {
  return (
    <Card glass className="p-xl mb-8" style={{ border: '1px solid var(--border-color)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-start gap-md">
          {eyebrow && <span className="badge badge-info">{eyebrow}</span>}
          <h1 className="display-heading">{title}</h1>
          <p className="body-lg text-muted">{subtitle}</p>
          <div className="flex items-center gap-md mt-4">
            {primaryCta}
            {secondaryCta}
          </div>
        </div>
        {visualElement && (
          <div className="flex items-center justify-center p-md">
            {visualElement}
          </div>
        )}
      </div>
    </Card>
  );
};
