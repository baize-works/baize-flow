package io.baize.flow.spi.bean.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDefinitionSaveResultVO {

    /**
     * Job definition id.
     */
    private Long id;

    /**
     * State after save.
     */
    private JobDefinitionStateVO state;
}