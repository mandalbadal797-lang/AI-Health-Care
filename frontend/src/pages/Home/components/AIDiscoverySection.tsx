import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Search, ArrowRight, ShieldCheck, Bot } from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { Button } from '../../../components/buttons/Button';
import { Input } from '../../../components/forms/Input';

export const AIDiscoverySection: React.FC = () => {
  const [query, setQuery] = useState('I feel unmotivated to study today. What can I do?');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/ai-assistant');
  };

  return (
    <section className="mb-8">
      <Card glass className="p-xl" style={{ border: '1px solid var(--color-primary)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-md">
            <span className="badge badge-warning flex items-center gap-xs" style={{ width: 'fit-content' }}>
              <Sparkles size={12} /> Student Wellness & Motivation AI
            </span>

            <h2>Need Support, Motivation, or Study Advice?</h2>

            <p className="text-secondary">
              Describe your current situation or stressor in natural language. MindCampus AI provides supportive suggestions, reflection prompts, and grounded content recommendations.
            </p>

            <div className="card p-xs flex items-center gap-xs text-small text-muted" style={{ backgroundColor: 'var(--bg-app)' }}>
              <ShieldCheck size={16} className="text-primary" style={{ flexShrink: 0 }} />
              <span>Non-clinical assistant: MindCampus AI provides educational guidance, not psychiatric diagnosis or medical care.</span>
            </div>
          </div>

          {/* Natural Query Interface Box */}
          <form onSubmit={handleSearch} className="card p-lg flex flex-col gap-md" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <label className="label-text">Try Asking Your Student Wellness Guide:</label>

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. How to study when feeling overwhelmed..."
              leftIcon={<Search size={18} />}
            />

            <Button variant="primary" type="submit" className="w-full justify-center" rightIcon={<ArrowRight size={18} />} leftIcon={<Bot size={18} />}>
              Open AI Assistant Guide
            </Button>

            <NavLink to="/ai-assistant" className="caption text-primary text-center font-semibold" style={{ textDecoration: 'none' }}>
              Launch Full AI Assistant Conversation →
            </NavLink>
          </form>
        </div>
      </Card>
    </section>
  );
};
