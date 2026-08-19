import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { SectionHeader } from '../../../components/typography/SectionHeader';
import { Card } from '../../../components/cards/Card';
import { Button } from '../../../components/buttons/Button';
import { MOOD_OPTIONS, MoodOption } from '../../../data/homeMockData';

export const StudentNeedSection: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[0]);

  return (
    <section className="mb-8">
      <SectionHeader
        eyebrow="Interactive Discovery"
        title="What would you like help exploring today?"
        subtitle="Select a goal or feeling below to discover relevant articles, podcasts, and student stories."
      />

      {/* Mood Selector Chips */}
      <div className="flex flex-wrap items-center gap-sm mb-6" role="tablist" aria-label="Student Goal Options">
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood.id === mood.id;
          return (
            <Button
              key={mood.id}
              variant={isSelected ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setSelectedMood(mood)}
              role="tab"
              aria-selected={isSelected}
              className="flex items-center gap-xs"
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Static Recommendation Preview Container */}
      <Card glass className="p-lg flex flex-col gap-md animate-fade-in" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <Compass size={20} className="text-primary" />
            <span className="label-text">
              Selected Goal: <strong>{selectedMood.emoji} {selectedMood.label}</strong>
            </span>
          </div>
          <span className="badge badge-info flex items-center gap-xs">
            <Sparkles size={12} /> Curated Suggestions
          </span>
        </div>

        <p className="text-small text-muted">Recommended starting points for this topic:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedMood.suggestedTitles.map((title, idx) => (
            <NavLink key={idx} to="/blog" style={{ textDecoration: 'none' }}>
              <div
                className="card p-sm flex items-center justify-between hoverable"
                style={{ backgroundColor: 'var(--bg-app)', height: '100%' }}
              >
                <span className="text-small font-semibold text-main">{title}</span>
                <ArrowRight size={16} className="text-primary" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
              </div>
            </NavLink>
          ))}
        </div>
      </Card>
    </section>
  );
};
