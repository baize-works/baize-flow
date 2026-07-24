package io.baize.flow.spi.bean.entity;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;


@Data
public class BaseEntity implements Serializable {
    protected Date createTime;

    protected Date updateTime;
}
