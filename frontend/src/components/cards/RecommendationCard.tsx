import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../badges/Badge';

export interface RecommendationCardProps {
  detectedIntent: string;
  matchScorePercentage: number;
  recommendedTitle: string;
  format: 'Article' | 'Podcast' | 'Story';
  guidanceTip: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  detectedIntent,
  matchScorePercentage,
  recommendedTitle,
  format,
  guidanceTip,
}) => {
  return (
    <Card glass hoverable className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <span className="badge badge-warning flex items-center gap-xs">
          <Sparkles size={12} /> {matchScorePercentage}% AI Match
        </span>
        <Badge variant="info">{format}</Badge>
      </div>

      <div>
        <span className="caption text-muted">Detected Goal: {detectedIntent}</span>
        <h3 className="mt-1">{recommendedTitle}</h3>
      </div>

      <div className="card p-sm" style={{ backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)' }}>
        <p className="text-small text-muted">
          💡 <strong>AI Support Tip:</strong> {guidanceTip}
        </p>
      </div>

      <div className="flex items-center justify-between mt-1 text-small font-semibold text-primary">
        <span>View Suggested {format}</span>
        <ArrowRight size={16} />
      </div>
    </Card>
  );
};
