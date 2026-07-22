package io.baize.flow.api.service;

import io.baize.flow.common.enums.ScheduleStatusEnum;
import io.baize.flow.dao.entity.JobSchedule;
import io.baize.flow.spi.bean.dto.SeaTunnelJobScheduleDTO;
import org.quartz.SchedulerException;

import java.util.Date;
import java.util.List;

public interface JobScheduleService {

    Long createTaskSchedule(SeaTunnelJobScheduleDTO dto) throws SchedulerException;

    boolean updateTaskSchedule(SeaTunnelJobScheduleDTO dto) throws SchedulerException;

    boolean deleteByTaskDefinitionId(Long taskDefinitionId);

    JobSchedule getByTaskDefinitionId(Long taskDefinitionId);

    Boolean startSchedule(Long taskScheduleId);

    Boolean stopSchedule(Long taskScheduleId);

    boolean triggerSchedule(Long taskScheduleId) throws SchedulerException;

    boolean updateScheduleTime(Long taskScheduleId, String cronExpression) throws SchedulerException;

    List<JobSchedule> getRunningSchedules();

    boolean existsByTaskDefinitionId(Long taskDefinitionId);

    boolean updateScheduleStatus(Long taskScheduleId, ScheduleStatusEnum status);

    boolean updateLastScheduleTime(Long taskScheduleId);

    boolean updateNextScheduleTime(Long taskScheduleId, Date nextScheduleTime);

    List<String> getLast5ExecutionTimesByCron(String cronExpression);

    void removeByDefinitionId(Long definitionId);
}