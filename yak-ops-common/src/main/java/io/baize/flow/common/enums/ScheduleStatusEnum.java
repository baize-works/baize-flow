package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum ScheduleStatusEnum {
    NORMAL(1, "normal"),
    PAUSE(2, "pause"),
    EMPTY(3, "empty");

    @EnumValue
    private final int code;
    private final String desc;


    public static ScheduleStatusEnum fromCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return PAUSE;
        }
        for (ScheduleStatusEnum value : values()) {
            if (value.getDesc().equalsIgnoreCase(code.trim())) {
                return value;
            }
        }
        return PAUSE;
    }

    public boolean shouldStartQuartz() {
        return this == NORMAL || this == EMPTY;
    }
}