package io.baize.flow.api.security.impl.pwd;

import io.baize.flow.api.security.impl.AbstractAuthenticator;
import io.baize.flow.dao.entity.User;

public class PasswordAuthenticator extends AbstractAuthenticator {

    @Override
    public User login(String userId, String password, String extra) {
        return userService.queryUser(userId, password);
    }
}
