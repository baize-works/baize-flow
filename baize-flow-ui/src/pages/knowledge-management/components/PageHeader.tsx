import React from "react";
import { BulbOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { BLUE, TEXT_SECONDARY } from "../constants/ui";

const { Title, Text } = Typography;

const PageHeader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: BLUE,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          <BulbOutlined />
        </div>

        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: "32px",
              color: "#101828",
            }}
          >
            知识管理
          </Title>
          <Text
            style={{
              display: "block",
              marginTop: 4,
              color: TEXT_SECONDARY,
              fontSize: 14,
            }}
          >
            统一维护参数解释、时间变量与规则配置，帮助系统更准确地生成任务配置。
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;