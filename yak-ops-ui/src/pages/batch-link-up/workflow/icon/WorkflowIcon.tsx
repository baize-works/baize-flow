import React from 'react';
import './index.less';
interface RemixIconProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const WorkflowIcon: React.FC<RemixIconProps> = ({ className = '', style = {}, onClick }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
      style={{
        width: '1rem',
        height: '1rem',
        marginRight: '0.5rem',
        flexShrink: 0,
      }}
      onClick={onClick}
    >
      <path d="M20 10H4V19H20V10ZM3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM5 6V8H7V6H5ZM9 6V8H11V6H9ZM5 11H8V16H5V11Z" />
    </svg>
  );
};

export default WorkflowIcon;
