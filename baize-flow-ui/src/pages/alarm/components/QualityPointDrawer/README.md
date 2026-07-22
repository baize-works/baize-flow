# QualityPointDrawer 拆分说明

建议目录：

```text
QualityPointDrawer/
├── index.tsx
├── model.ts
├── types.ts
├── utils.ts
├── useQualityPointDrawer.ts
└── components/
    ├── BasicInfoSection.tsx
    ├── PromptSection.tsx
    ├── QualityPointDrawerHeader.tsx
    ├── RelationItem.tsx
    ├── RelationSection.tsx
    └── TagList.tsx
```

职责划分：

- `index.tsx`：只负责 Drawer 布局和子组件组装。
- `model.ts`：统一转发 `QualityPoint` 与 `typeLabelMap`，隔离外部目录路径。
- `useQualityPointDrawer.ts`：编辑、取消、保存、关闭及 draft 状态。
- `utils.ts`：质控点深拷贝和保存前清洗。
- `QualityPointDrawerHeader.tsx`：标题、编辑按钮、保存按钮和关闭按钮。
- `BasicInfoSection.tsx`：适用文书、质控类型和质控说明。
- `RelationSection.tsx`：关联段落和关联元素。
- `PromptSection.tsx`：提示词切换、查看和编辑。
- `TagList.tsx`、`RelationItem.tsx`：纯展示小组件。

当前示例假设原组件位于：

```text
components/QualityPointDrawer/index.tsx
```

并且 `qualityPointTypes.ts` 位于 `components` 的上一级目录。若你的实际目录不同，只需要调整 `qualityPointTypes` 的相对导入路径。
