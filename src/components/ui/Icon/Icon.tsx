import React from 'react';
import { 
  AiOutlineEdit, 
  AiOutlineEye, 
  AiOutlineDelete,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineArrowLeft,
  AiOutlineLink
} from 'react-icons/ai';
import { 
  FaChevronUp, 
  FaChevronDown, 
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaColumns,
  FaBuilding
} from 'react-icons/fa';
import { 
  MdBusiness,
  MdLocationOn,
  MdMap,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdNotifications
} from 'react-icons/md';
import './Icon.scss';

export type IconName = 
  | 'edit' 
  | 'edit3'
  | 'eye' 
  | 'trash' 
  | 'check' 
  | 'x' 
  | 'chevron-up' 
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevrons-up-down'
  | 'columns'
  | 'user'
  | 'home'
  | 'warning'
  | 'info'
  | 'location'
  | 'building'
  | 'business'
  | 'map'
  | 'check-circle'
  | 'error'
  | 'close'
  | 'search'
  | 'arrow-left'
  | 'external-link'
  | 'bell';

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
  'chevron-left': FaChevronLeft,
  'chevron-right': FaChevronRight,
  'chevrons-up-down': FaSort,
  columns: FaColumns,
  user: AiOutlineUser,
  home: AiOutlineHome,
  warning: MdWarning,
  info: MdInfo,
  location: MdLocationOn,
  building: FaBuilding,
  business: MdBusiness,
  map: MdMap,
  'check-circle': MdCheckCircle,
  error: MdError,
  close: AiOutlineClose,
  search: AiOutlineSearch,
  'arrow-left': AiOutlineArrowLeft,
  'external-link': AiOutlineLink,
  bell: MdNotifications,
};

export const Icon: React.FC<IconProps> = ({ name, size = 16, className, color }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const combinedClassName = className ? `icon ${className}` : 'icon';
  
  return (
    <IconComponent 
      size={size} 
      className={combinedClassName}
      style={color ? { color } : undefined}
    />
  );
};
