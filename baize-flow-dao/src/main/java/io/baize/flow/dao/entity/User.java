package io.baize.flow.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import io.baize.flow.common.enums.UserType;

import java.util.Date;

@Data
@TableName("t_baize_flow_user")
public class User {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    private String userName;

    private String userPassword;

    private String email;

    private String phone;

    private UserType userType;

    private int state;

    private Date createTime;

    private Date updateTime;

}
