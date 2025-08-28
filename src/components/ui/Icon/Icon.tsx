import React from 'react';
import { 
  AiOutlineEdit, 
  AiOutlineEye, 
  AiOutlineDelete,
  AiOutlineCheck,
  AiOutlineClose
} from 'react-icons/ai';
import { 
  FaChevronUp, 
  FaChevronDown, 
  FaSort 
} from 'react-icons/fa';

export type IconName = 
  | 'edit' 
  | 'edit3'
  | 'eye' 
  | 'trash' 
  | 'check' 
  | 'x' 
  | 'chevron-up' 
  | 'chevron-down' 
  | 'chevrons-up-down';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

const iconMap = {
  edit: AiOutlineEdit,
  edit3: AiOutlineEdit,
  eye: AiOutlineEye,
  trash: AiOutlineDelete,
  check: AiOutlineCheck,
  x: AiOutlineClose,
  'chevron-up': FaChevronUp,
  'chevron-down': FaChevronDown,
  'chevrons-up-down': FaSort,
};

export const Icon: React.FC<IconProps> = ({ name, size = 16, className, color }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className}
      style={{ 
        color,
        display: 'block',
        flexShrink: 0
      }}
    />
  );
};
