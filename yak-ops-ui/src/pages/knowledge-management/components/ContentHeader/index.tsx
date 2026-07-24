import React from "react";
import { MenuProps } from "antd";
import { MenuKey } from "../../types";
import ConnectorContentHeader from "./ConnectorContentHeader";
import TimeParamContentHeader from "./TimeParamContentHeader";

interface Props {
  activeMenu: MenuKey;
  count: number;
  keyword: string;
  onKeywordChange: (value: string) => void;
  onAdd: () => void;
}

const ContentHeader: React.FC<Props> = (props) => {
  if (props.activeMenu === "connector") {
    return <ConnectorContentHeader {...props} />;
  }

  return <TimeParamContentHeader {...props} />;
};

export default ContentHeader;