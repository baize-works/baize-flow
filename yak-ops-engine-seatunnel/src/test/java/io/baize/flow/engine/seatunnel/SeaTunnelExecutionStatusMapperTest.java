package io.baize.flow.engine.seatunnel;
import static org.junit.jupiter.api.Assertions.assertEquals;
import io.baize.flow.domain.job.JobExecutionStatus;
import io.baize.flow.engine.api.EngineJobStatus;
import org.junit.jupiter.api.Test;
class SeaTunnelExecutionStatusMapperTest {
 @Test void maps_engine_states_and_adapter_failures() {
  assertEquals(JobExecutionStatus.RUNNING, SeaTunnelExecutionStatusMapper.map(EngineJobStatus.RUNNING));
  assertEquals(JobExecutionStatus.SUCCEEDED, SeaTunnelExecutionStatusMapper.map(EngineJobStatus.FINISHED));
  assertEquals(JobExecutionStatus.FAILED, SeaTunnelExecutionStatusMapper.submissionFailed());
  assertEquals(JobExecutionStatus.UNKNOWN, SeaTunnelExecutionStatusMapper.unreachable());
  assertEquals(JobExecutionStatus.CANCELED, SeaTunnelExecutionStatusMapper.map(EngineJobStatus.CANCELED));
 }
}
