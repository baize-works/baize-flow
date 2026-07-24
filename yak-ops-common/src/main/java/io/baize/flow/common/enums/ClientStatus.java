package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * Client status enum
 */
public enum ClientStatus {
    CONNECTION_SUCCESS("CONNECTION_SUCCESS"),
    CONNECTION_FAILED("CONNECTION_FAILED"),
    UNKNOWN("UNKNOWN");

    @EnumValue
    private final String value;

    ClientStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
