package io.baize.flow.dao.repository;

import io.baize.flow.dao.entity.AlarmRuleEntity;

import java.util.List;

public interface AlarmRuleDao extends IDao<AlarmRuleEntity> {

    List<AlarmRuleEntity> listEnabled();
}
