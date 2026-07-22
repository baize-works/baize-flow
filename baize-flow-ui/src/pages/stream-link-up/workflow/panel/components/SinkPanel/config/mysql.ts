export interface ParamMeta {
    label: string;
    value: string;
    defaultValue?: string;
    description?: string;
    example?: string;
}

export const mysqlParams: ParamMeta[] = [
    // Connection & Compatibility
    {
        label: 'Compatibility Mode',
        value: 'compatible_mode',
        defaultValue: '',
        description: 'Force a specific compatibility mode when the database supports multiple SQL dialects',
        example: 'mysql'
    },
    {
        label: 'JDBC Driver Class',
        value: 'driver',
        defaultValue: 'com.mysql.cj.jdbc.Driver',
        description: 'Full class name of the JDBC driver, determines which database driver to use',
        example: 'com.mysql.cj.jdbc.Driver'
    },
    {
        label: 'SQL Dialect',
        value: 'dialect',
        defaultValue: 'mysql',
        description: 'Force a specific SQL dialect; has higher priority than URL auto-detection',
        example: 'mysql'
    },
    {
        label: 'Connection Timeout (s)',
        value: 'connection_check_timeout_sec',
        defaultValue: '30',
        description: 'Maximum wait time in seconds to check if the connection is available',
        example: '30'
    },
    {
        label: 'Primary Keys',
        value: 'primary_keys',
        defaultValue: '[]',
        description: 'List of fields used to generate upsert/delete statements',
        example: "['id']"
    },
    {
        label: 'Field Case',
        value: 'field_ide',
        defaultValue: 'ORIGINAL',
        description: 'Convert field names case during synchronization',
        example: 'ORIGINAL'
    },

    // Write Semantics
    {
        label: 'Enable Upsert',
        value: 'enable_upsert',
        defaultValue: 'true',
        description: 'Update if primary key exists, insert if not; can disable if no primary key to improve performance',
        example: 'true'
    },
    {
        label: 'Exactly Once',
        value: 'is_exactly_once',
        defaultValue: 'false',
        description: 'Achieve end-to-end exactly-once using XA transactions; requires xa_data_source_class_name to be configured',
        example: 'false'
    },
    {
        label: 'XA DataSource Class',
        value: 'xa_data_source_class_name',
        defaultValue: '',
        description: 'XA driver class, e.g., MySQL: com.mysql.cj.jdbc.MysqlXADataSource',
        example: 'com.mysql.cj.jdbc.MysqlXADataSource'
    },
    {
        label: 'Transaction Timeout (s)',
        value: 'transaction_timeout_sec',
        defaultValue: '-1',
        description: 'XA transaction timeout; -1 means no timeout',
        example: '-1'
    },
    {
        label: 'Max Commit Attempts',
        value: 'max_commit_attempts',
        defaultValue: '3',
        description: 'Maximum retries when XA transaction commit fails',
        example: '3'
    },

    // Batch & Retry
    {
        label: 'Batch Size',
        value: 'batch_size',
        defaultValue: '1000',
        description: 'Number of records to buffer before committing at once',
        example: '2000'
    },
    {
        label: 'Max Retries',
        value: 'max_retries',
        defaultValue: '3',
        description: 'Maximum retries after executeBatch fails',
        example: '3'
    },
    {
        label: 'Auto Commit',
        value: 'auto_commit',
        defaultValue: 'true',
        description: 'Whether to enable JDBC auto-commit',
        example: 'true'
    },

    // Schema & Data
    {
        label: 'Schema Save Mode',
        value: 'schema_save_mode',
        defaultValue: 'CREATE_SCHEMA_WHEN_NOT_EXIST',
        description: 'How to handle target table schema before task starts',
        example: 'CREATE_SCHEMA_WHEN_NOT_EXIST'
    },
    {
        label: 'Data Save Mode',
        value: 'data_save_mode',
        defaultValue: 'APPEND_DATA',
        description: 'How to handle existing data in target table before task starts',
        example: 'APPEND_DATA'
    },
    {
        label: 'Custom Processing SQL',
        value: 'custom_sql',
        defaultValue: '',
        description: 'SQL to execute first when data_save_mode=CUSTOM_PROCESSING',
        example: 'TRUNCATE TABLE user'
    },

    // Advanced
    {
        label: 'Connection Properties',
        value: 'properties',
        defaultValue: '{}',
        description: 'Additional JDBC connection parameters as key-value pairs; coexists with URL parameters',
        example: "{ 'useSSL': 'false', 'serverTimezone': 'Asia/Shanghai', 'zeroDateTimeBehavior': 'CONVERT_TO_NULL' }"
    }
];
