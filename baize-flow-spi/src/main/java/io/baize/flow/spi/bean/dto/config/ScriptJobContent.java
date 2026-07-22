package io.baize.flow.spi.bean.dto.config;

import lombok.Data;

import java.util.Map;

@Data
public class ScriptJobContent {

    /**
     * 比如 HOCON
     */
    private String scriptType;

    /**
     * 脚本文本
     */
    private String hoconContent;

}

