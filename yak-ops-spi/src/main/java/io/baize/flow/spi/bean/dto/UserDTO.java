package io.baize.flow.spi.bean.dto;

import lombok.Data;
import io.baize.flow.common.enums.UserType;

import java.util.Date;

@Data
public class UserDTO {

    private Integer id;

    private String userName;

    private String userPassword;

    private String email;

    private String phone;

    private UserType userType;

    private int state;

    private String timeZone;

    private Date createTime;

    private Date updateTime;

}
