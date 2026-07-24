import HttpUtils from "@/utils/HttpUtils";

export const hoconTemplateApi = {
  preview: (params: {
    sourceDbType: string;
    sourcePluginName: string;
    targetDbType: string;
    targetPluginName: string;
  }): Promise<any> => {
    const {
      sourceDbType,
      sourcePluginName,
      targetDbType,
      targetPluginName,
    } = params;

    return HttpUtils.get(
      `/api/v1/hocon-template/preview?sourceDbType=${encodeURIComponent(
        sourceDbType
      )}&sourcePluginName=${encodeURIComponent(
        sourcePluginName
      )}&targetDbType=${encodeURIComponent(
        targetDbType
      )}&targetPluginName=${encodeURIComponent(targetPluginName)}`
    );
  },
};