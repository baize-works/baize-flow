import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import type { PropsWithChildren, ReactNode } from "react";
import CloseIcon from "../../../icon/CloseIcon";
import "./index.less";

interface PanelShellProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  badge?: string;
  desc?: string;
  heroTitle?: string;
  heroDesc?: string;
  heroTag?: string;
  dbType?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export default function PanelShell({
  eyebrow,
  title,
  badge,
  desc,
  heroTitle,
  heroDesc,
  heroTag,
  dbType,
  icon,
  footer,
  onClose,
  children,
}: PanelShellProps) {
  const showMiniMeta = Boolean(heroTitle || heroDesc || heroTag || dbType || icon);

  return (
    <div className="workflow-panel">
      <aside className="workflow-panel__drawer">
        <div className="workflow-panel__header">
          <div className="workflow-panel__header-main">
           
            {showMiniMeta ? (
              <div className="workflow-panel__mini-meta">
                <div className="workflow-panel__mini-meta-icon">
                  {icon || (
                    <DatabaseIcons dbType={dbType || "mysql"} width="16" height="16" />
                  )}
                </div>

                <div className="workflow-panel__mini-meta-content">
                  <div className="workflow-panel__mini-meta-title">
                    {heroTitle || dbType || "未命名节点"}
                  </div>

                  {heroDesc ? (
                    <div className="workflow-panel__mini-meta-desc">{heroDesc}</div>
                  ) : null}
                </div>

                {heroTag ? (
                  <div className="workflow-panel__mini-meta-tag">{heroTag}</div>
                ) : null}
              </div>
            ) : null}
          </div>
{/* 
          <button
            type="button"
            className="workflow-panel__close"
            onClick={onClose}
            aria-label="关闭面板"
          >
            <CloseIcon />
          </button> */}
        </div>

        <div className="workflow-panel__body">{children}</div>

        {footer ? <div className="workflow-panel__footer">{footer}</div> : null}
      </aside>
    </div>
  );
}