package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum SyncModeEnum {

    DAG("DAG", "DAG"),
    WHOLE_SYNC("WHOLE_SYNC", "WHOLE_SYNC");

    @EnumValue
    private final String code;
    private final String description;
}
