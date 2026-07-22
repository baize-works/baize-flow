package io.baize.flow.common.exception;

import io.baize.flow.common.enums.JobSubmitStage;

public class JobSubmitException extends RuntimeException {

    private final JobSubmitStage stage;

    public JobSubmitException(JobSubmitStage stage, String message, Throwable cause) {
        super(message, cause);
        this.stage = stage;
    }

    public JobSubmitStage getStage() {
        return stage;
    }
}
