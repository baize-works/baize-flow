package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * Client type
 */
public enum ClientType {
    SPARK("SPARK"),
    FLINK("FLINK"),
    ZETA("ZETA");

    @EnumValue
    private final String value;

    ClientType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
