import data from "@emoji-mart/data";
import { init } from "emoji-mart";
import type { FC } from "react";

init({ data });
type AppIconType = "image" | "emoji";
export type AppIconProps = {
  size?: "xs" | "tiny" | "small" | "medium" | "large" | "xl" | "xxl";
  rounded?: boolean;
  iconType?: AppIconType | null;
  icon?: string;
  background?: string | null;
  imageUrl?: string | null;
  className?: string;
  innerIcon?: React.ReactNode;
  onClick?: () => void;
};

const AppIcon: FC<AppIconProps> = ({
  size = "medium",
  rounded = false,
  iconType,
  icon,
  background,
  imageUrl,
  className,
  innerIcon,
  onClick,
}) => {
  const isValidImageIcon = iconType === "image" && imageUrl;

  return (
    <span
      style={{
        fontSize: 32,
        borderRadius: "1rem",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        flexGrow: 0,
        flexShink: 0,
        width: "3.5rem",
        padding: "0.5rem",
        height: "3.5rem",
        margin: "0 0.75rem",
        display: "flex",
        position: "relative",
        background: isValidImageIcon ? undefined : background || "#FFEAD5",
      }}
      onClick={onClick}
    >
      {isValidImageIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} className="w-full h-full" alt="app icon" />
      ) : (
        innerIcon ||
        (icon && icon !== "" ? <em-emoji id={icon} /> : <em-emoji id="🤖" />)
      )}
    </span>
  );
};

export default AppIcon;
