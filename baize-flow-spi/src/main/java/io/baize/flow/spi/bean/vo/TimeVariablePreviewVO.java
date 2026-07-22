package io.baize.flow.spi.bean.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeVariablePreviewVO {

    private String expression;

    private String timeFormat;

    private String baseTime;

    private String value;
}