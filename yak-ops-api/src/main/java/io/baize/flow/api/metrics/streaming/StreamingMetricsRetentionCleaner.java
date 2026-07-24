package io.baize.flow.api.metrics.streaming;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.service.StreamingJobMetricsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class StreamingMetricsRetentionCleaner {

    @Resource
    private StreamingJobMetricsService streamingJobMetricsService;

    @Value("${seatunnel.streaming.metrics.retention-days:7}")
    private Long retentionDays;

    @Scheduled(cron = "${seatunnel.streaming.metrics.retention-cron:0 20 3 * * ?}")
    public void clean() {
        if (retentionDays == null || retentionDays <= 0) {
            return;
        }

        try {
            streamingJobMetricsService.deleteExpired(retentionDays);
            log.info("Streaming metrics retention cleaned, retentionDays={}", retentionDays);
        } catch (Exception e) {
            log.warn("Streaming metrics retention clean failed, retentionDays={}", retentionDays, e);
        }
    }
}