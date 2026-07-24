import TextType from "@/components/TextType";
import React from "react";

const SceneCopy = React.memo(() => {
  return (
    <div className="scene-copy">
      <div className="scene-copy__badge">
        <TextType
          text={[
            "Welcome To Yak Ops 🌊",
            "让数据优雅的流动起来 💫",
            "让流动更轻一点 ✨",
          ]}
          typingSpeed={75}
          deletingSpeed={50}
          pauseDuration={2600}
          showCursor
          cursorCharacter="|"
          cursorBlinkDuration={0.6}
        />
      </div>

      <h1 className="scene-copy__title">今天也一起元气满满 ✨</h1>
      <p className="scene-copy__desc">
        慢一点，让数据也有呼吸感 🍃
      </p>
    </div>
  );
});

export default SceneCopy;