import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="running-man">
          <div className="head" />
          <div className="body" />
          <div className="arm arm-left" />
          <div className="arm arm-right" />
          <div className="leg leg-left" />
          <div className="leg leg-right" />
        </div>

        <span className="text-[13px] font-medium text-slate-500">
          Loading
        </span>
      </div>

      <style>
        {`
          .running-man {
            position: relative;
            width: 28px;
            height: 30px;
            animation: man-bounce 0.42s ease-in-out infinite alternate;
          }

          .running-man .head {
            position: absolute;
            left: 10px;
            top: 0;
            width: 9px;
            height: 9px;
            border-radius: 999px;
            background: #1f2937;
          }

          .running-man .body {
            position: absolute;
            left: 13px;
            top: 9px;
            width: 3px;
            height: 12px;
            border-radius: 999px;
            background: #1f2937;
            transform-origin: top center;
            transform: rotate(-8deg);
          }

          .running-man .arm,
          .running-man .leg {
            position: absolute;
            width: 3px;
            height: 11px;
            border-radius: 999px;
            background: #1f2937;
            transform-origin: top center;
          }

          .running-man .arm-left {
            left: 13px;
            top: 10px;
            animation: arm-left-run 0.52s ease-in-out infinite;
          }

          .running-man .arm-right {
            left: 14px;
            top: 10px;
            animation: arm-right-run 0.52s ease-in-out infinite;
          }

          .running-man .leg-left {
            left: 13px;
            top: 20px;
            height: 12px;
            animation: leg-left-run 0.52s ease-in-out infinite;
          }

          .running-man .leg-right {
            left: 14px;
            top: 20px;
            height: 12px;
            animation: leg-right-run 0.52s ease-in-out infinite;
          }

          @keyframes man-bounce {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-2px);
            }
          }

          @keyframes arm-left-run {
            0%, 100% {
              transform: rotate(48deg);
            }
            50% {
              transform: rotate(-42deg);
            }
          }

          @keyframes arm-right-run {
            0%, 100% {
              transform: rotate(-42deg);
            }
            50% {
              transform: rotate(48deg);
            }
          }

          @keyframes leg-left-run {
            0%, 100% {
              transform: rotate(-48deg);
            }
            50% {
              transform: rotate(42deg);
            }
          }

          @keyframes leg-right-run {
            0%, 100% {
              transform: rotate(42deg);
            }
            50% {
              transform: rotate(-48deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;