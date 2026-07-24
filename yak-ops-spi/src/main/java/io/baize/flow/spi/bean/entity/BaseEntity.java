package io.baize.flow.spi.bean.entity;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;


@Data
/**
 * @deprecated Phase 4/5 compatibility contract; migrate to an application or web contract.
 */
@Deprecated(since = "1.0.0", forRemoval = true)
public class BaseEntity implements Serializable {
    protected Date createTime;

    protected Date updateTime;
}
