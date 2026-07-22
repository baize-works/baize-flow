# Contributing to Baize Flow

Thank you for your interest in contributing to Baize Flow. Contributions of all kinds are welcome, including bug reports, feature requests, documentation updates, tests, and code.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Ways to Contribute

- Report bugs with clear reproduction steps.
- Suggest product or connector improvements.
- Improve documentation, examples, and release notes.
- Add tests for backend and frontend behavior.
- Submit focused pull requests that solve a single problem.

## Development Setup

### Requirements

- JDK 21 or later
- Maven 3.9+ or the included Maven Wrapper
- Node.js 20 or later
- npm 10 or later

### Backend

```bash
./mvnw -T 1C clean verify
```

For faster local iteration when tests are not needed:

```bash
./mvnw -T 1C clean package -DskipTests
```

### Frontend

```bash
cd baize-flow-ui
yarn
yarn build
```

## Pull Request Guidelines

1. Fork the repository and create a topic branch from `main`.
2. Keep changes focused and avoid unrelated formatting churn.
3. Add or update tests when behavior changes.
4. Update documentation and `CHANGELOG.md` when user-facing behavior changes.
5. Run the relevant backend and frontend checks before opening a pull request.
6. Use a clear title and complete the pull request template.

## Commit Messages

Use concise, descriptive commit messages. Conventional Commit style is encouraged, for example:

- `feat: add datasource validation endpoint`
- `fix: handle failed job log retrieval`
- `docs: update quick start instructions`

## Reporting Security Issues

Do not open public issues for vulnerabilities. Follow the process in [SECURITY.md](SECURITY.md).
