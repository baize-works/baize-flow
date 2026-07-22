import React from 'react';
import './index.less';
interface RemixIconProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CloseIcon: React.FC<RemixIconProps> = ({ className = '', style = {}, onClick }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      style={{
        width: '1rem',
        height: '1rem',
        color: '#676f83',
      }}
    >
      <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
    </svg>
  );
};

export default CloseIcon;
