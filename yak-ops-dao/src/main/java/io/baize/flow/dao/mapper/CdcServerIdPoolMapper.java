package io.baize.flow.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Select;
import io.baize.flow.dao.entity.CdcServerIdPool;

public interface CdcServerIdPoolMapper extends BaseMapper<CdcServerIdPool> {

    @Select("SELECT * FROM t_baize_flow_cdc_server_id_pool WHERE datasource_id = #{datasourceId} AND status = 1 LIMIT 1 FOR UPDATE")
    CdcServerIdPool selectEnabledByDatasourceIdForUpdate(Long datasourceId);
}
