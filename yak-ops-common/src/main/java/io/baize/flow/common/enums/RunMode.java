package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum RunMode {
    SCHEDULED("SCHEDULED", "SCHEDULED"),
    MANUAL("MANUAL", "MANUAL");

    @EnumValue
    private final String code;
    private final String description;
}
