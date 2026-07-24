import SqlCodeEditor from '@/components/SqlCodeEditor';
import { Button, message } from 'antd';
import { memo, useEffect, useMemo } from 'react';
import PanelShell from '../PanelShell';

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;

  /**
   * 根据画布连接关系同步：
   * pluginInput = 直接上游节点 ID
   * pluginOutput = 直接下游节点 ID
   */
  syncTransformPluginConfig: (nodeId: string) => {
    pluginInput?: string;
    pluginOutput?: string;
  };
}

function SqlTransformPanel({
  selectedNode,
  onClose,
  onNodeDataChange,
  getDirectUpstreamSchema,
  refreshNodeSchema,
  refreshDownstreamSchemas,
  syncTransformPluginConfig,
}: Props) {
  const nodeId = selectedNode?.id;

  const title = selectedNode?.data?.title || selectedNode?.data?.label || 'SQL 脚本';

  const description = selectedNode?.data?.description || '支持自定义转换 SQL';

  const config = selectedNode?.data?.config || {};
  const sql = config.sql || '';

  const upstreamSchema = useMemo(() => {
    if (!nodeId) {
      return [];
    }

    return getDirectUpstreamSchema(nodeId) || [];
  }, [nodeId, getDirectUpstreamSchema]);

  /**
   * 同步上游字段元数据。
   */
  useEffect(() => {
    if (!nodeId) {
      return;
    }

    onNodeDataChange(nodeId, {
      meta: {
        inputSchema: upstreamSchema,
      },
    });
  }, [nodeId, upstreamSchema, onNodeDataChange]);

  const handleSqlChange = (value: string) => {
    if (!nodeId) {
      return;
    }

    /**
     * 必须保留已有 config。
     *
     * 否则当 onNodeDataChange 是浅合并时，
     * 修改 SQL 可能会把已经写入的 pluginInput/pluginOutput 覆盖掉。
     */
    onNodeDataChange(nodeId, {
      config: {
        ...config,
        sql: value,
      },
    });
  };

  const handleApply = () => {
    if (!nodeId) {
      message.warning('当前节点不存在');
      return;
    }

    const nextSql = String(sql || '').trim();

    if (!nextSql) {
      message.warning('请输入 SQL 转换脚本');
      return;
    }

    /**
     * 参考 FieldMapper：
     * 从当前画布连接关系重新获取上下游节点。
     */
    const syncedPluginConfig = syncTransformPluginConfig(nodeId) || {};

    const pluginInput = syncedPluginConfig.pluginInput;
    const pluginOutput = syncedPluginConfig.pluginOutput;

    if (!pluginInput) {
      message.warning('请先连接上游节点');
      return;
    }

    if (!pluginOutput) {
      message.warning('请先连接下游节点');
      return;
    }

    onNodeDataChange(nodeId, {
      config: {
        ...config,

        sql: nextSql,

        /**
         * 前端节点配置使用 camelCase。
         */
        pluginInput,
        pluginOutput,
      },
      meta: {
        ...(selectedNode?.data?.meta || {}),
        inputSchema: upstreamSchema,
      },
    });

    /**
     * 解析当前 SQL 节点输出字段，
     * 并继续刷新后续节点的输入字段。
     */
    refreshNodeSchema(nodeId);
    refreshDownstreamSchemas(nodeId);

    message.success('SQL 脚本已应用');
  };

  return (
    <PanelShell
      eyebrow="Transform Config"
      title="SQL 转换"
      badge="处理节点"
      desc="基于上游字段编写自定义转换逻辑"
      heroTitle={title}
      heroDesc={description}
      heroTag="SQL"
      onClose={onClose}
      footer={
        <button type="button" className="workflow-panel__btn workflow-panel__btn--ghost" onClick={onClose}>
          关闭
        </button>
      }
    >
      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">脚本配置</div>

          <div className="workflow-panel__section-tip">SQL</div>
        </div>

        <SqlCodeEditor
          value={sql}
          onChange={handleSqlChange}
          dbType={selectedNode?.data?.dbType}
          schemaFields={upstreamSchema}
          placeholder="请输入 SQL 转换脚本"
          minRows={10}
          maxRows={16}
        />

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={handleApply}>
            应用脚本
          </Button>
        </div>
      </section>
    </PanelShell>
  );
}

export default memo(SqlTransformPanel);
