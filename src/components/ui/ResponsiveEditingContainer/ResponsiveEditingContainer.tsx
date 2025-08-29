import React from 'react';
import { Modal } from '../Modal';
import { SidePanel } from '../SidePanel';
import { useScreenSize } from '../../../hooks';
import './ResponsiveEditingContainer.scss';

export interface ResponsiveEditingContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  breakpoint?: number; // px value for mobile breakpoint
}

/**
 * Responsive Editing Container
 * 
 * Automatically switches between:
 * - Side Panel for desktop (maintains context)
 * - Modal for mobile/tablet (better space utilization)
 * 
 */
export const ResponsiveEditingContainer: React.FC<ResponsiveEditingContainerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'medium',
  className = '',
  breakpoint = 768
}) => {
  const { isMobile } = useScreenSize(breakpoint);

  // Use Modal for mobile, SidePanel for desktop
  if (isMobile) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size={size}
        footer={footer}
        className={`responsive-editing-modal ${className}`}
      >
        {children}
      </Modal>
    );
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size={size}
      footer={footer}
      className={`responsive-editing-panel ${className}`}
    >
      {children}
    </SidePanel>
  );
};
