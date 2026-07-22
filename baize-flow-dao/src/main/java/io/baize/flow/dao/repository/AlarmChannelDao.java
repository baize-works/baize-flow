package io.baize.flow.dao.repository;

import io.baize.flow.dao.entity.AlarmChannelEntity;

import java.util.Collection;
import java.util.List;

public interface AlarmChannelDao extends IDao<AlarmChannelEntity> {

    List<AlarmChannelEntity> listEnabled();

    List<AlarmChannelEntity> listEnabledByIds(Collection<Long> ids);
}
