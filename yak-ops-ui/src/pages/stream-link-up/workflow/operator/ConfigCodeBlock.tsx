// ConfigCodeBlock.jsx
const ConfigCodeBlock = ({ content }) => {
  // 简单的语法高亮（纯CSS实现）
  const highlightConfig = (text) => {
    return text
      .replace(/(\w+\s*\{)/g, '<span style="color: #d73a49;">$1</span>')
      .replace(/(\w+\s*=)/g, '<span style="color: #6f42c1;">$1</span>')
      .replace(/("[^"]*")/g, '<span style="color: #032f62;">$1</span>')
      .replace(/(\d+)/g, '<span style="color: #005cc5;">$1</span>');
  };

  return (
    <div
      style={{
        backgroundColor: "#f6f8fa",
        border: "1px solid #e1e4e8",
        borderRadius: 8,
        padding: "16px",
        fontFamily: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#24292e",
        overflow: "auto",
        whiteSpace: "pre"
      }}
      dangerouslySetInnerHTML={{ __html: highlightConfig(content) }}
    />
  );
};

export default ConfigCodeBlock;