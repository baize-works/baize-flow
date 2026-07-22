package io.baize.flow.api.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.api.service.StreamingJobDefinitionService;
import io.baize.flow.api.service.StreamingJobInstanceService;
import io.baize.flow.api.service.StreamingJobMetricsService;
import io.baize.flow.api.service.cdc.CdcServerIdAllocationService;
import io.baize.flow.common.enums.ReleaseState;
import io.baize.flow.common.modal.JobDefinitionAnalysisResult;
import io.baize.flow.common.utils.JSONUtils;
import io.baize.flow.core.exceptions.ServiceException;
import io.baize.flow.core.job.assembler.StreamingJobDefinitionAssembler;
import io.baize.flow.core.job.handler.JobDefinitionModeHandler;
import io.baize.flow.core.job.registry.JobDefinitionModeHandlerRegistry;
import io.baize.flow.dao.entity.StreamingJobDefinitionContentEntity;
import io.baize.flow.dao.entity.StreamingJobDefinitionEntity;
import io.baize.flow.dao.repository.StreamingJobDefinitionContentDao;
import io.baize.flow.dao.repository.StreamingJobDefinitionDao;
import io.baize.flow.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import io.baize.flow.spi.bean.dto.command.JobDefinitionSaveCommand;
import io.baize.flow.spi.bean.dto.command.StreamingJobSaveCommand;
import io.baize.flow.spi.bean.dto.streaming.StreamingGuideMultiJobSaveCommand;
import io.baize.flow.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import io.baize.flow.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import io.baize.flow.spi.bean.entity.PaginationResult;
import io.baize.flow.spi.bean.vo.JobDefinitionEditDetailVO;
import io.baize.flow.spi.bean.vo.JobDefinitionSaveResultVO;
import io.baize.flow.spi.bean.vo.JobDefinitionStateVO;
import io.baize.flow.spi.bean.vo.StreamingJobDefinitionVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsSnapshotVO;
import io.baize.flow.spi.bean.vo.StreamingMetricsTrendItemVO;
import io.baize.flow.spi.enums.JobRuntimeType;
import io.baize.flow.spi.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class StreamingJobDefinitionServiceImpl extends BaseServiceImpl implements StreamingJobDefinitionService {

    @Resource
    private JobDefinitionModeHandlerRegistry handlerRegistry;

    @Resource
    private StreamingJobDefinitionDao streamingJobDefinitionDao;

    @Resource
    private StreamingJobDefinitionContentDao streamingJobDefinitionContentDao;

    @Resource
    private StreamingJobDefinitionAssembler streamingJobDefinitionAssembler;

    @Resource
    private StreamingJobDefinitionQueryService definitionQueryService;

    @Resource
    private CdcServerIdAllocationService cdcServerIdAllocationService;

    @Resource
    private StreamingJobInstanceService streamingJobInstanceService;

    @Resource
    private StreamingJobMetricsService streamingJobMetricsService;

    @Resource
    private ObjectMapper objectMapper;

    @Override
    public JobDefinitionSaveResultVO saveOrUpdate(StreamingScriptJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public JobDefinitionSaveResultVO saveOrUpdate(StreamingGuideSingleJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public JobDefinitionSaveResultVO saveOrUpdate(StreamingGuideMultiJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Transactional(rollbackFor = Exception.class)
    protected JobDefinitionSaveResultVO doSaveOrUpdate(StreamingJobSaveCommand command) {
        validatePersistCommand(command);
        validateStreaming(command);

        try {
            SaveContext context = prepareSaveContext(command);

            StreamingJobDefinitionEntity entity = saveDefinition(command, context);

            cdcServerIdAllocationService.prepare(command, entity.getId());

            saveDefinitionContent(command, context, entity);

            return buildSaveResult(entity, context.getNextVersion());
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Save or update streaming job definition failed, command={}", command, e);
            throw new ServiceException(e.getMessage());
        }
    }

    @Override
    public String buildHoconConfig(StreamingScriptJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(StreamingGuideSingleJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(StreamingGuideMultiJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    protected String doBuildHoconConfig(StreamingJobSaveCommand command) {
        validatePersistCommand(command);
        validateStreaming(command);

        try {
            JobDefinitionModeHandler handler = getAndValidateHandler(command);
            String hocon = handler.buildHoconConfig(command);

            if (StringUtils.isBlank(hocon)) {
                throw new ServiceException(
                        Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR,
                        "hocon config is empty"
                );
            }

            return hocon;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build streaming hocon config failed, command={}", command, e);
            throw new ServiceException(e.getMessage());
        }
    }

    @Override
    public StreamingJobDefinitionVO selectById(Long id) {
        validateId(id);
        return definitionQueryService.selectById(id);
    }

    @Override
    public PaginationResult<StreamingJobDefinitionVO> paging(StreamingJobDefinitionQueryDTO dto) {
        validatePagingRequest(dto);

        try {
            int offset = (dto.getPageNo() - 1) * dto.getPageSize();

            List<StreamingJobDefinitionVO> records =
                    streamingJobDefinitionDao.selectPage(dto, offset, dto.getPageSize());

            enrichMetrics(records);

            Long total = streamingJobDefinitionDao.count(dto);

            return PaginationResult.buildSuc(records, total, dto.getPageNo(), dto.getPageSize());
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition paging failed, dto={}", dto, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    private void enrichMetrics(List<StreamingJobDefinitionVO> records) {
        if (records == null || records.isEmpty()) {
            return;
        }

        for (StreamingJobDefinitionVO record : records) {
            Long instanceId = record.getInstanceId();
            if (instanceId == null || instanceId <= 0) {
                record.setLatestMetrics(null);
                record.setRecentMetrics(Collections.emptyList());
                continue;
            }

            try {
                StreamingMetricsSnapshotVO latestMetrics =
                        streamingJobMetricsService.latest(instanceId);

                List<StreamingMetricsTrendItemVO> recentMetrics =
                        streamingJobMetricsService.recentTrend(instanceId, 20);

                record.setLatestMetrics(latestMetrics);
                record.setRecentMetrics(recentMetrics == null ? Collections.emptyList() : recentMetrics);
            } catch (Exception e) {
                log.warn("Enrich streaming job metrics failed, definitionId={}, instanceId={}",
                        record.getId(), instanceId, e);

                record.setLatestMetrics(null);
                record.setRecentMetrics(Collections.emptyList());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean delete(Long jobDefinitionId) {
        validateId(jobDefinitionId);

        StreamingJobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(jobDefinitionId);
        validateDelete(definition.getId());

        try {
            cdcServerIdAllocationService.release(jobDefinitionId);
            streamingJobInstanceService.removeAllByDefinitionId(jobDefinitionId);
            streamingJobDefinitionContentDao.deleteByJobDefinitionId(jobDefinitionId);

            boolean deleted = streamingJobDefinitionDao.deleteById(jobDefinitionId);
            if (!deleted) {
                throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR);
            }

            return true;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Delete streaming job definition failed, id={}", jobDefinitionId, e);
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public JobDefinitionEditDetailVO selectEditDetail(Long id) {
        validateId(id);

        try {
            StreamingJobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(id);
            validateEditable(definition);

            StreamingJobDefinitionContentEntity latestContent = getLatestContentOrThrow(id);

            JobDefinitionSaveCommand command = definitionQueryService.buildEditCommand(definition, latestContent);

            return buildEditDetail(command, definition, latestContent);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition edit detail failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateReleaseState(Long id, ReleaseState releaseState) {
        validateId(id);
        validateReleaseState(releaseState);

        try {
            StreamingJobDefinitionEntity entity = definitionQueryService.getDefinitionOrThrow(id);

            ReleaseState currentState = entity.getReleaseState();
            if (releaseState == currentState) {
                log.info("Streaming job definition release state already synced, id={}, state={}",
                        id, releaseState);
                return true;
            }

            if (releaseState.isOnline()) {
                validateBeforeOnline(id);
            }

            if (releaseState.isOffline()) {
                validateBeforeOffline(id);
            }

            boolean updated = streamingJobDefinitionDao.updateReleaseState(id, releaseState);
            if (!updated) {
                throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR);
            }

            log.info("Streaming job definition release state updated, id={}, from={}, to={}",
                    id, currentState, releaseState);
            return true;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Update streaming job definition release state failed, id={}, state={}",
                    id, releaseState, e);
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR);
        }
    }

    private SaveContext prepareSaveContext(StreamingJobSaveCommand command) {
        JobDefinitionModeHandler handler = getAndValidateHandler(command);
        JobDefinitionAnalysisResult analysis = handler.analyze(command);
        String definitionContent = handler.serializeDefinition(command);

        if (StringUtils.isBlank(definitionContent)) {
            throw new ServiceException(
                    Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR,
                    "definition content is empty"
            );
        }

        StreamingJobDefinitionEntity existing = command.getId() == null
                ? null
                : streamingJobDefinitionDao.queryById(command.getId());

        validateWritable(existing);

        int nextVersion = resolveNextVersion(existing);

        SaveContext context = new SaveContext();
        context.setHandler(handler);
        context.setAnalysis(analysis);
        context.setDefinitionContent(definitionContent);
        context.setExisting(existing);
        context.setNextVersion(nextVersion);
        context.setNow(new Date());
        return context;
    }

    private StreamingJobDefinitionEntity saveDefinition(StreamingJobSaveCommand command, SaveContext context) {
        StreamingJobDefinitionEntity entity;

        if (ObjectUtils.isEmpty(context.getExisting())) {
            entity = streamingJobDefinitionAssembler.create(command, context.getAnalysis());
        } else {
            entity = context.getExisting();
            streamingJobDefinitionAssembler.update(
                    entity,
                    command,
                    context.getAnalysis(),
                    context.getNow(),
                    context.getNextVersion()
            );
        }

        normalizePersistState(entity, context.getNextVersion());

        streamingJobDefinitionDao.saveOrUpdate(entity);
        return entity;
    }

    private void saveDefinitionContent(
            StreamingJobSaveCommand command,
            SaveContext context,
            StreamingJobDefinitionEntity entity) {
        if (entity == null || entity.getId() == null) {
            throw new ServiceException(
                    Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR,
                    "streaming definition id is empty"
            );
        }

        StreamingJobDefinitionContentEntity contentEntity =
                StreamingJobDefinitionContentEntity.builder()
                        .jobDefinitionId(entity.getId())
                        .version(context.getNextVersion())
                        .mode(command.getMode())
                        .contentSchemaVersion(1)
                        .definitionContent(context.getDefinitionContent())
                        .envConfig(JSONUtils.toJsonString(command.getEnv()))
                        .build();

        contentEntity.initInsert();
        streamingJobDefinitionContentDao.save(contentEntity);
    }

    private JobDefinitionSaveResultVO buildSaveResult(
            StreamingJobDefinitionEntity entity,
            Integer contentVersion) {
        JobDefinitionStateVO state = JobDefinitionStateVO.synced(
                resolveReleaseState(entity.getReleaseState()),
                entity.getJobVersion(),
                contentVersion
        );

        return JobDefinitionSaveResultVO.builder()
                .id(entity.getId())
                .state(state)
                .build();
    }

    private JobDefinitionEditDetailVO buildEditDetail(
            JobDefinitionSaveCommand command,
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity latestContent) {
        JobDefinitionEditDetailVO detail = objectMapper.convertValue(
                command,
                JobDefinitionEditDetailVO.class
        );

        detail.setState(JobDefinitionStateVO.synced(
                resolveReleaseState(definition.getReleaseState()),
                definition.getJobVersion(),
                latestContent.getVersion()
        ));

        return detail;
    }

    private void normalizePersistState(StreamingJobDefinitionEntity entity, Integer nextVersion) {
        if (entity == null) {
            return;
        }

        entity.setJobVersion(nextVersion);

        if (entity.getReleaseState() == null) {
            entity.setReleaseState(ReleaseState.OFFLINE);
        }
    }

    private ReleaseState resolveReleaseState(ReleaseState releaseState) {
        return releaseState == null ? ReleaseState.OFFLINE : releaseState;
    }

    private int resolveNextVersion(StreamingJobDefinitionEntity existing) {
        if (existing == null || existing.getJobVersion() == null) {
            return 1;
        }

        return existing.getJobVersion() + 1;
    }

    private JobDefinitionModeHandler getAndValidateHandler(JobDefinitionSaveCommand command) {
        validatePersistCommand(command);

        JobDefinitionModeHandler handler = handlerRegistry.getHandler(command.getMode());
        handler.validate(command);

        return handler;
    }

    private void validateBeforeOnline(Long id) {
        StreamingJobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(id);
        StreamingJobDefinitionContentEntity latestContent = getLatestContentOrThrow(id);

        JobDefinitionSaveCommand command = definitionQueryService.buildEditCommand(definition, latestContent);

        if (!(command instanceof StreamingJobSaveCommand)) {
            throw new ServiceException(
                    Status.REQUEST_PARAMS_NOT_VALID_ERROR,
                    "streaming job command"
            );
        }

        String hocon = doBuildHoconConfig((StreamingJobSaveCommand) command);
        if (StringUtils.isBlank(hocon)) {
            throw new ServiceException(
                    Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR,
                    "hocon config is empty"
            );
        }
    }

    private void validateBeforeOffline(Long id) {
        if (streamingJobInstanceService.existsRunningInstance(id)) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "streaming job has running instance, please stop it before offline"
            );
        }
    }

    private void validateDelete(Long id) {
        if (streamingJobInstanceService.existsRunningInstance(id)) {
            throw new ServiceException(
                    Status.DELETE_BATCH_JOB_DEFINITION_ERROR,
                    "streaming job has running instance"
            );
        }
    }

    private void validateWritable(StreamingJobDefinitionEntity existing) {
        if (existing == null) {
            return;
        }

        if (existing.getReleaseState() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }

        if (!existing.getReleaseState().isOffline()) {
            throw new ServiceException(
                    Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR,
                    "only offline streaming job definition can be updated"
            );
        }
    }

    private void validateEditable(StreamingJobDefinitionEntity definition) {
        if (definition == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }

        if (definition.getReleaseState() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }

        if (!definition.getReleaseState().isOffline()) {
            throw new ServiceException(
                    Status.QUERY_BATCH_JOB_DEFINITION_ERROR,
                    "only offline streaming job definition can be edited"
            );
        }
    }

    private StreamingJobDefinitionContentEntity getLatestContentOrThrow(Long id) {
        StreamingJobDefinitionContentEntity latestContent =
                streamingJobDefinitionContentDao.queryLatestByJobDefinitionId(id);

        if (latestContent == null) {
            throw new ServiceException(
                    Status.BATCH_JOB_DEFINITION_NOT_EXIST,
                    "streaming definition content not found"
            );
        }

        return latestContent;
    }

    private void validateStreaming(StreamingJobSaveCommand command) {
        if (command.getRuntimeType() != JobRuntimeType.STREAMING) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "runtimeType");
        }
    }

    private void validatePersistCommand(JobDefinitionSaveCommand command) {
        if (command == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "command");
        }
        if (command.getBasic() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "basic");
        }
        if (command.getMode() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "mode");
        }
        if (command.getId() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
        if (StringUtils.isBlank(command.getBasic().getJobName())) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobName");
        }
        if (command.getEnv() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "env");
        }
    }

    private void validateReleaseState(ReleaseState releaseState) {
        if (releaseState == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }
    }

    private void validatePagingRequest(StreamingJobDefinitionQueryDTO dto) {
        if (dto == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "dto");
        }
        if (dto.getPageNo() == null || dto.getPageNo() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "pageNo");
        }
        if (dto.getPageSize() == null || dto.getPageSize() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "pageSize");
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
    }

    @Data
    private static class SaveContext {
        private JobDefinitionModeHandler handler;
        private JobDefinitionAnalysisResult analysis;
        private String definitionContent;
        private StreamingJobDefinitionEntity existing;
        private Integer nextVersion;
        private Date now;
    }
}