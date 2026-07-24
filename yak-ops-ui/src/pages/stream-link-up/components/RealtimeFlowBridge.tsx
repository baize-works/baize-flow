import React from 'react';

const RealtimeFlowBridge: React.FC = () => {
  return (
    <div className="realtime-flow-bridge">
      <svg
        width="120"
        height="52"
        viewBox="0 0 180 52"
        fill="none"
        className="realtime-flow-svg"
      >
        <defs>
          <linearGradient id="flowSoftLine" x1="0" y1="0" x2="180" y2="0">
            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.08" />
            <stop offset="45%" stopColor="#8aa2ff" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#4f66f6" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.18" />
          </linearGradient>

          <linearGradient id="flowActiveLine" x1="0" y1="0" x2="180" y2="0">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="30%" stopColor="#818cf8" stopOpacity="0.75" />
            <stop offset="62%" stopColor="#4f66f6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="flowBrightLine" x1="0" y1="0" x2="180" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="72%" stopColor="#a5f3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="flowRightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f66f6" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#67e8f9" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="flowGlow" x="-60%" y="-80%" width="220%" height="260%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="flowSoftGlow" x="-80%" y="-120%" width="260%" height="340%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

   

        {/* 底层多条细线：左侧收敛，右侧发散 */}
        <path
          className="flow-base flow-base-1"
          d="M4 26C22 26 31 18 47 18C63 18 68 25 82 26C101 27 112 11 133 11C150 11 161 17 176 16"
          stroke="url(#flowSoftLine)"
        />
        <path
          className="flow-base flow-base-2"
          d="M4 26C23 26 31 34 48 34C63 34 69 27 83 26C101 24 112 41 132 41C150 41 161 34 176 35"
          stroke="url(#flowSoftLine)"
        />
        <path
          className="flow-base flow-base-3"
          d="M10 26C28 24 37 23 51 25C67 27 73 31 88 29C106 26 115 20 132 21C150 22 162 27 176 26"
          stroke="#dbeafe"
        />
        <path
          className="flow-base flow-base-4"
          d="M18 26C36 30 44 29 58 27C72 25 79 20 93 21C111 22 119 31 135 32C151 33 162 29 176 30"
          stroke="#e0f2fe"
        />
        <path
          className="flow-base flow-base-5"
          d="M20 26C40 21 49 17 63 18C78 19 84 24 98 25C116 26 126 15 144 14C158 13 168 17 176 18"
          stroke="#e0e7ff"
        />

        {/* 右侧更密的细碎线，让它像图片里那种数据流 */}
        <path
          className="flow-thread flow-thread-1"
          d="M82 26C100 20 110 9 132 8C150 7 164 12 180 10"
        />
        <path
          className="flow-thread flow-thread-2"
          d="M84 26C101 25 112 18 132 18C151 18 164 22 180 21"
        />
        <path
          className="flow-thread flow-thread-3"
          d="M84 26C101 31 112 43 132 44C151 45 164 40 180 42"
        />
        <path
          className="flow-thread flow-thread-4"
          d="M88 27C104 30 114 35 132 35C151 35 164 31 180 32"
        />

        {/* 动态高亮线：不是一整条亮线，而是流光片段 */}
        <path
          className="flow-active flow-active-1"
          d="M4 26C22 26 31 18 47 18C63 18 68 25 82 26C101 27 112 11 133 11C150 11 161 17 176 16"
          stroke="url(#flowActiveLine)"
        />
        <path
          className="flow-active flow-active-2"
          d="M4 26C23 26 31 34 48 34C63 34 69 27 83 26C101 24 112 41 132 41C150 41 161 34 176 35"
          stroke="url(#flowActiveLine)"
        />
        <path
          className="flow-active flow-active-3"
          d="M10 26C28 24 37 23 51 25C67 27 73 31 88 29C106 26 115 20 132 21C150 22 162 27 176 26"
          stroke="url(#flowBrightLine)"
        />

        {/* 右侧像素点 / 数据粒子 */}
        <g className="flow-pixels">
          <rect x="118" y="10" width="2.5" height="2.5" rx="0.6" />
          <rect x="130" y="15" width="2" height="2" rx="0.5" />
          <rect x="144" y="13" width="3" height="3" rx="0.7" />
          <rect x="154" y="21" width="2.4" height="2.4" rx="0.5" />
          <rect x="166" y="18" width="2" height="2" rx="0.5" />

          <rect x="121" y="36" width="2" height="2" rx="0.5" />
          <rect x="136" y="40" width="2.8" height="2.8" rx="0.6" />
          <rect x="150" y="35" width="2" height="2" rx="0.5" />
          <rect x="162" y="31" width="3" height="3" rx="0.7" />
        </g>

        {/* 小粒子沿路径运动 */}
        <circle r="1.7" fill="#4f66f6" filter="url(#flowGlow)">
          <animateMotion
            dur="2.2s"
            repeatCount="indefinite"
            path="M4 26C22 26 31 18 47 18C63 18 68 25 82 26C101 27 112 11 133 11C150 11 161 17 176 16"
          />
        </circle>

        <circle r="1.35" fill="#22d3ee" opacity="0.95" filter="url(#flowGlow)">
          <animateMotion
            dur="2.6s"
            begin="0.35s"
            repeatCount="indefinite"
            path="M4 26C23 26 31 34 48 34C63 34 69 27 83 26C101 24 112 41 132 41C150 41 161 34 176 35"
          />
        </circle>

        <circle r="1" fill="#a5b4fc" opacity="0.9">
          <animateMotion
            dur="3.1s"
            begin="0.8s"
            repeatCount="indefinite"
            path="M10 26C28 24 37 23 51 25C67 27 73 31 88 29C106 26 115 20 132 21C150 22 162 27 176 26"
          />
        </circle>

        {/* 中段微弱核心，不抢视觉 */}
        <circle
          cx="84"
          cy="26"
          r="3.6"
          fill="#4f66f6"
          opacity="0.18"
          filter="url(#flowSoftGlow)"
          className="flow-core"
        />
        <circle cx="84" cy="26" r="1.5" fill="#4f66f6" opacity="0.55" />
      </svg>
    </div>
  );
};

export default RealtimeFlowBridge;