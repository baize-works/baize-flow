package io.baize.flow.spi.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Stream job definition DTO")
public class SeatunnelStreamJobDefinitionDTO extends BaseSeatunnelJobDefinitionDTO {

    @Schema(
            description = "Job configuration in HOCON/JSON format",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = """
            {
              "source": {
                "type": "Kafka",
                "bootstrap.servers": "localhost:9092",
                "topic": "input-topic",
                "group.id": "seatunnel-consumer"
              },
              "transform": [
                {
                  "type": "sql",
                  "sql": "SELECT id, name, timestamp FROM source"
                }
              ],
              "sink": {
                "type": "Elasticsearch",
                "hosts": ["localhost:9200"],
                "index": "output-index",
                "bulk.size": 1000
              }
            }
            """
    )
    private String jobDefinitionInfo;

    @Schema(
            description = "Checkpoint interval in milliseconds",
            example = "60000",
            defaultValue = "60000"
    )
    private Long checkpointInterval;

    @Schema(
            description = "Checkpoint timeout in milliseconds",
            example = "300000",
            defaultValue = "300000"
    )
    private Long checkpointTimeout;

    @Schema(
            description = "Plugin name for stream processing engine",
            example = "SeaTunnel",
            allowableValues = {"SeaTunnel", "Flink", "Spark"}
    )
    private String pluginName;

    @Schema(
            description = "Job type",
            example = "STREAMING",
            allowableValues = {"STREAMING"}
    )
    private String jobType;

    @Schema(
            description = "Source table name for filtering",
            example = "input-topic"
    )
    private String sourceTable;

    @Schema(
            description = "Sink table name for filtering",
            example = "output-index"
    )
    private String sinkTable;

    @Schema(
            description = "Creation time",
            example = "2024-01-01 10:00:00",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Date createTime;

    @Schema(
            description = "Last update time",
            example = "2024-01-02 15:30:00",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Date updateTime;

    @Override
    @Schema(hidden = true)
    public String getJobDefinitionInfo() {
        return this.jobDefinitionInfo;
    }

    @Override
    @Schema(description = "Job type", example = "STREAMING", allowableValues = {"STREAMING"})
    public String getJobType() {
        return this.jobType;
    }
}