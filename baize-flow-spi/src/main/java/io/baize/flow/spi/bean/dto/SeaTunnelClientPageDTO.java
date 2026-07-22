package io.baize.flow.spi.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientPageDTO {
    private Integer pageNo;
    private Integer pageSize;
    private String keywords;
    private List<String> engineTypes;
    private List<Integer> healthStatusList;
    private String sortField;
    private String sortType;
}
