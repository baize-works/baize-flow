package io.baize.flow.spi.bean.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Option information")
public class OptionVO {

    @Schema(description = "Option value", example = "users", requiredMode = Schema.RequiredMode.REQUIRED)
    private Object value;

    @Schema(description = "Option label", example = "Users Table")
    private String label;

    @Schema(description = "Option description", example = "Table storing user information")
    private String description;
}