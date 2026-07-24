package io.baize.flow.spi.bean.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
/**
 * @deprecated Phase 4/5 compatibility contract; migrate to an application or web contract.
 */
@Deprecated(since = "1.0.0", forRemoval = true)
public class NodeTypes {
    private String sourceTypes;
    private String sinkTypes;
    private Map<String, List<String>> sourceTableMap;
    private Map<String, List<String>> sinkTableMap;

    public NodeTypes(String sourceTypes, String sinkTypes) {
        this.sourceTypes = sourceTypes;
        this.sinkTypes = sinkTypes;
    }
}
