import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Popover, Select, Spin, Tooltip } from "antd";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { fetchConnectorParamOptions } from "@/pages/knowledge-management/api";

interface ExtraParamItem {
  key: string;
  value: string;
}

interface ConnectorParamOptionVO {
  value: string;
  label?: string;
  description?: string;
  defaultValue?: string;
  exampleValue?: string;
  paramType?: string;
  requiredFlag?: number;
}

interface ExtraParamsConfigProps {
  params: ExtraParamItem[];
  onParamsChange: (params: ExtraParamItem[]) => void;
  selectedNode: {
    id: string;
    data: {
      text?: string;
      dbType?: string;
      connectorType?: string;
      connectorName?: string;
    };
  };
  hideHeader?: boolean;
}

const DEFAULT_CONNECTOR_NAME = "Jdbc";
const DEFAULT_PARAM_TYPE = "connector";

const ExtraParamsConfig: FC<ExtraParamsConfigProps> = ({
  params,
  onParamsChange,
  selectedNode,
  hideHeader = false,
}) => {
  const [paramOptions, setParamOptions] = useState<ConnectorParamOptionVO[]>([]);
  const [loading, setLoading] = useState(false);
  console.log(selectedNode);
  const connectorName = selectedNode?.data?.connectorName || DEFAULT_CONNECTOR_NAME;

  useEffect(() => {
    let ignore = false;

    const loadOptions = async () => {
      try {
        setLoading(true);

        const res = await fetchConnectorParamOptions({
          type: DEFAULT_PARAM_TYPE,
          connectorName,
          connectorType: "source",
        });

        if (ignore) {
          return;
        }

        setParamOptions(res?.data || []);
      } catch (error) {
        if (!ignore) {
          setParamOptions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      ignore = true;
    };
  }, [connectorName]);

  const selectedKeys = useMemo(() => {
    return params.map((item) => item.key).filter(Boolean);
  }, [params]);

  const selectOptions = useMemo(() => {
    return paramOptions.map((item) => ({
      value: item.value,
      label: (
        <Popover
          placement="left"
          overlayStyle={{ maxWidth: 360 }}
          content={
            <div className="workflow-panel__param-popover">
              <div>
                参数：<span>{item.value}</span>
              </div>

              {item.description ? (
                <div>
                  简介：<span>{item.description}</span>
                </div>
              ) : null}

              {item.defaultValue ? (
                <div>
                  默认值：<span>{item.defaultValue}</span>
                </div>
              ) : null}

              {item.exampleValue ? (
                <div>
                  示例：<span>{item.exampleValue}</span>
                </div>
              ) : null}

              {item.paramType ? (
                <div>
                  类型：<span>{item.paramType}</span>
                </div>
              ) : null}
            </div>
          }
        >
          <div className="workflow-panel__param-option">
            <span className="workflow-panel__param-option-name">
              {item.value}
            </span>
            {item.label ? (
              <span className="workflow-panel__param-option-desc">
                （{item.label}）
              </span>
            ) : null}
          </div>
        </Popover>
      ),
    }));
  }, [paramOptions]);

  const handleAddParam = () => {
    onParamsChange([...params, { key: "", value: "" }]);
  };

  const handleParamChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const draft = [...params];

    if (field === "key") {
      const selectedOption = paramOptions.find((item) => item.value === value);

      draft[index] = {
        ...draft[index],
        key: value,
        value: draft[index]?.value || selectedOption?.defaultValue || "",
      };

      onParamsChange(draft);
      return;
    }

    draft[index] = {
      ...draft[index],
      value,
    };

    onParamsChange(draft);
  };

  const handleRemoveParam = (index: number) => {
    const draft = [...params];
    draft.splice(index, 1);
    onParamsChange(draft);
  };

  const renderHeader = () => {
    if (hideHeader) {
      return (
        <div
          className="workflow-panel__params-toolbar"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="workflow-panel__group-head">
            <div className="workflow-panel__group-kicker">额外参数</div>
          </div>

          <Tooltip title="添加一个额外参数">
            <button
              type="button"
              className="workflow-panel__icon-btn"
              onClick={handleAddParam}
            >
              <PlusOutlined />
            </button>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className="workflow-panel__params-head">
        <div className="workflow-panel__params-title">参数列表</div>

        <Tooltip title="添加一个额外参数">
          <button
            type="button"
            className="workflow-panel__icon-btn"
            onClick={handleAddParam}
          >
            <PlusOutlined />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="workflow-panel__params">
      {renderHeader()}

      {params.length === 0 ? (
        <div className="workflow-panel__empty">
          {loading ? "正在加载参数元数据..." : "暂无额外参数"}
        </div>
      ) : (
        <div className="workflow-panel__params-list">
          {params.map((param, idx) => {
            const currentKey = param.key;

            const options = selectOptions.map((option) => {
              const disabled =
                !!option.value &&
                option.value !== currentKey &&
                selectedKeys.includes(option.value);

              return {
                ...option,
                disabled,
              };
            });

            return (
              <div className="workflow-panel__param-row" key={idx}>
                <Select
                  value={param.key || undefined}
                  onChange={(value) => handleParamChange(idx, "key", value)}
                  options={options}
                  placeholder={loading ? "参数加载中..." : "选择参数"}
                  showSearch
                  loading={loading}
                  disabled={loading}
                  optionFilterProp="value"
                  className="workflow-panel__antd-select workflow-panel__param-key"
                  popupClassName="workflow-panel__dropdown"
                  notFoundContent={
                    loading ? (
                      <Spin size="small" />
                    ) : (
                      <span>暂无可选参数</span>
                    )
                  }
                />

                <Input
                  value={param.value}
                  onChange={(e) =>
                    handleParamChange(idx, "value", e.target.value)
                  }
                  placeholder="输入参数值"
                  className="workflow-panel__param-value"
                  suffix={
                    <DeleteOutlined
                      onClick={() => handleRemoveParam(idx)}
                      style={{ cursor: "pointer", color: "#98A2B3" }}
                    />
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExtraParamsConfig;