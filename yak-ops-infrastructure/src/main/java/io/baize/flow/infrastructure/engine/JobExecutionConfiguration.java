package io.baize.flow.infrastructure.engine;

import io.baize.flow.domain.job.CreateJobExecutionService;
import io.baize.flow.domain.job.JobExecutionRepository;
import io.baize.flow.domain.job.UpdateJobExecutionStatusService;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JobExecutionConfiguration {
    @Bean Clock jobExecutionClock() { return Clock.systemUTC(); }
    @Bean CreateJobExecutionService createJobExecutionService(JobExecutionRepository repository, Clock jobExecutionClock) { return new CreateJobExecutionService(repository, jobExecutionClock); }
    @Bean UpdateJobExecutionStatusService updateJobExecutionStatusService(JobExecutionRepository repository, Clock jobExecutionClock) { return new UpdateJobExecutionStatusService(repository, jobExecutionClock); }
}
