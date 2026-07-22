import { TableOutlined } from "@ant-design/icons";
import { Col, Form, Input, Row, Select, Switch } from "antd";
import { FC } from "react";

interface SingleTableSinkProps {
  form: any;
  sinkTableOption: any[];
  selectedType: any;
  onTableChange: (value: string) => void;
  setAutoCreateTable: (value: any) => void;
  autoCreateTable: any;
}

const SingleTableSink: FC<SingleTableSinkProps> = ({
  form,
  sinkTableOption,
  selectedType,
  onTableChange,
  setAutoCreateTable,
  autoCreateTable,
}) => {
  return (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="Create Table"
            name="generate_sink_sql"
            rules={[{ required: true }]}
          >
            <Switch
              onChange={(checked: boolean) => {
                form.setFieldsValue({
                  table: undefined,
                });
                setAutoCreateTable(checked);
              }}
              checked={autoCreateTable}
            />
          </Form.Item>
        </Col>
      </Row>

      {!autoCreateTable ? (
        <Form.Item label="Table" name="table" rules={[{ required: true }]}>
          <Select
            prefix={<TableOutlined style={{ color: "orange" }} />}
            size="small"
            placeholder="select table"
            allowClear
            onChange={onTableChange}
            options={sinkTableOption || []}
            showSearch
          />
        </Form.Item>
      ) : (
        <Form.Item label="Table" name="table" rules={[{ required: true }]}>
          <Input
            prefix={<TableOutlined style={{ color: "orange" }} />}
            size="small"
            placeholder="input table"
          />
        </Form.Item>
      )}
    </>
  );
};

export default SingleTableSink;
