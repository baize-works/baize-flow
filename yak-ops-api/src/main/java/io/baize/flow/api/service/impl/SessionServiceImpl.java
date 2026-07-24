package io.baize.flow.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.annotation.Resource;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import io.baize.flow.api.controller.BaseController;
import io.baize.flow.api.service.SessionService;
import io.baize.flow.common.constants.Constants;
import io.baize.flow.dao.entity.Session;
import io.baize.flow.dao.entity.User;
import io.baize.flow.dao.mapper.SessionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class SessionServiceImpl implements SessionService {
    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    @Resource
    private SessionMapper sessionMapper;

    @Override
    public Session getSession(HttpServletRequest request) {
        String sessionId = request.getHeader(Constants.SESSION_ID);

        if (StringUtils.isBlank(sessionId)) {
            Cookie cookie = WebUtils.getCookie(request, Constants.SESSION_ID);

            if (cookie != null) {
                sessionId = cookie.getValue();
            }
        }

        if (StringUtils.isBlank(sessionId)) {
            return null;
        }

        String ip = BaseController.getClientIpAddress(request);
        logger.debug("get session: {}, ip: {}", sessionId, ip);

        return sessionMapper.selectById(sessionId);
    }

    @Override
    @Transactional
    public String createSession(User User, String ip) {
        Session Session = null;

        LambdaQueryWrapper<Session> sessionLambdaQueryWrapper = new LambdaQueryWrapper<>();
        sessionLambdaQueryWrapper.eq(io.baize.flow.dao.entity.Session::getUserId, User.getId());
        // logined
        List<Session> SessionList = sessionMapper.selectList(sessionLambdaQueryWrapper);

        Date now = new Date();

        /*
         * if you have logged in and are still valid, return directly
         */
        if (CollectionUtils.isNotEmpty(SessionList)) {
            // is session list greater 1 ， delete other ，get one
            if (SessionList.size() > 1) {
                for (int i = 1; i < SessionList.size(); i++) {
                    sessionMapper.deleteById(SessionList.get(i).getId());
                }
            }
            Session = SessionList.get(0);
            if (now.getTime() - Session.getLastLoginTime().getTime() <= Constants.SESSION_TIME_OUT * 1000) {
                /*
                 * updateProcessInstance the latest login time
                 */
                Session.setLastLoginTime(now);
                sessionMapper.updateById(Session);

                return Session.getId();

            } else {
                /*
                 * session expired, then delete this session first
                 */
                sessionMapper.deleteById(Session.getId());
            }
        }

        // assign new session
        Session = new Session();

        Session.setId(UUID.randomUUID().toString());
        Session.setIp(ip);
        Session.setUserId(User.getId());
        Session.setLastLoginTime(now);

        sessionMapper.insert(Session);

        return Session.getId();
    }

    @Override
    public void signOut(String ip, User loginUser) {
        try {
            /*
             * query session by user id and ip
             */
            LambdaQueryWrapper<Session> sessionLambdaQueryWrapper = new LambdaQueryWrapper<>();
            sessionLambdaQueryWrapper.eq(Session::getUserId, loginUser.getId());
            sessionLambdaQueryWrapper.eq(Session::getIp, ip);
            Session Session = sessionMapper.selectOne(sessionLambdaQueryWrapper);

            //delete session
            sessionMapper.deleteById(Session.getId());
        } catch (Exception e) {
            logger.warn("userId : {} , ip : {} , find more one session", loginUser.getId(), ip);
        }
    }
}
