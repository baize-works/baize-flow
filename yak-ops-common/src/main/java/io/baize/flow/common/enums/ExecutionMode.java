package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ExecutionMode {
    MANUAL("MANUAL", "手动执行"),
    SCHEDULED("SCHEDULED", "调度执行"),
    CLUSTER("CLUSTER", "集群");

    @EnumValue
    private final String code;
    private final String description;
}
