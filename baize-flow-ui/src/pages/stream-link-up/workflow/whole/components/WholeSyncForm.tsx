import React from "react";
import { Col, Form, Input, Radio, Row, Select } from "antd";

const { TextArea } = Input;

interface Props {
  form: any;
  sourceOption: any[];
  targetOption: any[];
  matchMode: string;
  tableKeyword: string;
  onSourceIdChange: (value: string) => void;
  onMatchModeChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
}

const WholeSyncForm: React.FC<Props> = ({
  form,
  sourceOption,
  targetOption,
  matchMode,
  tableKeyword,
  onSourceIdChange,
  onMatchModeChange,
  onKeywordChange,
}) => {
  return (
    <Form form={form} initialValues={{ matchMode: "1" }}>
      <Row gutter={24} style={{ marginBottom: 4 }}>
        <Col span={12}>
          <Form.Item
            label="数据源"
            name="sourceId"
            rules={[{ required: true }]}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            className="custom-form-item"
          >
            <Select
              size="small"
              style={{ width: "99%" }}
              placeholder="请选择库名"
              showSearch
              options={sourceOption}
              onChange={onSourceIdChange}
            />
          </Form.Item>

          <Form.Item
            name="matchMode"
            label="表名匹配"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            className="custom-form-item"
          >
            <Radio.Group
              size="small"
              value={matchMode}
              onChange={(e) => onMatchModeChange(e.target.value)}
            >
              <Radio value="1">自定义</Radio>
              <Radio value="2">正则匹配</Radio>
              <Radio value="3">精准匹配</Radio>
              <Radio value="4">整库</Radio>
            </Radio.Group>
          </Form.Item>

          {(matchMode === "2" || matchMode === "3") && (
            <Form.Item
              label={null}
              name="sourceTable"
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              className="custom-form-item"
            >
              <TextArea
                placeholder="请输入表名关键字（最大1000个匹配）"
                rows={4}
                style={{
                  width: "99%",
                  marginBottom: 8,
                  marginLeft: "14%",
                }}
                value={tableKeyword}
                onChange={(e) => onKeywordChange(e.target.value)}
              />
            </Form.Item>
          )}
        </Col>

        <Col span={12}>
          <Form.Item
            label="数据源"
            name="sinkId"
            rules={[{ required: true }]}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 18 }}
            className="custom-form-item"
          >
            <Select
              size="small"
              style={{ width: "99%" }}
              placeholder="请选择库名"
              showSearch
              options={targetOption}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default WholeSyncForm;