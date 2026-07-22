package io.baize.flow.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import jakarta.annotation.Resource;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.mapper.StreamingJobDefinitionContentMapper;
import io.baize.flow.dao.repository.StreamingJobDefinitionContentDao;
import org.springframework.stereotype.Repository;

@Repository
public class StreamingJobDefinitionContentDaoImpl implements StreamingJobDefinitionContentDao {

    @Resource
    private StreamingJobDefinitionContentMapper streamingJobDefinitionContentMapper;

    @Override
    public void save(StreamingJobDefinitionContentEntity entity) {
        if (entity == null) {
            return;
        }
        streamingJobDefinitionContentMapper.insert(entity);
    }

    @Override
    public StreamingJobDefinitionContentEntity queryLatestByJobDefinitionId(Long jobDefinitionId) {
        if (jobDefinitionId == null) {
            return null;
        }

        LambdaQueryWrapper<StreamingJobDefinitionContentEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StreamingJobDefinitionContentEntity::getJobDefinitionId, jobDefinitionId)
                .orderByDesc(StreamingJobDefinitionContentEntity::getVersion)
                .last("LIMIT 1");

        return streamingJobDefinitionContentMapper.selectOne(wrapper);
    }

    @Override
    public void deleteByJobDefinitionId(Long jobDefinitionId) {
        if (jobDefinitionId == null) {
            return;
        }

        LambdaUpdateWrapper<StreamingJobDefinitionContentEntity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(StreamingJobDefinitionContentEntity::getJobDefinitionId, jobDefinitionId);

        streamingJobDefinitionContentMapper.delete(wrapper);
    }
}