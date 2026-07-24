import {
  autocompletion,
  closeCompletion,
  completionKeymap,
  completionStatus,
  startCompletion,
  type Completion,
  type CompletionContext,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { HighlightStyle, bracketMatching, foldGutter, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { type Extension, Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, tooltips } from '@codemirror/view';
import {
  MSSQL,
  MariaSQL,
  MySQL,
  PLSQL,
  PostgreSQL,
  SQLite,
  StandardSQL,
  sql,
  type SQLConfig,
  type SQLDialect,
  type SQLNamespace,
} from '@codemirror/lang-sql';
import { tags } from '@lezer/highlight';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { Maximize2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

type SqlSchemaField = {
  name?: string;
  originFieldName?: string;
  type?: string;
  comment?: string;
};

type SqlTableOption = {
  value?: string | number;
  rawLabel?: string;
  description?: string;
};

interface SqlCodeEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dbType?: string;
  schemaFields?: SqlSchemaField[];
  tableOptions?: SqlTableOption[];
  variables?: string[];
  minRows?: number;
  maxRows?: number;
  className?: string;
  showLineNumbers?: boolean;
  expandable?: boolean;
  fullscreenTitle?: string;
}

const DEFAULT_MIN_ROWS = 5;
const DEFAULT_MAX_ROWS = 12;
const FULLSCREEN_MIN_ROWS = 18;
const FULLSCREEN_MAX_ROWS = 28;
const LINE_HEIGHT = 24;
const VERTICAL_PADDING = 20;
const SQL_COMPLETION_TOKEN_PATTERN = /(?:\$\{var:)?[A-Za-z_$][\w$:{.-]*$/;

const SQL_KEYWORD_COMPLETIONS: Completion[] = [
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'FULL JOIN',
  'ON',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'DISTINCT',
  'AS',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'CAST',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'COALESCE',
  'DATE_FORMAT',
].map((label) => ({
  label,
  type: 'keyword',
  detail: 'SQL 关键字',
}));

const SQL_SNIPPET_COMPLETIONS: Completion[] = [
  {
    label: 'SELECT * FROM',
    type: 'keyword',
    detail: '查询模板',
    apply: 'SELECT *\nFROM ',
  },
  {
    label: 'SELECT FROM WHERE',
    type: 'keyword',
    detail: '过滤查询模板',
    apply: 'SELECT \nFROM \nWHERE ',
  },
  {
    label: 'INSERT INTO SELECT',
    type: 'keyword',
    detail: '写入模板',
    apply: 'INSERT INTO  ()\nSELECT \nFROM ',
  },
  {
    label: 'LEFT JOIN',
    type: 'keyword',
    detail: '关联查询',
    apply: 'LEFT JOIN  ON ',
  },
  {
    label: 'GROUP BY',
    type: 'keyword',
    detail: '分组',
    apply: 'GROUP BY ',
  },
  {
    label: 'ORDER BY',
    type: 'keyword',
    detail: '排序',
    apply: 'ORDER BY ',
  },
  {
    label: 'LIMIT',
    type: 'keyword',
    detail: '限制行数',
    apply: 'LIMIT ',
  },
  {
    label: '${var:today_start}',
    type: 'variable',
    detail: '时间变量',
    apply: '${var:today_start}',
  },
];

const sqlHighlightStyle = HighlightStyle.define([
  {
    tag: tags.keyword,
    color: '#2563eb',
    fontWeight: '600',
  },
  {
    tag: tags.comment,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  {
    tag: tags.string,
    color: '#0f766e',
  },
  {
    tag: tags.number,
    color: '#d97706',
    fontWeight: '500',
  },
  {
    tag: tags.operator,
    color: '#64748b',
  },
  {
    tag: tags.bool,
    color: '#7c3aed',
    fontWeight: '600',
  },
  {
    tag: tags.variableName,
    color: '#4f46e5',
    fontWeight: '600',
  },
  {
    tag: tags.propertyName,
    color: '#334155',
  },
  {
    tag: [tags.brace, tags.paren, tags.squareBracket],
    color: '#64748b',
  },
]);

function resolveSqlDialect(dbType?: string): SQLDialect {
  const normalized = String(dbType || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (normalized.includes('MARIADB')) {
    return MariaSQL;
  }

  if (normalized.includes('MYSQL')) {
    return MySQL;
  }

  if (normalized.includes('POSTGRES') || normalized.includes('PGSQL')) {
    return PostgreSQL;
  }

  if (normalized.includes('SQLSERVER') || normalized.includes('SQL_SERVER') || normalized.includes('MSSQL')) {
    return MSSQL;
  }

  if (normalized.includes('SQLITE')) {
    return SQLite;
  }

  if (normalized.includes('ORACLE')) {
    return PLSQL;
  }

  return StandardSQL;
}

function normalizeName(value?: string | number): string {
  return String(value ?? '').trim();
}

function buildFieldCompletion(field: SqlSchemaField): Completion | null {
  const fieldName = normalizeName(field.originFieldName || field.name);

  if (!fieldName) {
    return null;
  }

  return {
    label: fieldName,
    type: 'property',
    detail: field.type || '字段',
    info: field.comment || undefined,
  };
}

function buildSchemaNamespace(
  schemaFields: SqlSchemaField[] = [],
  tableOptions: SqlTableOption[] = [],
): {
  schema?: SQLNamespace;
  defaultTable?: string;
} {
  const fieldCompletions = schemaFields.map(buildFieldCompletion).filter(Boolean) as Completion[];

  if (fieldCompletions.length) {
    return {
      schema: {
        input: fieldCompletions,
      },
      defaultTable: 'input',
    };
  }

  const tableSchema = tableOptions.reduce<Record<string, readonly string[]>>((schema, option) => {
    const tableName = normalizeName(option.rawLabel || option.value);

    if (!tableName) {
      return schema;
    }

    schema[tableName] = [];
    return schema;
  }, {});

  if (!Object.keys(tableSchema).length) {
    return {};
  }

  return {
    schema: tableSchema,
  };
}

function buildTableCompletion(option: SqlTableOption): Completion | null {
  const tableName = normalizeName(option.rawLabel || option.value);

  if (!tableName) {
    return null;
  }

  return {
    label: tableName,
    type: 'type',
    detail: '数据表',
    info: option.description || undefined,
  };
}

function createSqlCompletionSource({
  schemaFields = [],
  tableOptions = [],
  variables = [],
}: {
  schemaFields?: SqlSchemaField[];
  tableOptions?: SqlTableOption[];
  variables?: string[];
}) {
  const fieldCompletions = schemaFields.map(buildFieldCompletion).filter(Boolean) as Completion[];
  const tableCompletions = tableOptions.map(buildTableCompletion).filter(Boolean) as Completion[];
  const variableCompletions = Array.from(new Set(variables.map(normalizeName).filter(Boolean))).map<Completion>(
    (name) => ({
      label: `\${var:${name}}`,
      type: 'variable',
      detail: '时间变量',
      apply: `\${var:${name}}`,
    }),
  );

  const options = [
    ...SQL_KEYWORD_COMPLETIONS,
    ...SQL_SNIPPET_COMPLETIONS,
    ...tableCompletions,
    ...fieldCompletions,
    ...variableCompletions,
  ];

  return (context: CompletionContext) => {
    const word = context.matchBefore(SQL_COMPLETION_TOKEN_PATTERN);
    const token = word?.text || '';

    if (!context.explicit && !word) {
      return null;
    }

    const normalizedToken = token.toLowerCase();
    const matchedOptions = normalizedToken
      ? options.filter((option) => {
          const label = option.label.toLowerCase();

          return (
            label.startsWith(normalizedToken) || label.split(/\s+/).some((part) => part.startsWith(normalizedToken))
          );
        })
      : options;

    if (!matchedOptions.length) {
      return null;
    }

    return {
      from: word?.from ?? context.pos,
      options: matchedOptions,
      filter: false,
    };
  };
}

function buildSqlExtensions(props: {
  dbType?: string;
  schemaFields?: SqlSchemaField[];
  tableOptions?: SqlTableOption[];
  variables?: string[];
}): Extension {
  const dialect = resolveSqlDialect(props.dbType);
  const schemaConfig = buildSchemaNamespace(props.schemaFields, props.tableOptions);
  const sqlConfig: SQLConfig = {
    dialect,
    upperCaseKeywords: true,
    ...schemaConfig,
  };

  return [
    sql(sqlConfig),
    autocompletion({
      activateOnTyping: true,
      activateOnTypingDelay: 0,
      maxRenderedOptions: 12,
      tooltipClass: () => 'sql-code-editor__completion-tooltip',
      override: [createSqlCompletionSource(props)],
    }),
  ];
}

function getSqlCompletionToken(view: EditorView): string {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const beforeCursor = view.state.sliceDoc(line.from, head);

  return beforeCursor.match(SQL_COMPLETION_TOKEN_PATTERN)?.[0] || '';
}

function syncSqlCompletion(view: EditorView): void {
  window.setTimeout(() => {
    if (!view.dom.isConnected || !view.hasFocus || view.composing) {
      return;
    }

    const token = getSqlCompletionToken(view);
    const status = completionStatus(view.state);

    if (!token) {
      if (status) {
        closeCompletion(view);
      }

      return;
    }

    if (!status) {
      startCompletion(view);
    }
  }, 0);
}

const editorBaseTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    backgroundColor: '#FCFDFF',
    color: '#334155',
    outline: 'none !important',
  },

  '&.cm-focused': {
    outline: 'none !important',
  },

  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'JetBrains Mono, Fira Code, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    lineHeight: `${LINE_HEIGHT}px`,
    outline: 'none !important',
  },

  '.cm-content': {
    padding: '10px 0',
    caretColor: '#0f172a',
    outline: 'none !important',
  },

  '.cm-line': {
    padding: '0 12px',
  },

  '.cm-gutters': {
    backgroundColor: '#F8FAFC',
    color: '#94A3B8',
    borderRight: '1px solid rgba(226, 232, 240, 0.9)',
  },

  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 10px 0 12px',
    fontSize: '12px',
    lineHeight: `${LINE_HEIGHT}px`,
  },

  '.cm-activeLine': {
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
  },

  '.cm-activeLineGutter': {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },

  '.cm-selectionBackground': {
    backgroundColor: 'rgba(79, 107, 255, 0.16) !important',
  },

  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(79, 107, 255, 0.16) !important',
  },

  '.cm-cursor': {
    borderLeftColor: '#0f172a',
  },
});

export default function SqlCodeEditor({
  value = '',
  onChange,
  placeholder = '请输入 SQL',
  dbType,
  schemaFields,
  tableOptions,
  variables,
  minRows = DEFAULT_MIN_ROWS,
  maxRows = DEFAULT_MAX_ROWS,
  className,
  showLineNumbers = true,
  expandable = true,
  fullscreenTitle = '编辑 SQL',
}: SqlCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const sqlCompartmentRef = useRef(new Compartment());
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenValue, setFullscreenValue] = useState(value || '');

  const minHeight = Math.max(minRows, 1) * LINE_HEIGHT + VERTICAL_PADDING;
  const maxHeight = Math.max(maxRows, minRows) * LINE_HEIGHT + VERTICAL_PADDING;
  const showPlaceholder = !value;

  const editorStyle = useMemo(
    () =>
      ({
        '--sql-editor-min-height': `${minHeight}px`,
        '--sql-editor-max-height': `${maxHeight}px`,
        '--sql-editor-placeholder-left': showLineNumbers ? '56px' : '12px',
      }) as CSSProperties,
    [minHeight, maxHeight, showLineNumbers],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!fullscreenOpen) {
      setFullscreenValue(value || '');
    }
  }, [fullscreenOpen, value]);

  const handleOpenFullscreen = () => {
    setFullscreenValue(value || '');
    setFullscreenOpen(true);
  };

  const handleCancelFullscreen = () => {
    setFullscreenValue(value || '');
    setFullscreenOpen(false);
  };

  const handleApplyFullscreen = () => {
    onChangeRef.current(fullscreenValue);
    setFullscreenOpen(false);
  };

  useEffect(() => {
    if (!containerRef.current || viewRef.current) {
      return;
    }

    const tooltipParent = containerRef.current.ownerDocument.body;

    const state = EditorState.create({
      doc: value || '',
      extensions: [
        keymap.of([...completionKeymap, ...defaultKeymap, ...historyKeymap]),
        history(),
        indentOnInput(),
        bracketMatching(),
        foldGutter(),
        syntaxHighlighting(sqlHighlightStyle),
        showLineNumbers ? lineNumbers() : [],
        editorBaseTheme,
        EditorView.lineWrapping,
        tooltips({
          parent: tooltipParent,
          position: 'fixed',
          tooltipSpace: (view) => {
            const doc = view.dom.ownerDocument.documentElement;

            return {
              top: 8,
              right: doc.clientWidth - 8,
              bottom: doc.clientHeight - 8,
              left: 8,
            };
          },
        }),
        sqlCompartmentRef.current.of(
          buildSqlExtensions({
            dbType,
            schemaFields,
            tableOptions,
            variables,
          }),
        ),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return;
          }

          onChangeRef.current(update.state.doc.toString());
          syncSqlCompletion(update.view);
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    view.dispatch({
      effects: sqlCompartmentRef.current.reconfigure(
        buildSqlExtensions({
          dbType,
          schemaFields,
          tableOptions,
          variables,
        }),
      ),
    });
  }, [dbType, schemaFields, tableOptions, variables]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();
    const nextValue = value || '';

    if (nextValue === currentValue) {
      return;
    }

    view.dispatch({
      changes: {
        from: 0,
        to: currentValue.length,
        insert: nextValue,
      },
    });
  }, [value]);

  return (
    <>
      <div
        className={classNames(
          'sql-code-editor',
          {
            'sql-code-editor--expandable': expandable,
          },
          className,
        )}
        style={editorStyle}
      >
        <div ref={containerRef} />
        {showPlaceholder && <div className="sql-code-editor__placeholder">{placeholder}</div>}
        {expandable ? (
          <Button
            type="text"
            size="small"
            className="sql-code-editor__expand-btn"
            icon={<Maximize2 size={14} />}
            aria-label="展开 SQL 编辑器"
            title="展开编辑"
            onClick={handleOpenFullscreen}
          />
        ) : null}
      </div>

      {expandable ? (
        <Modal
          open={fullscreenOpen}
          title={fullscreenTitle}
          centered
          width="min(920px, calc(100vw - 48px))"
          className="sql-code-editor-modal"
          destroyOnClose
          maskClosable={false}
          onCancel={handleCancelFullscreen}
          footer={
            <div className="sql-code-editor-modal__footer">
              <Button onClick={handleCancelFullscreen}>取消</Button>
              <Button type="primary" onClick={handleApplyFullscreen}>
                应用
              </Button>
            </div>
          }
        >
          <div className="sql-code-editor-modal__body">
            <SqlCodeEditor
              value={fullscreenValue}
              onChange={(nextValue) => setFullscreenValue(nextValue)}
              placeholder={placeholder}
              dbType={dbType}
              schemaFields={schemaFields}
              tableOptions={tableOptions}
              variables={variables}
              minRows={FULLSCREEN_MIN_ROWS}
              maxRows={FULLSCREEN_MAX_ROWS}
              className="sql-code-editor--fullscreen"
              showLineNumbers={showLineNumbers}
              expandable={false}
            />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
