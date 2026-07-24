package io.baize.flow.engine.client.handler;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import io.baize.flow.common.enums.SeaTunnelClientHealthStatusEnum;
import io.baize.flow.dao.repository.JobInstanceDao;
import io.baize.flow.dao.repository.SeaTunnelClientDao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@Slf4j
public class ZetaEngineFailureHandler {

    @Resource
    private SeaTunnelClientDao seaTunnelClientDao;

    @Resource
    private JobInstanceDao jobInstanceDao;


    @Transactional(rollbackFor = Exception.class)
    public void markClientLive(Long clientId) {
        seaTunnelClientDao.updateHealthStatus(
                clientId,
                SeaTunnelClientHealthStatusEnum.LIVE.getCode(),
                new Date()
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void markClientDeadAndFailRunningInstances(Long clientId, String errorMessage) {
        seaTunnelClientDao.updateHealthStatus(
                clientId,
                SeaTunnelClientHealthStatusEnum.DEAD.getCode(),
                null
        );

        int batchCount = jobInstanceDao.failRunningInstancesByClientId(clientId, errorMessage);

        log.warn(
                "Zeta engine unavailable, marked running instances as FAILED, clientId={}, batchCount={}",
                clientId,
                batchCount
        );
    }
}