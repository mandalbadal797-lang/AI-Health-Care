import React from 'react';
import { Card } from '../../../components/cards/Card';

export const SupportSection: React.FC = () => {
  return (
    <section className="mb-8">
      <Card glass className="p-xl text-center flex flex-col items-center gap-md">
        <h2 style={{ fontSize: '1.75rem' }}>You Don't Have to Figure Everything Out at Once</h2>
        <p className="body-lg text-muted" style={{ maxWidth: '700px' }}>
          Explore practical study strategies, authentic student experiences, motivational podcasts, and reflective digital stories at your own pace.
        </p>
      </Card>
    </section>
  );
};
