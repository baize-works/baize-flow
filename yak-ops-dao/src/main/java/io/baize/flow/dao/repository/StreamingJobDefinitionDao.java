package io.baize.flow.dao.repository;

import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.dao.entity.TimeVariable;
import io.baize.flow.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import io.baize.flow.spi.bean.vo.StreamingJobDefinitionVO;

import java.util.List;

public interface StreamingJobDefinitionDao extends IDao<StreamingJobDefinitionEntity> {

    StreamingJobDefinitionEntity queryById(Long id);

    void saveOrUpdate(StreamingJobDefinitionEntity entity);

    boolean deleteById(Long id);

    boolean updateReleaseState(Long id, ReleaseState releaseState);

    List<StreamingJobDefinitionVO> selectPage(
            StreamingJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long count(StreamingJobDefinitionQueryDTO dto);

    boolean existsByDatasourceId(Long datasourceId);

    List<Long> selectReferencedDatasourceIds(List<Long> datasourceIds);

    boolean existsByClientId(Long clientId);
}