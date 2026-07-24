import { ApiOutlined, BarChartOutlined, ReadOutlined } from "@ant-design/icons";
import { SelectLang as UmiSelectLang } from "@umijs/max";
import {
  Boxes,
  BriefcaseBusiness,
  ChevronsLeftRight,
  Database,
  MonitorX,
  Palette,
} from "lucide-react";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { history } from "umi";
import "./index.less";

export type SiderTheme = "light" | "dark";

export const SelectLang: React.FC = () => {
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

export const BI: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
        cursor: "pointer",
      }}
      onClick={() => {
        history.push("/bi");
      }}
    >
      <BarChartOutlined />
    </div>
  );
};

export const Knowledge: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
        cursor: "pointer",
      }}
      onClick={() => {
        history.push("/knowledge-management");
      }}
    >
      <ReadOutlined />
    </div>
  );
};

export const OpenAPI: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
        cursor: "pointer",
      }}
      onClick={() => {
        history.push("/open-api");
      }}
    >
      <ApiOutlined />
    </div>
  );
};

type SearchTarget = {
  pathname: string;
  query?: Record<string, string>;
};

type SearchItem = {
  id: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ReactNode;
  target?: SearchTarget;
};

const buildQueryString = (query?: Record<string, string>) => {
  if (!query) return "";
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const formatDateTime = (value: moment.Moment) =>
  value.format("YYYY-MM-DD HH:mm:ss");

const getTodayRange = () => ({
  createTimeStart: formatDateTime(moment().startOf("day")),
  createTimeEnd: formatDateTime(moment().endOf("day")),
  current: "1",
  pageSize: "10",
});

const getRecentOneDayRange = () => ({
  createTimeStart: formatDateTime(moment().subtract(1, "day")),
  createTimeEnd: formatDateTime(moment()),
  current: "1",
  pageSize: "10",
});

const getRecentWeekRange = () => ({
  createTimeStart: formatDateTime(moment().subtract(7, "days")),
  createTimeEnd: formatDateTime(moment()),
  current: "1",
  pageSize: "10",
});

const searchList: SearchItem[] = [
  {
    id: "1",
    title: "查一下最近一天的任务",
    desc: "查看最近 24 小时内创建或执行的任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        ...getRecentOneDayRange(),
      },
    },
    icon: <Boxes className="h-4 w-4 text-blue-500" />,
  },
  {
    id: "2",
    title: "看看运行中的任务",
    desc: "快速筛选当前正在执行中的 Batch 任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        status: "RUNNING",
        current: "1",
        pageSize: "10",
      },
    },
    icon: <BriefcaseBusiness className="h-4 w-4 text-green-500" />,
  },
  {
    id: "3",
    title: "看看失败的任务",
    desc: "查看执行失败的离线任务，便于排查问题",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        status: "FAILED",
        current: "1",
        pageSize: "10",
      },
    },
    icon: <MonitorX className="h-4 w-4 text-indigo-500" />,
  },
  {
    id: "4",
    title: "看看最近执行过的任务",
    desc: "按最近执行时间排序查看离线任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        current: "1",
        pageSize: "10",
      },
    },
    icon: <Palette className="h-4 w-4 text-pink-500" />,
  },
  {
    id: "5",
    title: "看看今天创建的任务",
    desc: "快速查看今天新建的离线任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        ...getTodayRange(),
      },
    },
    icon: <Database className="h-4 w-4 text-orange-500" />,
  },
  {
    id: "6",
    title: "查一下最近一周的任务",
    desc: "快速查看最近 7 天内的任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        ...getRecentWeekRange(),
      },
    },
    icon: <ChevronsLeftRight className="h-4 w-4 text-teal-500" />,
  },
];

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredList = useMemo(() => {
    return searchList.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.desc.toLowerCase().includes(keyword.toLowerCase()) ||
        item.tag.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [keyword]);

  useEffect(() => {
    setActiveIndex(0);
  }, [keyword, open]);

  const handleSelect = (item: SearchItem) => {
    if (!item.target) return;

    const search = buildQueryString(item.target.query);

    history.push({
      pathname: item.target.pathname,
      search,
    });

    setOpen(false);
    setKeyword("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (!filteredList.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredList.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + filteredList.length) % filteredList.length
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredList[activeIndex]);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="fixed top-1 left-1/2 z-50 w-[clamp(280px,32vw,460px)] -translate-x-1/2" >
      <div ref={wrapperRef} className="relative w-full">
        <div
          className={`rounded-full border transition-all duration-300 bg-white ${
            open
              ? "border-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              : "border-gray-300 shadow-sm"
          }`}
        >
          <div className="relative rounded-full">
            <input
              type="text"
              value={keyword}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (!open) setOpen(true);
              }}
              placeholder="Search batch jobs、stream jobs..."
              className="flex w-full bg-transparent px-4  pl-9 pr-9 text-sm h-9 rounded-full focus:outline-none"
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            {keyword && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-slate-100"
                onClick={() => setKeyword("")}
              >
                <div className="flex h-4 w-4 items-center justify-center text-slate-400">
                  ×
                </div>
              </button>
            )}
          </div>
        </div>

        {/* 下拉列表 */}
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 ease-out bg-white"
          style={{
            opacity: open ? 1 : 0,
            maxHeight: open ? 420 : 0,
            transform: open
              ? "translateY(0px) scale(1)"
              : "translateY(-6px) scale(0.98)",
            transformOrigin: "top center",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <ul className="py-1">
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={item.id}
                    className="cursor-pointer px-3 py-2 flex items-center justify-between transition-all duration-200 custom-hover"
                    style={{
                      opacity: open ? 1 : 0,
                      transform: open ? "translateY(0)" : "translateY(-6px)",
                      transitionDelay: `${index * 35}ms`,
                      background: isActive ? "#F8FAFC" : "transparent",
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black font-inter">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results found
              </li>
            )}
          </ul>

          <div className="px-3 py-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
