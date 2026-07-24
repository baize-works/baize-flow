package io.baize.flow.common.enums;


/**
 * Client type
 */
public enum ClientType {
    SPARK("SPARK"),
    FLINK("FLINK"),
    ZETA("ZETA");

    private final String value;

    ClientType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
