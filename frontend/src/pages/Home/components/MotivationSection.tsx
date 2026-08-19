import React from 'react';
import { QuoteBlock } from '../../../components/content/QuoteBlock';

export const MotivationSection: React.FC = () => {
  return (
    <section className="mb-8">
      <QuoteBlock
        quote="A small step still counts. You don't have to solve every academic challenge today — start with what you can do next."
        author="Campus Student Support Principle"
      />
    </section>
  );
};
