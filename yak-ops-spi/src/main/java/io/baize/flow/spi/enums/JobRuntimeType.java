package io.baize.flow.spi.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum JobRuntimeType {

    BATCH("BATCH", "离线任务");

    @EnumValue
    private final String code;

    private final String description;
}
