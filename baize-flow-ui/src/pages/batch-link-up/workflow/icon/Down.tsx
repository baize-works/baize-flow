import React from 'react';
import './index.less';
interface RemixIconProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Down: React.FC<RemixIconProps> = ({ className = '', style = {}, onClick }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      style={{
        width: '0.75rem',
        height: '0.75rem',
        marginLeft: '2px',
        flexShrink: 0,
        color: ' rgb(102 112 133)',
      }}
    >
      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
    </svg>
  );
};

export default Down;
