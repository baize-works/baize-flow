package io.baize.flow.api.utils;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.baize.flow.common.utils.JSONUtils;
import io.baize.flow.core.dag.DagCheckResult;
import io.baize.flow.core.dag.DagGraph;
import io.baize.flow.core.dag.DagValidator;
import io.baize.flow.core.dag.GraphConnectivityValidator;
import io.baize.flow.core.dag.IsolatedNodeValidator;
import io.baize.flow.core.dag.CycleDetectionValidator;
import io.baize.flow.core.dag.TransformSingleConnectionValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

/**
 * Utility class for parsing and validating DAG definitions.
 *
 * <p>Provides methods to:
 * <ul>
 *   <li>Parse DAG JSON definitions</li>
 *   <li>Execute a chain of {@link DagValidator}s</li>
 *   <li>Return validated {@link DagGraph} objects</li>
 * </ul>
 */
public final class DagUtil {

    private static final Logger log = LoggerFactory.getLogger(DagUtil.class);

    /**
     * Default immutable validator chain applied to DAG validation.
     */
    private static final List<DagValidator> DEFAULT_VALIDATORS =
            Collections.unmodifiableList(Arrays.asList(
                    new IsolatedNodeValidator(),
                    new GraphConnectivityValidator(),
                    new CycleDetectionValidator(),
                    new TransformSingleConnectionValidator()
            ));

    private DagUtil() {
        throw new UnsupportedOperationException("Construct DagUtil");
    }

    /**
     * Parse and validate a DAG JSON string using the default validators.
     *
     * @param json DAG definition in JSON format
     * @return validated {@link DagGraph}
     * @throws DagValidationException if validation fails
     */
    public static DagGraph parseAndCheck(String json) throws DagValidationException {
        return parseAndCheck(json, DEFAULT_VALIDATORS);
    }

    /**
     * Parse and validate a DAG JSON string using the specified validators.
     *
     * @param json       DAG definition in JSON format
     * @param validators list of validators to apply
     * @return validated {@link DagGraph}
     * @throws DagValidationException if validation fails
     */
    public static DagGraph parseAndCheck(String json, List<DagValidator> validators) throws DagValidationException {
        DagCheckResult result = checkOnly(json, validators);

        if (!result.isValid()) {
            StringBuilder errorMsg = new StringBuilder("DAG validation failed:\n");
            result.getErrors().forEach(error -> errorMsg.append("- ").append(error).append("\n"));
            throw new DagValidationException(errorMsg.toString());
        }

        result.getWarnings().forEach(warning -> log.warn("DAG warning: {}", warning));

        ObjectNode dagJson = JSONUtils.parseObject(json);
        DagGraph graph = new DagGraph();
        graph.setNodes(jsonArrayToList((ArrayNode) dagJson.path("nodes")));
        graph.setEdges(jsonArrayToList((ArrayNode) dagJson.path("edges")));
        return graph;
    }

    /**
     * Validate a DAG JSON string and return the validation result only using default validators.
     *
     * @param json DAG definition in JSON format
     * @return validation result
     */
    public static DagCheckResult checkOnly(String json) {
        return checkOnly(json, DEFAULT_VALIDATORS);
    }

    /**
     * Validate a DAG JSON string using the specified validators
     * and return the validation result only.
     *
     * @param json       DAG definition in JSON format
     * @param validators list of validators to apply
     * @return validation result
     */
    public static DagCheckResult checkOnly(String json, List<DagValidator> validators) {
        try {
            ObjectNode dagJson = JSONUtils.parseObject(json);
            List<ObjectNode> nodes = jsonArrayToList((ArrayNode) dagJson.path("nodes"));
            List<ObjectNode> edges = jsonArrayToList((ArrayNode) dagJson.path("edges"));
            return performValidation(nodes, edges, validators);
        } catch (Exception e) {
            DagCheckResult result = new DagCheckResult();
            result.addError("Failed to parse DAG JSON: " + e.getMessage());
            return result;
        }
    }

    /**
     * Execute the given validators against the provided nodes and edges.
     *
     * @param nodes      list of node definitions
     * @param edges      list of edge definitions
     * @param validators list of validators to execute
     * @return validation result
     */
    private static DagCheckResult performValidation(
            List<ObjectNode> nodes,
            List<ObjectNode> edges,
            List<DagValidator> validators) {

        DagCheckResult result = new DagCheckResult();
        result.setValid(true);

        if (validators == null || validators.isEmpty()) {
            return result;
        }

        for (DagValidator validator : validators) {
            if (!result.isValid()) {
                break;
            }

            try {
                validator.validate(nodes, edges, result);
            } catch (Exception e) {
                result.addError("Validator execution failed: " + e.getMessage());
                log.error("Validator {} failed: {}", validator.getClass().getSimpleName(), e.getMessage(), e);
            }
        }

        return result;
    }

    /**
     * Helper method to convert ArrayNode to List<ObjectNode>.
     *
     * @param array input ArrayNode
     * @return List of ObjectNode
     */
    private static List<ObjectNode> jsonArrayToList(ArrayNode array) {
        List<ObjectNode> result = new ArrayList<>();
        if (array == null || array.isEmpty()) {
            return result;
        }

        array.forEach(node -> {
            if (node instanceof ObjectNode) {
                result.add((ObjectNode) node);
            }
        });
        return result;
    }

    /**
     * Custom exception to distinguish DAG validation failures.
     */
    public static class DagValidationException extends RuntimeException {
        public DagValidationException(String message) {
            super(message);
        }
    }
}