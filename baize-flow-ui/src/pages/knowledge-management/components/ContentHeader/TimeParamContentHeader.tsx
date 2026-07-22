import React from "react";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";

import { MenuKey } from "../../types";
import { BLUE, TEXT_SECONDARY } from "../../constants/ui";

interface Props {
  activeMenu: MenuKey;
  keyword: string;
  onKeywordChange: (value: string) => void;
  onAdd: () => void;
}

const TimeParamContentHeader: React.FC<Props> = ({
  keyword,
  onKeywordChange,
  onAdd,
}) => {
  return (
    <div className="mb-5">
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "#EEF4FF",
                color: BLUE,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <h1 className="m-0 text-[20px] font-bold leading-8 text-[#101828]">
              时间变量
            </h1>
          </div>

          <p
            className="mt-[10px] max-w-[760px] text-[14px] leading-[1.8]"
            style={{ color: TEXT_SECONDARY }}
          >
            统一维护时间变量的格式、替换规则、动态表达式和默认值，方便时间参数解析与配置生成。
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={onAdd}
          className="h-10 rounded-full px-5 shadow-[0_6px_16px_rgba(63,92,214,0.18)]"
          style={{
            background: BLUE,
            borderColor: BLUE,
          }}
        >
          新增时间变量
        </Button>
      </div>

      <Input
        allowClear
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        prefix={<SearchOutlined style={{ color: "#98A2B3" }} />}
        placeholder="搜索时间变量、说明、格式、表达式"
        className="h-10 w-[420px] max-w-full rounded-full"
      />
    </div>
  );
};

export default TimeParamContentHeader;