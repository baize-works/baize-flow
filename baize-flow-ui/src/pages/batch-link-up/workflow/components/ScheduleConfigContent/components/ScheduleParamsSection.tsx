import {
  fetchTimeVariableList,
  previewTimeVariable,
} from "@/pages/knowledge-management/api";
import { PlusOutlined } from "@ant-design/icons";
import { Popover, Space, Typography, message } from "antd";
import React, { useEffect, useState } from "react";
import ParamTable from "./ParamTable";

const { Paragraph, Text } = Typography;
interface Props {
  value?: any;
  onChange?: (patch: Record<string, any>) => void;
}

const { Link } = Typography;

const ScheduleParamsSection: React.FC<Props> = ({ value, onChange }) => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [previewResult, setPreviewResult] = useState<string | null>(null); // Store the preview result here
  const [isPopoverVisible, setPopoverVisible] = useState<boolean>(false); // Track visibility of Popover

  useEffect(() => {
    if (value?.paramsList) {
      setDataSource(value?.paramsList ?? []);
    }
  }, [value?.paramsList]);

  const [timeVariableKeys, setTimeVariableKeys] = useState<any[]>([]);

  useEffect(() => {
    const loadTimeVariables = async () => {
      try {
        const response = await fetchTimeVariableList();
        setTimeVariableKeys(response.data || []);
      } catch (error) {
        console.error("Failed to load time variables:", error);
      }
    };

    loadTimeVariables();
  }, []);

  const handleAdd = () => {
    const nextList = [
      ...dataSource,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        paramName: "",
        paramValue: "",
      },
    ];

    onChange?.({
      paramsList: nextList,
    });
  };

  const handleEdit = (record: any) => {
    const newList = [...dataSource];
    const index = newList.findIndex((item) => item.key === record.key);
    if (index >= 0) {
      newList[index] = {
        ...newList[index],
        paramName: record.paramName,
        paramValue: record.paramValue,
      };

      onChange?.({
        paramsList: newList,
      });
    }
  };

  const handleDelete = (key: string) => {
    const newList = dataSource.filter((item: any) => item.key !== key);
    console.log(newList);
    onChange?.({
      paramsList: newList,
    });
  };

  // Handle preview click to fetch and show time variable preview
  const handlePreview = async () => {
    const selectedVariables = dataSource.map((item) => item.paramValue); // Assuming paramName holds time expressions
    const timeFormat = "yyyy-MM-dd HH:mm:ss"; // You can adjust this based on your needs

    try {
      const response = await previewTimeVariable({
        expression: selectedVariables.join(", "), // Send selected variables as expression
        timeFormat: timeFormat,
      });

      // Assuming response contains a 'value' field with the preview result
      setPreviewResult(response.data.value); // Store the result in state
      setPopoverVisible(true); // Show the Popover with the result
    } catch (error) {
      message.error("Failed to fetch preview.");
      console.error("Error during preview:", error);
    }
  };

  // Preview content inside Popover
  const previewContent = (
    <div className="max-w-xs min-w-[200px] rounded-lg  bg-white" style={{padding: "4px 0"}}>
      <p className="mb-2 text-sm font-semibold text-gray-700">
        🌟 <span className="text-blue-600">时间变量预览</span>{" "}
        帮助您快速理解时间表达式的效果！
      </p>
      {previewResult ? (
        <p className="text-sm text-green-500">
          🕒 <span className="font-semibold">预览结果:</span> {previewResult} 
        </p>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-t-2 border-gray-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">正在加载预览... 请稍等哦⏳</p>
        </div>
      )}
    </div>
  );
  return (
    <div className="schedule-section-body">
      <div className="schedule-link-row">
        <Space size={8}>
          <Link
            className="inline-flex h-7 items-center justify-center gap-1 rounded-[10px] border px-2.5 text-[13px] font-medium"
            onClick={handleAdd}
          >
            <PlusOutlined className="text-xs" />
            添加时间变量
          </Link>

          <Popover
            content={previewContent} // Use the previewContent here
            title="参数预览"
            trigger="click"
            visible={isPopoverVisible} 
            onVisibleChange={(visible) => setPopoverVisible(visible)} 
          >
            <Link
              className="inline-flex h-7 items-center justify-center gap-1 rounded-[10px] border px-2.5 text-[13px] font-medium"
              onClick={handlePreview} 
            >
              参数预览
            </Link>
          </Popover>
        </Space>
      </div>

      <ParamTable
        dataSource={dataSource}
        onChange={handleEdit}
        onDelete={handleDelete}
        timeVariableKeys={timeVariableKeys}
      />
    </div>
  );
};

export default ScheduleParamsSection;
