package io.baize.flow.spi.bean.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.ToString;
import io.baize.flow.common.constants.Constants;

import java.io.Serial;
import java.io.Serializable;

@Data
@ToString
public class BaseResult implements Serializable {

    @Serial
    private static final long serialVersionUID = -5771016784021901099L;

    @Schema(description = "Status code", example = "200", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer code;

    @Schema(description = "Response message", example = "Success")
    private String message;


    public boolean successful() {
        return !this.failed();
    }

    public boolean failed() {
        return !Constants.SUCCESS.equals(code);
    }
}
