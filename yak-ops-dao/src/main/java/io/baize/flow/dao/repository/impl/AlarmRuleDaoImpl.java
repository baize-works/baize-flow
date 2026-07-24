package io.baize.flow.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.NonNull;
import io.baize.flow.dao.entity.AlarmRuleEntity;
import io.baize.flow.dao.mapper.AlarmRuleMapper;
import io.baize.flow.dao.repository.AlarmRuleDao;
import io.baize.flow.dao.repository.BaseDao;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AlarmRuleDaoImpl extends BaseDao<AlarmRuleEntity, AlarmRuleMapper> implements AlarmRuleDao {

    public AlarmRuleDaoImpl(@NonNull AlarmRuleMapper alarmRuleMapper) {
        super(alarmRuleMapper);
    }

    @Override
    public List<AlarmRuleEntity> listEnabled() {
        LambdaQueryWrapper<AlarmRuleEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AlarmRuleEntity::getEnabled, 1);
        return mybatisMapper.selectList(wrapper);
    }
}
