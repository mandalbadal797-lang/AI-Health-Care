import React from 'react';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md' }) => {
  const pixelSize = size === 'sm' ? 32 : size === 'lg' ? 56 : 40;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.125rem' : '0.875rem',
        overflow: 'hidden',
        border: '2px solid var(--border-color)',
        flexShrink: 0,
      }}
      title={name}
    >
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
};
