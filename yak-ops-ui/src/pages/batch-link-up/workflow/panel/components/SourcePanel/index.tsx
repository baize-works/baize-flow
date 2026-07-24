import { Button, Divider, Segmented, Select, Tooltip } from 'antd';
import { BarChart3, Database, Eye, FileCode2, Table2 } from 'lucide-react';
import { memo, useRef } from 'react';
import PanelShell from '../PanelShell';
import ExtraParamsConfig from './ExtraParamsConfig';

import QualityDetail from '@/pages/batch-link-up/DataViewSQL';
import { useSourcePanelLogic } from './hooks/useSourcePanelLogic';
import './index.less';
import SqlEditorSection from './SqlEditorSection';

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  scheduleConfig: any;
}

function SourcePanel({ selectedNode, onClose, onNodeDataChange, scheduleConfig }: Props) {
  const qualityDetailRef = useRef<any>(null);

  const {
    title,
    dbType,
    description,
    dataSourceId,
    readMode,
    table,
    sql,
    extraParams,

    dataSourceOptions,
    tableOptions,
    tableLoading,

    sqlPopoverOpen,
    setSqlPopoverOpen,
    resolvePopoverOpen,
    selectedSqlTable,
    setSelectedSqlTable,
    generateSqlLoading,
    resolveSqlLoading,
    resolvedSqlPreview,

    updateNode,
    handleDataSourceChange,
    handleReadModeChange,
    handlePreview,
    handleGenerateSql,
    handleResolveSqlPreview,
    handleOpenResolvePopover,
    viewLoading,
    handleResolveColumns,
  } = useSourcePanelLogic({
    selectedNode,
    onNodeDataChange,
    qualityDetailRef,
    scheduleConfig,
  });

  return (
    <>
      <PanelShell
        eyebrow="Source Config"
        title="来源配置"
        badge="输入节点"
        desc="修改后会实时同步到当前画布节点"
        heroTitle={title}
        heroDesc={description}
        heroTag="SOURCE"
        dbType={dbType}
        onClose={onClose}
        footer={
          <button type="button" className="workflow-panel__btn workflow-panel__btn--ghost" onClick={onClose}>
            关闭
          </button>
        }
      >
        <section className="workflow-panel__section">
          <div className="workflow-panel__group">
            <div className="workflow-panel__group-head">
              <div className="workflow-panel__group-kicker">数据源</div>
            </div>

            <div className="workflow-panel__meta-card workflow-panel__meta-card--compact">
              <div className="workflow-panel__meta-icon">
                <Database size={16} />
              </div>
              <Select
                value={dataSourceId}
                onChange={handleDataSourceChange}
                options={dataSourceOptions}
                placeholder="请选择来源数据源"
                showSearch
                optionFilterProp="label"
                className="workflow-panel__antd-select"
                style={{ width: '100%' }}
                popupClassName="workflow-panel__dropdown"
              />
            </div>
          </div>

          <div className="workflow-panel__divider" />

          <div className="workflow-panel__group">
            <div className="workflow-panel__group-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="workflow-panel__group-kicker">读取方式</div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="预览读取结果样例数据">
                  <Button
                    size="small"
                    type="text"
                    icon={<Eye size={14} />}
                    onClick={handlePreview}
                    loading={viewLoading}
                  >
                    预览
                  </Button>
                </Tooltip>

                <Divider type="vertical" style={{ padding: 0, margin: '0 4px' }} />

                <Tooltip title="解析当前读取配置下的字段信息">
                  <Button onClick={handleResolveColumns} size="small" type="text" icon={<BarChart3 size={14} />}>
                    字段解析
                  </Button>
                </Tooltip>
              </div>
            </div>

            <Segmented
              block
              value={readMode}
              onChange={(value) => handleReadModeChange(String(value))}
              options={[
                {
                  label: (
                    <div className="workflow-panel__segmented-item">
                      <Table2 size={14} />
                      <span>按表读取</span>
                    </div>
                  ),
                  value: 'table',
                },
                {
                  label: (
                    <div className="workflow-panel__segmented-item">
                      <FileCode2 size={14} />
                      <span>自定义 SQL</span>
                    </div>
                  ),
                  value: 'sql',
                },
              ]}
            />

            {readMode === 'table' ? (
              <div className="workflow-panel__field workflow-panel__field--full">
                <Select
                  value={table}
                  onChange={(value) =>
                    updateNode({ table: value }, undefined, {
                      outputSchema: [],
                      schemaStatus: 'idle',
                      schemaError: '',
                    })
                  }
                  options={tableOptions}
                  loading={tableLoading}
                  placeholder="请选择来源表"
                  className="workflow-panel__antd-select"
                  style={{ width: '100%' }}
                  popupClassName="workflow-panel__dropdown"
                  showSearch
                  optionFilterProp="rawLabel"
                />
              </div>
            ) : (
              <SqlEditorSection
                sourceDataSourceId={dataSourceId}
                dbType={dbType}
                sql={sql}
                tableOptions={tableOptions}
                sqlPopoverOpen={sqlPopoverOpen}
                setSqlPopoverOpen={setSqlPopoverOpen}
                resolvePopoverOpen={resolvePopoverOpen}
                selectedSqlTable={selectedSqlTable}
                setSelectedSqlTable={setSelectedSqlTable}
                generateSqlLoading={generateSqlLoading}
                resolveSqlLoading={resolveSqlLoading}
                resolvedSqlPreview={resolvedSqlPreview}
                onSqlChange={(value: any) =>
                  updateNode({ sql: value }, undefined, {
                    outputSchema: [],
                    schemaStatus: 'idle',
                    schemaError: '',
                  })
                }
                onGenerateSql={handleGenerateSql}
                onResolveSqlPreview={handleResolveSqlPreview}
                onOpenResolvePopover={handleOpenResolvePopover}
              />
            )}
          </div>

          <div className="workflow-panel__divider" />

          <div className="workflow-panel__group">
            <ExtraParamsConfig
              params={extraParams}
              onParamsChange={(params) => updateNode({ extraParams: params })}
              selectedNode={selectedNode}
              hideHeader
            />
          </div>
        </section>
      </PanelShell>
      <QualityDetail ref={qualityDetailRef} />
    </>
  );
}

export default memo(SourcePanel);
