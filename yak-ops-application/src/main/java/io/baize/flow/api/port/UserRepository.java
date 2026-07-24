package io.baize.flow.api.port;

import io.baize.flow.api.model.User;
import java.util.Optional;

/** Output port for user persistence. */
public interface UserRepository {
    Optional<User> findByUserName(String userName);
    Optional<User> findById(int userId);
}
