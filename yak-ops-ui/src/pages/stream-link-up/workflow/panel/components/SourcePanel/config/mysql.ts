export interface ParamMeta {
    label: string;
    value: string;
    defaultValue?: string;
    description?: string;
    example?: string;
}

export const mysqlParams: ParamMeta[] = [

    // 连接与兼容
    {
        label: '兼容模式',
        value: 'compatible_mode',
        defaultValue: '',
        description: '当数据库支持多种 SQL 方言时，强制指定兼容模式',
        example: 'OceanBase 填 mysql 或 oracle；StarRocks 填 starrocks'
    },
    {
        label: '方言',
        value: 'dialect',
        defaultValue: '',
        description: '手动指定 JDBC 方言类，优先级高于自动识别',
        example: 'starrocks / mysql / oracle / postgres ...'
    },
    {
        label: '连接超时(秒)',
        value: 'connection_check_timeout_sec',
        defaultValue: '30',
        description: '验证连接可用时等待 SQL 执行完成的最大时间',
        example: '60（网络慢时可调大）'
    },

    // 分片读取
    {
        label: '分片列',
        value: 'partition_column',
        defaultValue: '',
        description: '用于把整张表拆成多个区间并发读取的列，必须是数值或日期类型',
        example: 'id 或 create_time'
    },
    {
        label: '分片上界',
        value: 'partition_upper_bound',
        defaultValue: '',
        description: '分片列的最大值，留空会自动 select max() 获取',
        example: '1000000'
    },
    {
        label: '分片下界',
        value: 'partition_lower_bound',
        defaultValue: '',
        description: '分片列的最小值，留空会自动 select min() 获取',
        example: '1'
    },
    {
        label: '分片数',
        value: 'partition_num',
        defaultValue: '',
        description: '已废弃！请改用 split.size 控制并行度',
        example: '（请勿使用）'
    },

    // 类型转换
    {
        label: 'Decimal收窄',
        value: 'decimal_type_narrowing',
        defaultValue: 'true',
        description: 'Oracle 专用：当 decimal 小数位为 0 且无精度损失时自动转成 int/long，节省内存',
        example: 'true（DECIMAL(10,0) → long）'
    },
    {
        label: 'Int收窄',
        value: 'int_type_narrowing',
        defaultValue: 'true',
        description: 'MySQL 专用：当 tinyint(1) 取值只有 0/1 时自动映射为 Boolean',
        example: 'true（tinyint(1) → boolean）'
    },
    {
        label: 'BLOB转字符串',
        value: 'handle_blob_as_string',
        defaultValue: 'false',
        description: 'Oracle 专用：把 BLOB 字段按字符串读取，方便同步到 Doris 等文本系统',
        example: 'true（同步大文本 BLOB 到 Doris）'
    },

    // Oracle 专用
    {
        label: '用select count',
        value: 'use_select_count',
        defaultValue: 'false',
        description: 'Oracle 专用：动态分片阶段用 select count(*) 获取行数，而非 user_tables 统计信息',
        example: 'true（统计信息不准时启用）'
    },
    {
        label: '跳过分析',
        value: 'skip_analyze',
        defaultValue: 'false',
        description: 'Oracle 专用：跳过 analyze table 更新统计信息步骤，适合表数据几乎不变的场景',
        example: 'true（数据静态仓库）'
    },

    // 表路径
    {
        label: '抓取大小',
        value: 'fetch_size',
        defaultValue: '0',
        description: 'JDBC 每次从数据库拉取的行数，0 表示使用驱动默认值；大表建议 1000~5000',
        example: '2048'
    },
    {
        label: '过滤条件',
        value: 'where_condition',
        defaultValue: '',
        description: '给所有表追加的统一 where 过滤条件，必须包含 where 关键字',
        example: 'where create_time >= "2023-01-01" and status = 1'
    },

    // 分片策略
    {
        label: '分片行数',
        value: 'split.size',
        defaultValue: '8096',
        description: '每个分片最多包含的行数；仅在使用 table_path 时生效，决定并行度',
        example: '10000（行数大时调大，减少分片数）'
    },
    {
        label: '均匀下界',
        value: 'split.even-distribution.factor.lower-bound',
        defaultValue: '0.05',
        description: '已废弃！低于该比例认为数据分布不均匀，改用采样分片',
        example: '（请勿改动）'
    },
    {
        label: '均匀上界',
        value: 'split.even-distribution.factor.upper-bound',
        defaultValue: '100',
        description: '已废弃！高于该比例认为数据分布不均匀，改用采样分片',
        example: '（请勿改动）'
    },
    {
        label: '采样阈值',
        value: 'split.sample-sharding.threshold',
        defaultValue: '1000',
        description: '预估分片数超过该值且数据分布不均时，自动启用采样分片策略，减少分片数',
        example: '2000（超 2000 分片时采样）'
    },
    {
        label: '采样率倒数',
        value: 'split.inverse-sampling.rate',
        defaultValue: '1000',
        description: '采样分片时的采样比例倒数，值越大采样越稀疏，分片数越少',
        example: '5000（1/5000 采样，适合超大数据量）'
    },

    // 字符串分片
    {
        label: '字符串分片模式',
        value: 'split.string_split_mode',
        defaultValue: 'sample',
        description: '字符串列分片算法：sample 先采样再划分；charset_based 按 ASCII 32-126 字符集等距切分',
        example: 'charset_based（字符串主键如 UUID、哈希值）'
    },
    {
        label: '字符串排序规则',
        value: 'split.string_split_mode_collate',
        defaultValue: '',
        description: 'charset_based 模式下指定排序规则，解决特殊排序导致边界错误',
        example: 'utf8mb4_general_ci'
    },

    // 扩展属性
    {
        label: '连接属性',
        value: 'properties',
        defaultValue: '',
        description: 'Map 形式追加到 JDBC URL 后的额外参数，如 ssl、timezone、rewriteBatchedStatements',
        example: '{"useSSL":"false","serverTimezone":"Asia/Shanghai"}'
    },
];