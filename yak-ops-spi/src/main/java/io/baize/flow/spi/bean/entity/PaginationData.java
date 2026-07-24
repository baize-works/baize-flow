package io.baize.flow.spi.bean.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "分页数据")
public class PaginationData<T> {

    @Schema(description = "业务数据")
    private List<T> bizData;

    @Schema(description = "分页信息")
    private Pagination pagination;
}
