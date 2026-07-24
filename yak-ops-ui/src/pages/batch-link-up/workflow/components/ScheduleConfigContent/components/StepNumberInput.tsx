import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, InputNumber, Space } from "antd";

interface StepNumberInputProps {
  value?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  width?: number;
}

const StepNumberInput: React.FC<StepNumberInputProps> = ({
  value = 1,
  onChange,
  min = 1,
  max,
  step = 1,
  width = 96,
}) => {
  const currentValue = typeof value === "number" ? value : min;

  const handleMinus = () => {
    const nextValue = currentValue - step;
    if (nextValue < min) return;
    onChange?.(nextValue);
  };

  const handlePlus = () => {
    const nextValue = currentValue + step;
    if (typeof max === "number" && nextValue > max) return;
    onChange?.(nextValue);
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid #D0D5DD",
        borderRadius: 6,
        overflow: "hidden",
        background: "#fff",
        height: 24,
      }}
    >
      <Button
        type="text"
        icon={<MinusOutlined />}
        onClick={handleMinus}
        disabled={currentValue <= min}
        style={{
          width: 24,
          height: 24,
          borderRadius: 0,
          color: "#667085",
          borderInlineEnd: "1px solid #EAECF0",
        }}
      />

      <InputNumber
        value={currentValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        controls={false}
        bordered={false}
        style={{
          width: "34px",
          textAlign: "center",
        }}
      />

      <Button
        type="text"
        icon={<PlusOutlined />}
        onClick={handlePlus}
        disabled={typeof max === "number" ? currentValue >= max : false}
        style={{
          width: 24,
          height: 24,
          borderRadius: 0,
          color: "#667085",
          borderInlineStart: "1px solid #EAECF0",
        }}
      />
    </div>
  );
};

export default StepNumberInput;