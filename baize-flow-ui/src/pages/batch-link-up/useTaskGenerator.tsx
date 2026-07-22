// 处理任务生成相关逻辑
const useTaskGenerator = (sourceType, targetType) => {
  const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
      2,
      '0',
    )}${String(now.getSeconds()).padStart(2, '0')}`;

    return `sync_${sourceType.toLowerCase()}_to_${targetType.toLowerCase()}_${dateStr}_${timeStr}`;
};

export default useTaskGenerator;
