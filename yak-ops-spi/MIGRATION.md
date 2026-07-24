# SPI migration window

`yak-ops-spi` is reserved for versioned datasource/alarm extension points and form metadata.
Application and HTTP DTOs, VOs, entities, pagination responses, and SeaTunnel runtime models
remain temporarily for binary compatibility only. They are deprecated compatibility types during
Phase 4/5 and must not be used by new plugins. New contracts belong to the application or web
boundary; persistence mapping belongs to infrastructure.

The SPI module must not introduce Spring, MyBatis, SeaTunnel, HTTP, or persistence dependencies.
