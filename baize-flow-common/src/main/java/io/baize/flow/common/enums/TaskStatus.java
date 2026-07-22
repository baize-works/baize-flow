package io.baize.flow.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 任务状态枚举
 */
@AllArgsConstructor
@Getter
public enum TaskStatus {
    DRAFT("DRAFT", "草稿"),
    ENABLED("ENABLED", "已启用"),
    DISABLED("DISABLED", "已禁用"),
    DELETED("DELETED", "已删除");

    @EnumValue
    private final String code;
    private final String description;

}
