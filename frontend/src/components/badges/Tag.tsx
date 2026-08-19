import React from 'react';

export interface TagProps {
  label: string;
  onClick?: () => void;
}

export const Tag: React.FC<TagProps> = ({ label, onClick }) => {
  return (
    <button type="button" className="tag" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', border: 'none' }}>
      #{label}
    </button>
  );
};
