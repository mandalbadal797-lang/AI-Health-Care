import React from 'react';
import { SafetyNotice } from '../../../components/content/SafetyNotice';

export const SafetySection: React.FC = () => {
  return (
    <section className="mb-8">
      <SafetyNotice />
    </section>
  );
};
