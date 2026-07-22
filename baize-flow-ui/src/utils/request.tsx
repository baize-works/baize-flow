/* eslint-disable @typescript-eslint/dot-notation */
import { openPrettyNotification } from "@/utils/prettyNotification";
import { history } from "umi";
import { extend } from "umi-request";

const codeMessage: Record<number, string> = {
  10000: "系统未知错误，请反馈给管理员",
  200: "服务器成功返回请求的数据。",
  201: "新建或修改数据成功。",
  202: "一个请求已经进入后台排队（异步任务）。",
  204: "删除数据成功。",
  400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
  401: "用户没有权限（令牌、用户名、密码错误）。",
  403: "用户得到授权，但是访问是被禁止的。",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
  406: "请求的格式不可得。",
  410: "请求的资源被永久删除，且不会再得到的。",
  422: "当创建一个对象时，发生一个验证错误。",
  500: "服务器发生错误，请检查服务器。",
  502: "网关错误。",
  503: "服务不可用，服务器暂时过载或维护。",
  504: "网关超时。",
};

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export class BizError extends Error {
  code?: number;
  response?: ApiResponse<any>;
  skipErrorHandler?: boolean;

  constructor(
    message: string,
    code?: number,
    response?: ApiResponse<any>,
    skipErrorHandler?: boolean
  ) {
    super(message);
    this.name = "BizError";
    this.code = code;
    this.response = response;
    this.skipErrorHandler = skipErrorHandler;
  }
}

export const goLogin = () => {
  if (!window.location.pathname.toLowerCase().startsWith("/login")) {
    history.push("/login");
  }
};

/** 唯一错误出口 */
/** 唯一错误出口 */
const errorHandler = (error: any): Response | undefined => {
  const { response } = error;

  // 业务异常
  if (error instanceof BizError) {
    if (!error.skipErrorHandler) {
      openPrettyNotification({
        type: "error",
        title: "操作失败",
        description: error.message || "未知错误",
        meta: "请稍后重试",
      });
    }

    if (error.code === 401) {
      goLogin();
    }

    throw error;
  }

  // HTTP 异常
  if (response && response.status) {
    const { status, url } = response;

    if (status === 401) {
      openPrettyNotification({
        type: "warning",
        title: "登录状态失效",
        description: "当前登录信息已过期，请重新登录后继续操作。",
        meta: "即将跳转登录页",
      });
      goLogin();
      return response;
    }

    const errorText = codeMessage[status] || response.statusText || "请求失败";

    openPrettyNotification({
      type: "error",
      title: `请求错误 ${status}`,
      description: (
        <div>
          <div>{errorText}</div>
          {url ? (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "rgba(23, 32, 51, 0.45)",
              }}
            >
              {url}
            </div>
          ) : null}
        </div>
      ),
      meta: "服务端返回异常",
      duration: 3.5,
    });

    return response;
  }

  // 网络异常
  openPrettyNotification({
    type: "warning",
    title: "网络异常",
    description: "当前无法连接到服务器，请检查网络或稍后再试。",
    meta: "连接中断",
  });

  return response;
};

function createClient() {
  return extend({
    errorHandler,
    credentials: "include",
  });
}

const request = createClient();

request.interceptors.request.use((url: string, options: any) => {
  const headers = options.headers || {};

  return {
    url,
    options: {
      ...options,
      headers,
    },
  };
});

/** 这里只识别业务异常，不做提示 */
request.interceptors.response.use(async (response: Response, options: any) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return response;
  }

  const clonedResponse = response.clone();
  const res: any = await clonedResponse.json();
  if (res?.message === "NOT_LOGIN" || res?.code === 1) {
    goLogin();
    return response || {};
  }

  if (typeof res?.code !== "undefined" && res.code !== 0) {
    throw new BizError(
      res.msg || "操作失败",
      res.code,
      res,
      options?.skipErrorHandler
    );
  }

  return response;
});

export default request;
