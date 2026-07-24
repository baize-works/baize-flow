package io.baize.flow.spi.bean.vo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientLogVO {
    private Long clientId;
    private String clientName;
    private String content;
}
