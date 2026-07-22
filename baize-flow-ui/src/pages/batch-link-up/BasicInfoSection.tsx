import Header from "@/components/Header";
import { useIntl } from "@umijs/max";
import { Descriptions } from "antd";
import React from "react";
import DatabaseIcons from "../data-source/icon/DatabaseIcons";

import { DoubleRightOutlined } from "@ant-design/icons";

interface TaskDetailPanelProps {
  item: any;
}

const AnimatedSyncArrow: React.FC = () => {
  return (
    <span className="mx-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-50 text-blue-500 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
      <style>
        {`
          @keyframes syncArrowMove {
            0%, 100% {
              transform: translateX(0);
              opacity: 0.72;
            }
            50% {
              transform: translateX(4px);
              opacity: 1;
            }
          }
        `}
      </style>

      <DoubleRightOutlined
        style={{
          fontSize: 10,
          animation: "syncArrowMove 1.8s ease-in-out infinite",
        }}
      />
    </span>
  );
};

const BasicInfoSection: React.FC<TaskDetailPanelProps> = ({ item }) => {
  const intl = useIntl();
  console.log(item);

  return (
    <div className="m-4 rounded bg-white p-4 shadow-[0_2px_6px_#0000000d]">
      <div className="flex items-center justify-between">
        <Header
          title={
            <span className="text-sm">
              {intl.formatMessage({
                id: "pages.job.detail.basicInfo",
                defaultMessage: "Basic Info",
              })}
            </span>
          }
        />

        <div className="w-[150px]">{/* reserved actions */}</div>
      </div>

      <Descriptions column={2} labelStyle={{ color: "rgba(128,128,128,1)" }}>
        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.jobCode",
            defaultMessage: "Job Instance ID",
          })}
        >
          <span className="pl-3 text-black">{item?.id || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.syncPlan",
            defaultMessage: "Sync Plan",
          })}
        >
          <div className="flex items-center pl-3 text-black">
            {item?.sourceType && (
              <DatabaseIcons dbType={item?.sourceType} width="20" height="20" />
            )}

            <AnimatedSyncArrow />

            {item?.sinkType && (
              <span className="ml-3 flex items-center">
                <DatabaseIcons dbType={item?.sinkType} width="20" height="20" />
              </span>
            )}
          </div>
        </Descriptions.Item>

        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.startTime",
            defaultMessage: "Start Time",
          })}
        >
          <span className="pl-3 text-black">{item?.startTime || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          span={4}
          label={intl.formatMessage({
            id: "pages.job.detail.endTime",
            defaultMessage: "End Time",
          })}
        >
          <span className="pl-3 text-black">{item?.endTime || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.jobVersion",
            defaultMessage: "Job Version",
          })}
        >
          <span className="pl-3 text-black">{item?.jobVersion || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          span={4}
          label={intl.formatMessage({
            id: "pages.job.detail.jobDescription",
            defaultMessage: "Job Description",
          })}
        >
          <span className="pl-3 text-black">{item?.jobDesc || "-"}</span>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default BasicInfoSection;
