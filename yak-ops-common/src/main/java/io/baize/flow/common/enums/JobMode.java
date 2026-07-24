package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum JobMode {
    BATCH("BATCH", "离线"),
    STREAMING("STREAMING", "实时");

    @EnumValue
    private final String code;
    private final String description;
}
