import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, BookOpen, Clock, Heart, Shield, Award, Users, Briefcase, RefreshCw, Zap } from 'lucide-react';
import { SectionHeader } from '../../../components/typography/SectionHeader';
import { CategoryCard } from '../../../components/cards/CategoryCard';
import { HOME_CATEGORIES } from '../../../data/homeMockData';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Mental Wellness': <Sparkles size={20} />,
  'Academic Stress': <BookOpen size={20} />,
  'Exam Pressure': <Zap size={20} />,
  'Study Habits': <BookOpen size={20} />,
  'Time Management': <Clock size={20} />,
  'Confidence': <Award size={20} />,
  'College Life': <Users size={20} />,
  'Career Stress': <Briefcase size={20} />,
  'Failure & Resilience': <RefreshCw size={20} />,
  'Self-Care': <Heart size={20} />,
};

export const CategorySection: React.FC = () => {
  return (
    <section className="mb-8">
      <SectionHeader
        eyebrow="Taxonomy"
        title="Explore Topics & Categories"
        subtitle="Browse MindCampus content across core student wellness domains."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {HOME_CATEGORIES.map((cat) => (
          <NavLink key={cat.id} to="/blog" style={{ textDecoration: 'none' }}>
            <CategoryCard
              name={cat.name}
              itemCount={cat.count}
              icon={ICON_MAP[cat.name] || <Shield size={20} />}
            />
          </NavLink>
        ))}
      </div>
    </section>
  );
};
