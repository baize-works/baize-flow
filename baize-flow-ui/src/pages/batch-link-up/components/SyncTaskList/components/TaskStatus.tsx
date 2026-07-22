import { message, Popover } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface TaskStatusProps {
  status?: string;
  errorMessage?: string;
}

type PixelIconProps = {
  className?: string;
};

const PixelStatusStyle: React.FC = () => (
  <style>
    {`
      @keyframes pixelTrackMove {
        0% {
          transform: translateX(-16px);
        }
        100% {
          transform: translateX(16px);
        }
      }

      @keyframes pixelRunnerBob {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-1px);
        }
      }

      @keyframes pixelRunnerFrameA {
        0%, 49% {
          opacity: 1;
        }
        50%, 100% {
          opacity: 0;
        }
      }

      @keyframes pixelRunnerFrameB {
        0%, 49% {
          opacity: 0;
        }
        50%, 100% {
          opacity: 1;
        }
      }

      @keyframes pixelPulse {
        0%, 100% {
          opacity: 0.45;
        }
        50% {
          opacity: 1;
        }
      }

      @keyframes pixelBlink {
        0%, 45% {
          opacity: 1;
        }
        46%, 100% {
          opacity: 0.25;
        }
      }

      @keyframes copySuccessPop {
        0% {
          transform: scale(0.92);
          opacity: 0.75;
        }
        60% {
          transform: scale(1.06);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}
  </style>
);

const PixelRunningIcon: React.FC<PixelIconProps> = ({ className }) => {
  return (
    <span
      className={[
        "relative inline-flex h-[18px] w-[46px] items-center overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {/* moving pixel road */}
      <span className="absolute left-0 top-[12px] h-[2px] w-full overflow-hidden opacity-60">
        <span
          className="absolute left-0 top-0 h-[2px] w-[78px]"
          style={{
            background:
              "repeating-linear-gradient(to right, currentColor 0 6px, transparent 6px 10px)",
            animation: "pixelTrackMove 0.42s linear infinite",
          }}
        />
      </span>

      {/* center runner */}
      <svg
        width="46"
        height="18"
        viewBox="0 0 46 18"
        fill="currentColor"
        shapeRendering="crispEdges"
        className="relative z-10"
      >
        <g style={{ animation: "pixelRunnerBob 0.24s steps(2, end) infinite" }}>
          {/* head */}
          <rect x="22" y="1" width="4" height="4" />
          <rect x="21" y="2" width="1" height="2" />
          <rect x="26" y="2" width="1" height="2" />

          {/* body */}
          <rect x="21" y="6" width="6" height="5" />
          <rect x="23" y="5" width="2" height="1" />

          {/* frame A */}
          <g style={{ animation: "pixelRunnerFrameA 0.32s steps(1, end) infinite" }}>
            <rect x="17" y="6" width="4" height="2" />
            <rect x="27" y="7" width="5" height="2" />
            <rect x="19" y="11" width="3" height="2" />
            <rect x="17" y="13" width="3" height="2" />
            <rect x="26" y="11" width="2" height="4" />
            <rect x="28" y="15" width="4" height="2" />
          </g>

          {/* frame B */}
          <g style={{ animation: "pixelRunnerFrameB 0.32s steps(1, end) infinite" }}>
            <rect x="18" y="7" width="5" height="2" />
            <rect x="27" y="6" width="4" height="2" />
            <rect x="21" y="11" width="2" height="4" />
            <rect x="18" y="15" width="4" height="2" />
            <rect x="26" y="11" width="3" height="2" />
            <rect x="29" y="13" width="3" height="2" />
          </g>
        </g>

        {/* speed pixels */}
        <rect x="7" y="5" width="6" height="2" opacity="0.45" />
        <rect x="3" y="9" width="8" height="2" opacity="0.28" />
        <rect x="11" y="13" width="5" height="2" opacity="0.38" />
      </svg>
    </span>
  );
};

const PixelFinishedIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="28"
    height="20"
    viewBox="0 0 28 20"
    fill="currentColor"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    {/* flag pole */}
    <rect x="4" y="2" width="2" height="16" />
    <rect x="2" y="17" width="8" height="2" />

    {/* pixel flag */}
    <rect x="6" y="2" width="14" height="3" />
    <rect x="6" y="5" width="12" height="3" />
    <rect x="6" y="8" width="14" height="3" />

    {/* check */}
    <rect x="12" y="8" width="3" height="3" fill="white" />
    <rect x="15" y="11" width="3" height="3" fill="white" />
    <rect x="18" y="5" width="3" height="3" fill="white" />
    <rect x="18" y="8" width="3" height="3" fill="white" />
    <rect x="21" y="2" width="3" height="3" fill="white" />
  </svg>
);

const PixelFailedIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="26"
    height="20"
    viewBox="0 0 26 20"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    {/* outer pixel badge */}
    <rect x="7" y="1" width="12" height="2" fill="currentColor" />
    <rect x="5" y="3" width="16" height="2" fill="currentColor" />
    <rect x="3" y="5" width="20" height="10" fill="currentColor" />
    <rect x="5" y="15" width="16" height="2" fill="currentColor" />
    <rect x="7" y="17" width="12" height="2" fill="currentColor" />

    {/* center X */}
    <rect x="8" y="6" width="3" height="3" fill="white" />
    <rect x="11" y="9" width="3" height="2" fill="white" />
    <rect x="8" y="11" width="3" height="3" fill="white" />

    <rect x="15" y="6" width="3" height="3" fill="white" />
    <rect x="12" y="9" width="3" height="2" fill="white" />
    <rect x="15" y="11" width="3" height="3" fill="white" />

    {/* glitch pixels */}
    <rect
      x="1"
      y="4"
      width="2"
      height="2"
      fill="currentColor"
      style={{ animation: "pixelBlink 0.8s steps(1, end) infinite" }}
    />
    <rect
      x="22"
      y="2"
      width="2"
      height="2"
      fill="currentColor"
      style={{ animation: "pixelBlink 1s steps(1, end) infinite" }}
    />
    <rect
      x="23"
      y="15"
      width="2"
      height="2"
      fill="currentColor"
      style={{ animation: "pixelBlink 0.9s steps(1, end) infinite" }}
    />
  </svg>
);

const PixelCanceledIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="24"
    height="20"
    viewBox="0 0 24 20"
    fill="currentColor"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    {/* stop block */}
    <rect x="7" y="1" width="10" height="2" />
    <rect x="5" y="3" width="14" height="2" />
    <rect x="3" y="5" width="18" height="10" />
    <rect x="5" y="15" width="14" height="2" />
    <rect x="7" y="17" width="10" height="2" />

    {/* minus */}
    <rect x="7" y="9" width="10" height="2" fill="white" />
  </svg>
);

const PixelPausedIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="24"
    height="20"
    viewBox="0 0 24 20"
    fill="currentColor"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    {/* cartridge-like pause icon */}
    <rect x="4" y="2" width="16" height="2" />
    <rect x="2" y="4" width="20" height="12" />
    <rect x="4" y="16" width="16" height="2" />

    <rect x="8" y="6" width="3" height="8" fill="white" />
    <rect x="13" y="6" width="3" height="8" fill="white" />

    <rect
      x="21"
      y="7"
      width="2"
      height="2"
      style={{ animation: "pixelPulse 1s steps(2, end) infinite" }}
    />
  </svg>
);

const PixelNotStartedIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="24"
    height="20"
    viewBox="0 0 24 20"
    fill="currentColor"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    {/* idle terminal */}
    <rect x="3" y="3" width="18" height="2" />
    <rect x="1" y="5" width="2" height="10" />
    <rect x="21" y="5" width="2" height="10" />
    <rect x="3" y="15" width="18" height="2" />

    <rect x="6" y="7" width="2" height="2" />
    <rect x="8" y="9" width="2" height="2" />
    <rect x="6" y="11" width="2" height="2" />

    <rect
      x="13"
      y="11"
      width="5"
      height="2"
      style={{ animation: "pixelBlink 1s steps(1, end) infinite" }}
    />
  </svg>
);

const PixelCopyIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="1" width="7" height="2" />
    <rect x="5" y="3" width="2" height="8" />
    <rect x="10" y="3" width="2" height="8" />
    <rect x="5" y="10" width="7" height="2" />

    <rect x="2" y="4" width="2" height="8" opacity="0.55" />
    <rect x="2" y="12" width="7" height="1" opacity="0.55" />
  </svg>
);

const PixelCopiedIcon: React.FC<PixelIconProps> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="7" width="2" height="2" />
    <rect x="4" y="9" width="2" height="2" />
    <rect x="6" y="7" width="2" height="2" />
    <rect x="8" y="5" width="2" height="2" />
    <rect x="10" y="3" width="2" height="2" />
  </svg>
);

const statusConfig: Record<
  string,
  {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  FINISHED: {
    color: "#16a34a",
    bgColor: "rgba(22, 163, 74, 0.10)",
    icon: <PixelFinishedIcon />,
    label: "FINISHED",
  },
  RUNNING: {
    color: "#1677ff",
    bgColor: "rgba(22, 119, 255, 0.10)",
    icon: <PixelRunningIcon />,
    label: "RUNNING",
  },
  FAILED: {
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.12)",
    icon: <PixelFailedIcon />,
    label: "FAILED",
  },
  CANCELED: {
    color: "#64748b",
    bgColor: "rgba(100, 116, 139, 0.12)",
    icon: <PixelCanceledIcon />,
    label: "CANCELED",
  },
  PAUSED: {
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.13)",
    icon: <PixelPausedIcon />,
    label: "PAUSED",
  },
};

const TaskStatus: React.FC<TaskStatusProps> = ({ status, errorMessage }) => {
  const config = status ? statusConfig[status] : undefined;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  console.log(status);
  console.log(errorMessage)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!errorMessage) return;

    try {
      await navigator.clipboard.writeText(errorMessage);
      setCopied(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.log(err)
      message.error(err);
    }
  };

  if (!config) {
    return (
      <>
        <PixelStatusStyle />

        <span
          className="inline-flex h-6 min-w-[46px] items-center justify-center"
          style={{ color: "#999" }}
          title="NOT STARTED"
          aria-label="NOT STARTED"
        >
          <PixelNotStartedIcon />
        </span>
      </>
    );
  }

const content = (
  <span
    className="inline-flex h-7 min-w-[58px] items-center justify-center rounded-md px-2"
    style={{
      color: config.color,
      backgroundColor: config.bgColor,
    }}
    title={config.label}
    aria-label={config.label}
  >
    {config.icon}
  </span>
);

  if (status === "FAILED" && errorMessage) {
    const lines = errorMessage.split("\n");

    return (
      <>
        <PixelStatusStyle />

        <Popover
          placement="right"
          trigger="hover"
          title={null}
          overlayInnerStyle={{
            padding: 0,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
          }}
          content={
            <div className="w-[520px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0f172a] font-mono text-[13px] leading-[1.6]">
              <div className="flex h-10 items-center justify-between border-b border-white/10 bg-white/[0.03] px-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={[
                    "inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-200",
                    copied
                      ? "border-[#86efac]/80 bg-[#f0fdf4] text-[#16a34a]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                  style={{
                    animation: copied ? "copySuccessPop 0.28s ease" : "none",
                  }}
                >
                  {copied ? <PixelCopiedIcon /> : <PixelCopyIcon />}
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </button>
              </div>

              <div className="max-h-[240px] min-h-[120px] overflow-auto px-3 py-3">
                {lines.map((line, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-9 shrink-0 select-none pr-3 text-right text-[#64748b]">
                      {index + 1}
                    </span>

                    <span className="flex-1 whitespace-pre-wrap break-words text-[rgb(0,255,136)]">
                      {line || " "}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <span className="inline-flex cursor-pointer">{content}</span>
        </Popover>
      </>
    );
  }

  return (
    <>
      <PixelStatusStyle />
      {content}
    </>
  );
};

export default TaskStatus;