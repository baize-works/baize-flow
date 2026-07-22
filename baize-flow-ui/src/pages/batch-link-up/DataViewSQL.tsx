import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Drawer, Table, Tag, Empty } from "antd";
import { DatabaseOutlined, InfoCircleFilled } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import "./index.less";

const QualityDetail = forwardRef((_: any, ref: any) => {
  const intl = useIntl();

  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  const onOpen = (status: boolean, content: any) => {
    const { columns, data, total } = content?.data || {};

    setColumns(columns || []);
    setData(data || []);
    setTotal(Number(total || 0));
    setVisible(status);
  };

  const onClose = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    onOpen,
  }));

  const tableWidth = useMemo(() => {
    return (columns?.length || 0) * 180;
  }, [columns]);

  return (
    <Drawer
      className="quality-detail-drawer"
      title={
        <div className="quality-detail-drawer__title">
          <div className="quality-detail-drawer__title-left">
            <div className="quality-detail-drawer__icon">
              <DatabaseOutlined />
            </div>

            <div className="quality-detail-drawer__title-content">
              <div className="quality-detail-drawer__heading">
                {intl.formatMessage({
                  id: "pages.quality.preview.title",
                  defaultMessage: "Data Preview",
                })}
              </div>
              <div className="quality-detail-drawer__subtext">
                {intl.formatMessage({
                  id: "pages.quality.preview.desc",
                  defaultMessage:
                    "Preview sample rows for the current query result",
                })}
              </div>
            </div>
          </div>

          <div className="quality-detail-drawer__meta">
            <Tag className="quality-detail-drawer__tag">
              {`${columns?.length || 0} Columns`}
            </Tag>
            <Tag className="quality-detail-drawer__tag">
              {`${data?.length || 0} Preview Rows`}
            </Tag>
            <Tag className="quality-detail-drawer__tag quality-detail-drawer__tag--total">
              {`${total} Total Rows`}
            </Tag>
          </div>
        </div>
      }
      open={visible}
      footer={null}
      placement="bottom"
      onClose={onClose}
      height={520}
    >
      <div className="quality-detail-drawer__body">
        <div className="quality-detail-drawer__tip">
          <InfoCircleFilled className="quality-detail-drawer__tip-icon" />
          <span className="quality-detail-drawer__tip-text">
            仅展示当前读取配置下的样例数据，共 {total} 条，当前预览{" "}
            {data?.length || 0} 条
          </span>
        </div>

        <div className="quality-detail-drawer__table-wrap">
          <Table
            rowKey={(_, index) => String(index)}
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: tableWidth, y: 360 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({
                    id: "pages.quality.preview.empty",
                    defaultMessage: "No preview data",
                  })}
                />
              ),
            }}
          />
        </div>
      </div>
    </Drawer>
  );
});

export default QualityDetail;