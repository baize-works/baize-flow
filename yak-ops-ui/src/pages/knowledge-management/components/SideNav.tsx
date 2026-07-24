import React from "react";
import { MenuKey } from "../types";
import { BLUE, BLUE_LIGHT, BORDER_COLOR, menuList } from "../constants/ui";

interface Props {
  activeMenu: MenuKey;
  onChange: (key: MenuKey) => void;
  onResetSelection: () => void;
}

const SideNav: React.FC<Props> = ({
  activeMenu,
  onChange,
  onResetSelection,
}) => {
  return (
    <div
      style={{
        borderRight: `1px solid ${BORDER_COLOR}`,
        background: "#fcfcfd",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#344054",
          marginBottom: 14,
        }}
      >
        知识分类
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {menuList.map((item) => {
          const active = item.key === activeMenu;

          return (
            <div
              key={item.key}
              onClick={() => {
                onChange(item.key);
                onResetSelection();
              }}
              style={{
                borderRadius: 16,
                padding: "14px 14px",
                cursor: "pointer",
                border: active ? "1px solid #c7d2fe" : "1px solid #eaecf0",
                background: active ? BLUE_LIGHT : "#fff",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active ? "#dfe6ff" : "#f2f4f7",
                    color: active ? BLUE : "#667085",
                    fontSize: 14,
                  }}
                >
                  {item.icon}
                </span>

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: active ? BLUE : "#101828",
                  }}
                >
                  {item.label}
                </span>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: active ? "#5b6b8a" : "#98a2b3",
                  lineHeight: 1.7,
                  paddingLeft: 38,
                }}
              >
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SideNav;