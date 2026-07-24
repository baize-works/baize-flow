package io.baize.flow.common.lifecycle;

public class ServerLifeCycleException extends Exception {

    public ServerLifeCycleException(String message) {
        super(message);
    }

    public ServerLifeCycleException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
