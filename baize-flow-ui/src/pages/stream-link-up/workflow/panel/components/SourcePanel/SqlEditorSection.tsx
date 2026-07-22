import SqlCodeEditor from '@/components/SqlCodeEditor';
import { Button, Popover, Select, Space } from 'antd';
import { Sparkles, Variable, Wand2 } from 'lucide-react';

interface Props {
  sourceDataSourceId?: string;
  dbType?: string;
  sql: string;
  tableOptions: any[];
  sqlPopoverOpen: boolean;
  setSqlPopoverOpen: (open: boolean) => void;
  resolvePopoverOpen: boolean;
  selectedSqlTable?: string;
  setSelectedSqlTable: (value?: string) => void;
  generateSqlLoading: boolean;
  resolveSqlLoading: boolean;
  resolvedSqlPreview: string;
  onSqlChange: (value: string) => void;
  onGenerateSql: () => void;
  onResolveSqlPreview: () => void;
  onOpenResolvePopover: (open: boolean) => void;
}

export default function SqlEditorSection(props: Props) {
  const {
    sourceDataSourceId,
    dbType,
    sql,
    tableOptions,
    sqlPopoverOpen,
    setSqlPopoverOpen,
    resolvePopoverOpen,
    selectedSqlTable,
    setSelectedSqlTable,
    generateSqlLoading,
    resolveSqlLoading,
    resolvedSqlPreview,
    onSqlChange,
    onGenerateSql,
    onResolveSqlPreview,
    onOpenResolvePopover,
  } = props;

  const sqlPopoverContent = (
    <div style={{ width: 320 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <div style={{ fontSize: 13, color: '#667085' }}>选择一张表，自动生成查询 SQL</div>

        <Select
          size="small"
          value={selectedSqlTable}
          options={tableOptions}
          placeholder="请选择表"
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
            disabled={!sourceDataSourceId || !selectedSqlTable}
            onClick={onGenerateSql}
          >
            生成 SQL
          </Button>
        </Space>
      </Space>
    </div>
  );

  const resolvePopoverContent = (
    <div style={{ width: 460 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <div style={{ fontSize: 13, color: '#667085' }}>
          这里展示的是当前 SQL 模板解析后的预览结果，不会替换原始 SQL。
        </div>

        <div
          style={{
            maxHeight: 220,
            overflow: 'auto',
            padding: 12,
            borderRadius: 10,
            background: '#F8FAFC',
            border: '1px solid #E5E7EB',
            color: '#344054',
            fontSize: 12,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {resolveSqlLoading ? '正在解析...' : resolvedSqlPreview || '暂无解析结果'}
        </div>

        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button size="small" onClick={onResolveSqlPreview} loading={resolveSqlLoading}>
            重新解析
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
          <span>支持自动生成 SQL</span>
        </div>

        <Space size={8}>
          <Popover
            content={resolvePopoverContent}
            title="变量解析预览"
            placement="leftTop"
            trigger="click"
            open={resolvePopoverOpen}
            onOpenChange={onOpenResolvePopover}
          >
            <Button size="small" type="text" disabled={!sourceDataSourceId || !sql} icon={<Variable size={14} />} />
          </Popover>

          <Popover
            content={sqlPopoverContent}
            title="自动生成 SQL"
            placement="leftTop"
            trigger="click"
            open={sqlPopoverOpen}
            onOpenChange={setSqlPopoverOpen}
          >
            <Button size="small" type="text" disabled={!sourceDataSourceId} icon={<Wand2 size={14} />} />
          </Popover>
        </Space>
      </div>

      <SqlCodeEditor
        value={sql}
        onChange={onSqlChange}
        dbType={dbType}
        tableOptions={tableOptions}
        placeholder={`请输入自定义 SQL，例如：
SELECT id, name
FROM users
WHERE create_time >= \${var:today_start}`}
        minRows={5}
        maxRows={12}
      />
    </div>
  );
}
