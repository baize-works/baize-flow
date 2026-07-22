import React from 'react';
import './index.less';
interface RemixIconProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const PlusIcon: React.FC<RemixIconProps> = ({ className = '', style = {}, onClick }) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: ".625rem",
        width: ".625rem",
        color: "white"
      }}
      data-icon="Plus02"
      aria-hidden="true"
    >
      <g id="plus">
        <path
          id="Icon"
          d="M5.00004 2.08325V7.91659M2.08337 4.99992H7.91671"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g>
    </svg>
  );
};

export default PlusIcon;
