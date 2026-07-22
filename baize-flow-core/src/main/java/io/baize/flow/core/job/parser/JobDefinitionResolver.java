package io.baize.flow.core.job.parser;


import io.baize.flow.spi.bean.entity.NodeTypes;

public interface JobDefinitionResolver {

    NodeTypes resolveDag(String jobInfo);

    NodeTypes resolveWholeSync(String jobInfo);
}

