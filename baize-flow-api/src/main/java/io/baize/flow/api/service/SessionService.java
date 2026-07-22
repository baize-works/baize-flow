package io.baize.flow.api.service;


import jakarta.servlet.http.HttpServletRequest;
import io.baize.flow.dao.entity.Session;
import io.baize.flow.dao.entity.User;

/**
 * session service
 */
public interface SessionService {

    /**
     * get user session from request
     *
     * @param request request
     * @return session
     */
    Session getSession(HttpServletRequest request);

    /**
     * create session
     *
     * @param userPO user
     * @param ip ip
     * @return session string
     */
    String createSession(User userPO, String ip);

    /**
     * sign out
     * remove ip restrictions
     *
     * @param ip   no use
     * @param loginUserPO login user
     */
    void signOut(String ip, User loginUserPO);
}
