package io.baize.flow.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import lombok.NonNull;
import io.baize.flow.common.enums.JobStatus;
import io.baize.flow.common.utils.ConvertUtil;
import io.baize.flow.common.utils.JobStatusHelper;
import io.baize.flow.dao.entity.StreamingJobInstance;
import io.baize.flow.dao.mapper.StreamingJobInstanceMapper;
import io.baize.flow.dao.repository.BaseDao;
import io.baize.flow.dao.repository.StreamingJobInstanceDao;
import io.baize.flow.spi.bean.dto.SeaTunnelJobInstanceDTO;
import io.baize.flow.spi.bean.vo.JobInstanceVO;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class StreamingJobInstanceDaoImpl
        extends BaseDao<StreamingJobInstance, StreamingJobInstanceMapper>
        implements StreamingJobInstanceDao {

    @Resource
    private StreamingJobInstanceMapper streamingJobInstanceMapper;

    public StreamingJobInstanceDaoImpl(@NonNull StreamingJobInstanceMapper streamingJobInstanceMapper) {
        super(streamingJobInstanceMapper);
    }

    @Override
    public IPage<JobInstanceVO> pageWithDefinition(SeaTunnelJobInstanceDTO dto) {
        long pageNo = dto.getPageNo() == null || dto.getPageNo() < 1 ? 1 : dto.getPageNo();
        long pageSize = dto.getPageSize() == null || dto.getPageSize() < 1 ? 10 : dto.getPageSize();

        Page<JobInstanceVO> page = new Page<>(pageNo, pageSize);
        return streamingJobInstanceMapper.pageWithDefinition(page, dto);
    }

    @Override
    public int failRunningInstancesByClientId(Long clientId, String errorMessage) {
        if (clientId == null || clientId <= 0) {
            return 0;
        }

        Date now = new Date();

        LambdaUpdateWrapper<StreamingJobInstance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(StreamingJobInstance::getClientId, clientId)
                .in(StreamingJobInstance::getJobStatus, JobStatusHelper.runningLikeStatuses())
                .set(StreamingJobInstance::getJobStatus, JobStatus.FAILED)
                .set(StreamingJobInstance::getErrorMessage, truncate(errorMessage, 2000))
                .set(StreamingJobInstance::getEndTime, now)
                .set(StreamingJobInstance::getUpdateTime, now);

        return streamingJobInstanceMapper.update(null, wrapper);
    }

    @Override
    public List<StreamingJobInstance> listRunningLikeInstances() {
        LambdaQueryWrapper<StreamingJobInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(StreamingJobInstance::getJobStatus,
                JobStatus.INITIALIZING,
                JobStatus.CREATED,
                JobStatus.PENDING,
                JobStatus.SCHEDULED,
                JobStatus.RUNNING,
                JobStatus.FAILING,
                JobStatus.DOING_SAVEPOINT,
                JobStatus.CANCELING)
                .orderByDesc(StreamingJobInstance::getCreateTime);

        List<StreamingJobInstance> records = streamingJobInstanceMapper.selectList(wrapper);
        return records == null ? Collections.emptyList() : records;
    }

    @Override
    public JobInstanceVO selectDetailById(Long id) {
        if (id == null || id <= 0) {
            return null;
        }
        return streamingJobInstanceMapper.selectDetailById(id);
    }

    @Override
    public boolean existsRunningInstance(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return false;
        }

        LambdaQueryWrapper<StreamingJobInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StreamingJobInstance::getJobDefinitionId, definitionId)
                .in(StreamingJobInstance::getJobStatus,
                        JobStatus.INITIALIZING,
                        JobStatus.CREATED,
                        JobStatus.PENDING,
                        JobStatus.SCHEDULED,
                        JobStatus.RUNNING,
                        JobStatus.FAILING,
                        JobStatus.DOING_SAVEPOINT,
                        JobStatus.CANCELING);

        Long count = streamingJobInstanceMapper.selectCount(wrapper);

        return count != null && count > 0;
    }

    @Override
    public void deleteByDefinitionId(Long definitionId) {
        LambdaQueryWrapper<StreamingJobInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StreamingJobInstance::getJobDefinitionId, definitionId);
        streamingJobInstanceMapper.delete(wrapper);
    }

    @Override
    public void updateStatus(Long instanceId, JobStatus status, String errorMessage) {
        boolean endState = status.isEndState();
        Date now = new Date();

        LambdaUpdateWrapper<StreamingJobInstance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(StreamingJobInstance::getId, instanceId)
                .set(StreamingJobInstance::getJobStatus, status)
                .set(StreamingJobInstance::getUpdateTime, now);

        if (errorMessage != null && !errorMessage.isBlank()) {
            wrapper.set(StreamingJobInstance::getErrorMessage, truncate(errorMessage, 2000));
        }

        if (endState) {
            wrapper.set(StreamingJobInstance::getEndTime, now);
        }

        streamingJobInstanceMapper.update(null, wrapper);
    }

    @Override
    public void updateStatusAndEngineId(Long instanceId, JobStatus status, String engineJobId) {
        boolean endState = status.isEndState();
        Date now = new Date();

        LambdaUpdateWrapper<StreamingJobInstance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(StreamingJobInstance::getId, instanceId)
                .set(StreamingJobInstance::getJobStatus, status)
                .set(StreamingJobInstance::getUpdateTime, now);

        if (engineJobId != null) {
            wrapper.set(StreamingJobInstance::getEngineJobId, engineJobId);
        }

        if (endState) {
            wrapper.set(StreamingJobInstance::getEndTime, now);
        }

        streamingJobInstanceMapper.update(null, wrapper);
    }

    @Override
    public void updateSubmitResult(Long instanceId, String engineJobId, JobStatus submitStatus, Date submitTime) {
        StreamingJobInstance update = new StreamingJobInstance();
        update.setId(instanceId);
        update.setEngineJobId(engineJobId);
        update.setJobStatus(submitStatus);
        update.setSubmitTime(submitTime);
        update.setUpdateTime(new Date());

        if (JobStatus.RUNNING.equals(submitStatus)
                || JobStatus.INITIALIZING.equals(submitStatus)
                || JobStatus.PENDING.equals(submitStatus)
                || JobStatus.SCHEDULED.equals(submitStatus)) {
            update.setStartTime(submitTime);
        }

        streamingJobInstanceMapper.updateById(update);
    }

    @Override
    public List<JobInstanceVO> listRunning() {
        LambdaQueryWrapper<StreamingJobInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNotNull(StreamingJobInstance::getClientId)
                .isNotNull(StreamingJobInstance::getEngineJobId)
                .in(StreamingJobInstance::getJobStatus,
                        JobStatus.INITIALIZING,
                        JobStatus.CREATED,
                        JobStatus.PENDING,
                        JobStatus.SCHEDULED,
                        JobStatus.RUNNING,
                        JobStatus.FAILING,
                        JobStatus.DOING_SAVEPOINT,
                        JobStatus.CANCELING);

        List<StreamingJobInstance> records = streamingJobInstanceMapper.selectList(wrapper);

        if (records == null || records.isEmpty()) {
            return Collections.emptyList();
        }

        return records.stream()
                .map(item -> ConvertUtil.sourceToTarget(item, JobInstanceVO.class))
                .collect(Collectors.toList());
    }

    @Override
    public StreamingJobInstance lastInstance(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return null;
        }
        LambdaQueryWrapper<StreamingJobInstance> wrapperLast = new LambdaQueryWrapper<>();
        wrapperLast.eq(StreamingJobInstance::getJobDefinitionId, definitionId)
                .orderByDesc(StreamingJobInstance::getUpdateTime)
                .last("limit 1");
        return streamingJobInstanceMapper.selectOne(wrapperLast);
    }

    private String truncate(String text, int maxLength) {
        if (text == null) {
            return null;
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }
}