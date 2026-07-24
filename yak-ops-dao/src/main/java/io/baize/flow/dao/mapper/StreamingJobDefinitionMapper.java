package io.baize.flow.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import io.baize.flow.spi.bean.vo.StreamingJobDefinitionVO;

import java.util.List;

@Mapper
public interface StreamingJobDefinitionMapper extends BaseMapper<StreamingJobDefinitionEntity> {
    List<StreamingJobDefinitionVO> selectPageWithLatestInstance(
            @Param("dto") StreamingJobDefinitionQueryDTO dto,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    Long countPage(@Param("dto") StreamingJobDefinitionQueryDTO dto);
}