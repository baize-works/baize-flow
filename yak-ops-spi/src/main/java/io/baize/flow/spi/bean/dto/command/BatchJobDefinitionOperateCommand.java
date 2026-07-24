package io.baize.flow.spi.bean.dto.command;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BatchJobDefinitionOperateCommand {

    @NotEmpty(message = "jobDefinitionIds cannot be empty")
    private List<Long> jobDefinitionIds;
}