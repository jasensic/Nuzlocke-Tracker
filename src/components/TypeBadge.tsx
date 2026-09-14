import React from 'react';
import { getTypeFillStyle } from '../utils/typeStyles';
import { pillShape } from '../utils/ui';

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className = '' }) => {
  return (
    <span className={pillShape('xs', className)} style={getTypeFillStyle(type)}>
      {type}
    </span>
  );
};
