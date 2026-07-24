import { searchEmoji } from "@/utils/emoji";
import type { EmojiMartData } from "@emoji-mart/data";
import data from "@emoji-mart/data";
import { Divider } from "antd";
import { init } from "emoji-mart";
import type { ChangeEvent, FC } from "react";
import React, { useState } from "react";
import { Area } from "react-easy-crop";
import "./index.less";

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface IntrinsicElements {
      "em-emoji": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

init({ data });

const backgroundColors = [
  "#FFEAD5",
  "#E4FBCC",
  "#D3F8DF",
  "#E0F2FE",

  "#E0EAFF",
  "#EFF1F5",
  "#FBE8FF",
  "#FCE7F6",

  "#FEF7C3",
  "#E6F4D7",
  "#D5F5F6",
  "#D1E9FF",

  "#D1E0FF",
  "#D5D9EB",
  "#ECE9FE",
  "#FFE4E8",
];

type IEmojiPickerInnerProps = {
  emoji?: string;
  background?: string;
  onSelect?: (emoji: string, background: string) => void;
  display?: boolean;
};

const EmojiPickerInner: FC<IEmojiPickerInnerProps> = ({
  onSelect,
  display,
}) => {
  const { categories } = data as EmojiMartData;
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(
    backgroundColors[0]
  );

  const [searchedEmojis, setSearchedEmojis] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  type InputImageInfo =
    | { file: File }
    | { tempUrl: string; croppedAreaPixels: Area; fileName: string };

  React.useEffect(() => {
    if (selectedEmoji && selectedBackground)
      onSelect?.(selectedEmoji, selectedBackground);
  }, [onSelect, selectedEmoji, selectedBackground]);

  return (
    <>
      {/* ddd */}

      <div
        style={{
          display: display ? "block" : "none",
        }}
      >
        <div className="flex flex-col items-center w-full px-3 pb-2">
          <div className="relative w-full">
            <div
              style={{
                flexDirection: "column",
                width: "100%",
                display: "flex",
                padding: "0.5rem 0.75rem 0.5rem 0.75rem",
              }}
            >
              <div style={{ width: "100%", position: "relative" }}>
                <div
                  style={{
                    paddingLeft: "0.75rem",
                    alignItems: "center",
                    display: "flex",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    position: "absolute",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    style={{
                      color: "rgb(152 162 179)",
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  placeholder="Search emojis..."
                  style={{
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    paddingLeft: "2.5rem",
                    paddingRight: "0.75rem",
                    backgroundColor: "rgb(242 244 247)",
                    borderRadius: "0.5rem",
                    width: "100%",
                    height: "2.5rem",
                    display: "block",
                    border: "none",
                  }}
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.value === "") {
                      setIsSearching(false);
                    } else {
                      setIsSearching(true);
                      const emojis = await searchEmoji(e.target.value);
                      setSearchedEmojis(emojis);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <Divider style={{ margin: "8px 0px" }} />

        <div className="h-j-01">
          {isSearching && (
            <>
              <div
                key={"category-search"}
                style={{ flexDirection: "column", display: "flex" }}
              >
                <p
                  style={{
                    color: "rgb(16 24 40)",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Search
                </p>
                <div
                  style={{
                    gap: "0.25rem",
                    gridTemplateColumns: "repeat(8,minmax(0,1fr))",
                    width: "100%",
                    height: "100%",
                    display: "grid",
                  }}
                >
                  {searchedEmojis.map((emoji: string, index: number) => {
                    return (
                      <div
                        key={`emoji-search-${index}`}
                        style={{
                          borderRadius: "0.5rem",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "2.5rem",
                          height: "2.5rem",
                          display: "inline-flex",
                        }}
                        onClick={() => {
                          setSelectedEmoji(emoji);
                        }}
                      >
                        <div
                          style={{
                            padding: "0.25rem",
                            borderRadius: "0.5rem",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            width: "2rem",
                            height: "2rem",
                            display: "flex",
                          }}
                        >
                          <em-emoji id={emoji} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {categories.map((category, index: number) => {
            return (
              <div
                key={`category-${index}`}
                style={{ flexDirection: "column", display: "flex" }}
              >
                <p
                  style={{
                    color: "rgb(16 24 40)",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {category.id}
                </p>
                <div
                  style={{
                    gap: "0.25rem",
                    gridTemplateColumns: "repeat(8,minmax(0,1fr))",
                    width: "100%",
                    height: "100%",
                    display: "grid",
                  }}
                >
                  {category.emojis.map((emoji, index: number) => {
                    return (
                      <div
                        key={`emoji-${index}`}
                        onClick={() => {
                          setSelectedEmoji(emoji);
                        }}
                        style={{
                          borderRadius: "0.5rem",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "2.5rem",
                          height: "2.5rem",
                          display: "inline-flex",
                        }}
                      >
                        <div
                          style={{
                            padding: "0.25rem",
                            borderRadius: "0.5rem",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            width: "2rem",
                            height: "2rem",
                            display: "flex",
                          }}
                          className="t-ring-offset"
                        >
                          <em-emoji id={emoji} style={{ fontSize: 16 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Select */}
        <div style={{ padding: "0.75rem 0.75rem 0 0.75rem" }}>
          <p
            style={{
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: "0.75rem",
              lineHeight: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            Choose Style
          </p>
          <div
            style={{
              gap: "0.25rem",
              gridTemplateColumns: "repeat(8,minmax(0,1fr))",
              width: "100%",
              height: "100%",
              display: "grid",
            }}
          >
            {backgroundColors.map((color) => {
              return (
                <div
                  key={color}
                  onClick={() => {
                    setSelectedBackground(color);
                  }}
                  style={{
                    borderRadius: "0.5rem",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "2.5rem",
                    height: "2.5rem",
                    display: "inline-flex",
                    // 动态添加边框
                    border:
                      selectedBackground === color ? "1px solid blue" : "none",
                  }}
                >
                  <div
                    style={{
                      background: color,
                      padding: "0.25rem",
                      borderRadius: "0.5rem",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                    }}
                  >
                    {selectedEmoji !== "" && <em-emoji id={selectedEmoji} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
export default EmojiPickerInner;
