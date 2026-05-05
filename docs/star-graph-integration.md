# Star Graph Integration

`star-graph` has been migrated into ForgePilot Studio as a third-party integration asset under `third_party/star-graph`.

## Role

`star-graph` is a Java 17 / Spring Boot client for ComfyUI. It provides reusable REST access, WebSocket task updates, upload/view helpers, and sample workflow integration code for image-generation systems.

Inside ForgePilot Studio, this code is kept as a reference integration module rather than a runtime dependency of the Python or frontend application. That keeps the main build path focused while preserving the ComfyUI Java client implementation for future product integration.

## Location

- Source: `third_party/star-graph/src`
- Maven project: `third_party/star-graph/pom.xml`
- Original documentation: `third_party/star-graph/README.md`

## Validation

The module can be checked independently with:

```bash
cd third_party/star-graph
mvn -DskipTests compile
```

