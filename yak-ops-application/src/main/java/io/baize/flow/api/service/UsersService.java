package io.baize.flow.api.service;


import io.baize.flow.api.model.User;

/**
 * users service
 */
public interface UsersService  {

    User queryUser(String userId, String password);

    User getUserInfo(User loginUser);

    User getById(int userId);
}
