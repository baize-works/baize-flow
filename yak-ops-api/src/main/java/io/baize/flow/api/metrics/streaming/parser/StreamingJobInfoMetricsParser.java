package io.baize.flow.api.metrics.streaming.parser;

import io.baize.flow.api.metrics.fetch.EngineJobInfo;
import io.baize.flow.api.metrics.streaming.model.StreamingParsedJobMetrics;

public interface StreamingJobInfoMetricsParser {

    StreamingParsedJobMetrics parse(EngineJobInfo jobInfo);
}