import SqlCodeEditor from '@/components/SqlCodeEditor';
import { Button, Popover, Select, Space } from 'antd';
import { Sparkles, Wand2 } from 'lucide-react';

interface Props {
  dataSourceId?: string;
  dbType?: string;
  sql: string;
  tableOptions: any[];
  sqlPopoverOpen: boolean;
  setSqlPopoverOpen: (open: boolean) => void;
  selectedSqlTable?: string;
  setSelectedSqlTable: (value?: string) => void;
  generateSqlLoading: boolean;
  onSqlChange: (value: string) => void;
  onGenerateSql: () => void;
}

export default function SinkSqlEditorSection(props: Props) {
  const {
    dataSourceId,
    dbType,
    sql,
    tableOptions,
    sqlPopoverOpen,
    setSqlPopoverOpen,
    selectedSqlTable,
    setSelectedSqlTable,
    generateSqlLoading,
    onSqlChange,
    onGenerateSql,
  } = props;

  const sqlPopoverContent = (
    <div style={{ width: 320 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <div style={{ fontSize: 13, color: '#667085' }}>选择一张目标表，自动生成写入 SQL 模板</div>

        <Select
          size="small"
          value={selectedSqlTable}
          options={tableOptions}
          placeholder="请选择目标表"
          showSearch
          optionFilterProp="rawLabel"
          style={{ width: '100%' }}
          onChange={(value) => setSelectedSqlTable(value)}
        />

        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button size="small" onClick={() => setSqlPopoverOpen(false)}>
            取消
          </Button>
          <Button
            type="primary"
            size="small"
            loading={generateSqlLoading}
            disabled={!dataSourceId || !selectedSqlTable}
            onClick={onGenerateSql}
          >
            生成 SQL
          </Button>
        </Space>
      </Space>
    </div>
  );

  return (
    <div className="workflow-panel__field workflow-panel__field--full">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#667085',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 7,
              background: 'rgba(99, 102, 241, 0.08)',
              color: '#667085',
            }}
          >
            <Sparkles size={13} />
          </span>
          <span>支持自动生成写入 SQL</span>
        </div>

        <Popover
          content={sqlPopoverContent}
          title="自动生成 SQL"
          placement="leftTop"
          trigger="click"
          open={sqlPopoverOpen}
          onOpenChange={setSqlPopoverOpen}
        >
          <Button size="small" type="text" disabled={!dataSourceId} icon={<Wand2 size={14} />} />
        </Popover>
      </div>

      <SqlCodeEditor
        value={sql}
        onChange={onSqlChange}
        dbType={dbType}
        tableOptions={tableOptions}
        placeholder={`请输入自定义写入 SQL，例如：
INSERT INTO target_table (id, name, dt)
SELECT id, name, dt
FROM temp_view`}
        minRows={5}
        maxRows={12}
      />
    </div>
  );
}
