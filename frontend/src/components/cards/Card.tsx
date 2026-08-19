import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  hoverable = false,
  className = '',
  style,
  ...props
}) => {
  const glassClass = glass ? 'card-glass' : '';
  const hoverClass = hoverable ? 'card-hover' : '';

  return (
    <div
      className={`card ${glassClass} ${hoverClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
