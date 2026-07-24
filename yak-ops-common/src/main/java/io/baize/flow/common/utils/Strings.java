package io.baize.flow.common.utils;

import org.springframework.lang.Nullable;

public final class Strings {
    private Strings() {
    }

    public static boolean isNullOrEmpty(@Nullable String string) {
        return string == null || string.isEmpty();
    }

}
