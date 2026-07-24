package io.baize.flow.api.service.impl;

import lombok.extern.slf4j.Slf4j;
import io.baize.flow.api.service.BaseService;

/**
 * base service impl
 */
@Slf4j
public class BaseServiceImpl implements BaseService {

    @Override
    public boolean checkDescriptionLength(String description) {
        return description != null && description.codePointCount(0, description.length()) > 255;
    }

}
