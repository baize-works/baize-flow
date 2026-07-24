package io.baize.flow.spi.bean.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class StreamingMetricsTrendVO {

    private List<StreamingMetricsTrendItemVO> items = new ArrayList<>();
}