package io.baize.flow.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.annotation.Resource;
import io.baize.flow.api.service.UsersService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.baize.flow.common.enums.UserType;
import io.baize.flow.dao.entity.User;
import io.baize.flow.dao.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UsersServiceImpl implements UsersService {

    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    @Resource
    private UserMapper userMapper;

    @Override
    public User queryUser(String name, String password) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUserName, name);
        User user = userMapper.selectOne(wrapper);
        if (user == null || !PASSWORD_ENCODER.matches(password, user.getUserPassword())) {
            return null;
        }
        return user;
    }

    @Override
    public User getUserInfo(User loginUser) {
        User User;
        if (loginUser.getUserType() == UserType.ADMIN_USER) {
            User = loginUser;
        } else {
            User = userMapper.selectById(loginUser.getId());
        }
        return User;
    }

    @Override
    public User getById(int userId) {
        return userMapper.selectById(userId);
    }
}
