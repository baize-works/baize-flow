package io.baize.flow.api.service;

import io.baize.flow.spi.bean.vo.HoconTemplateVO;
import io.baize.flow.spi.enums.DbType;

public interface HoconTemplateService {
    HoconTemplateVO getTemplate(
            DbType sourceDbType,
            String sourcePluginName,
            DbType targetDbType,
            String targetPluginName
    );
}
