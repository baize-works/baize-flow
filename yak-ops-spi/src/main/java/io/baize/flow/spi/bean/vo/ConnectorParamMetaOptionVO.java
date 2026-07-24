package io.baize.flow.spi.bean.vo;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Connector parameter option")
public class ConnectorParamMetaOptionVO {

    @Schema(description = "Option value, same as paramName", example = "fetch_size")
    private String value;

    @Schema(description = "Option label", example = "抓取大小")
    private String label;

    @Schema(description = "Parameter description")
    private String description;

    @Schema(description = "Default value", example = "1000")
    private String defaultValue;

    @Schema(description = "Example value", example = "2048")
    private String exampleValue;

    @Schema(description = "Parameter type", example = "number")
    private String paramType;

    @Schema(description = "Required flag: 0 false, 1 true")
    private Integer requiredFlag;
}