package io.baize.flow.api.service;

public interface BaseService {
    /**
     * check checkDescriptionLength
     *
     * @param description input String
     * @return ture if Length acceptable, Length exceeds return false
     */
    boolean checkDescriptionLength(String description);
}
