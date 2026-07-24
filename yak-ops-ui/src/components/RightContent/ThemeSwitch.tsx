import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useModel } from "@umijs/max";
import { Tooltip } from "antd";
import React from "react";

const ThemeSwitch: React.FC = () => {
  const { initialState, setInitialState } = useModel("@@initialState");

  const isDark = initialState?.settings?.navTheme === "realDark";

  const toggleTheme = async () => {
    const nextTheme = isDark ? "light" : "realDark";

    await setInitialState((prev) => ({
      ...prev,
      settings: {
        ...prev?.settings,
        navTheme: nextTheme,
      },
    }));

    localStorage.setItem("yak-ops-theme", nextTheme);
  };

  return (
    <Tooltip title={isDark ? "切换浅色模式" : "切换暗黑模式"}>
      <div
        onClick={toggleTheme}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 999,
          cursor: "pointer",
          fontSize: 16,
          color: "inherit",
        }}
      >
        {isDark ? <SunOutlined /> : <MoonOutlined />}
      </div>
    </Tooltip>
  );
};

export default ThemeSwitch;