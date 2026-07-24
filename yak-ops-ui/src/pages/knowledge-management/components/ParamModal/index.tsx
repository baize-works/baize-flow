import React from "react";
import { MenuKey, ParamItem } from "../../types";
import ConnectorParamModal from "./ConnectorParamModal";
import TimeParamModal from "./TimeParamModal";

interface Props {
  activeMenu: MenuKey;
  open: boolean;
  editingRecord: ParamItem | null;
  submitting: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const ParamModal: React.FC<Props> = (props) => {
  if (props.activeMenu === "connector") {
    return <ConnectorParamModal {...props} />;
  }

  return <TimeParamModal {...props} />;
};

export default ParamModal;