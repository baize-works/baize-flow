<p align="center">
  <img
    src="https://github.com/user-attachments/assets/901d765c-cbd7-4f39-ae3a-de6716ae09f2"
    width="100%"
    alt="Yak Ops Banner"
  />
</p>

<h1 align="center">Yak Ops</h1>

<p align="center">
  A modern, visual, and production-oriented third-party Web UI for Apache SeaTunnel.
</p>

<p align="center">
  <a href="https://github.com/weifuwan/yak-ops/releases">
    <img src="https://img.shields.io/github/v/release/weifuwan/yak-ops?include_prereleases&style=flat-square" alt="Release" />
  </a>
  <a href="https://github.com/weifuwan/yak-ops/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/weifuwan/yak-ops?style=flat-square" alt="License" />
  </a>
  <a href="https://github.com/weifuwan/yak-ops/stargazers">
    <img src="https://img.shields.io/github/stars/weifuwan/yak-ops?style=flat-square" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/weifuwan/yak-ops/issues">
    <img src="https://img.shields.io/github/issues/weifuwan/yak-ops?style=flat-square" alt="GitHub Issues" />
  </a>
  <img src="https://img.shields.io/badge/Java-21-blue?style=flat-square" alt="Java 21" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-blue?style=flat-square" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/SeaTunnel-2.3.13-blue?style=flat-square" alt="SeaTunnel 2.3.13" />
</p>

<p align="center">
  <a href="http://111.230.213.87:8000">Live Demo</a>
  ·
  <a href="https://doc.yak-ops.com/">Documentation</a>
  ·
  <a href="http://111.230.213.87:9001/">Home</a>
  ·
  <a href="https://github.com/weifuwan/yak-ops/issues">Issues</a>
</p>

---

## Overview

**Yak Ops** is an independent third-party Web UI built for **Apache SeaTunnel**.

It provides a visual and practical way to create, configure, run, schedule, and monitor data synchronization jobs without manually maintaining complex SeaTunnel configuration files.

With Yak Ops, users can manage data sources, build batch and streaming pipelines, configure field mappings, generate SeaTunnel job configurations, submit jobs to the SeaTunnel engine, inspect runtime logs, and monitor execution metrics from a unified Web interface.

> Our goal is simple: make Apache SeaTunnel easier to use in real-world data integration scenarios.

## Highlights

### Visual Pipeline Builder

Build data synchronization pipelines with a drag-and-drop DAG editor.

Configure Source, Transform, and Sink nodes visually, making complex synchronization workflows easier to understand and maintain.

### Batch and Streaming Jobs

Create and manage both batch and real-time data synchronization tasks through a unified interface.

Yak Ops supports multiple task creation modes, including visual guidance and script-based configuration.

### Data Source Management

Manage commonly used data sources from one place, including:

* MySQL
* MySQL CDC
* PostgreSQL
* Oracle
* Other supported JDBC-compatible data sources

Users can configure connections, test connectivity, inspect metadata, and reuse data sources across different jobs.

### Field Mapping and Data Transformation

Configure source-to-target field mappings visually.

Yak Ops also supports SQL-based transformations and automatically generates the corresponding SeaTunnel job configuration.

### Job Lifecycle Management

Manage the complete lifecycle of a SeaTunnel job:

* Create and edit jobs
* Publish job definitions
* Submit jobs
* Stop running jobs
* View execution history
* Inspect runtime logs
* Track job status
* Manage scheduled execution

### Runtime Metrics

View key runtime metrics directly from the Web UI, including:

* Read rows
* Written rows
* Read QPS
* Write QPS
* Data volume
* Job status
* Task execution progress

The built-in metrics view helps users understand job execution without requiring an additional monitoring platform for basic troubleshooting.

### Automatic Configuration Generation

Yak Ops converts visual job definitions into executable SeaTunnel configuration files.

This reduces repetitive configuration work and helps teams standardize data synchronization development.

## Why Yak Ops?

Apache SeaTunnel provides powerful data integration capabilities, but manually writing and maintaining configuration files can still be challenging in large-scale or multi-team environments.

Yak Ops is designed for teams that need:

* A visual Web UI for Apache SeaTunnel
* Standardized data source management
* Low-code pipeline configuration
* Reusable synchronization workflows
* Batch and real-time job management
* Task scheduling and execution history
* Runtime logs and metrics
* Lower configuration and maintenance costs
* A smoother onboarding experience for new users

## Compatibility

The following environment is supported or recommended for the current version:

| Component        | Supported or Recommended Version |
| ---------------- | -------------------------------- |
| Apache SeaTunnel | 2.3.13                           |
| Java             | JDK/JRE 21                       |
| Node.js          | 20 or later, source builds only  |
| Yarn             | Yarn Classic 1.x                 |
| MySQL            | MySQL 8.0 recommended            |
| Docker           | Docker Engine or Docker Desktop  |
| Docker Compose   | Compose v2                       |
| Operating System | Linux recommended                |
| Browser          | Latest Chrome or Edge            |

> Yak Ops currently performs version validation when connecting to the SeaTunnel engine. Please use a supported SeaTunnel version.

## Architecture

Yak Ops uses a front-end and back-end separated architecture.

For containerized deployment, Nginx serves the front-end assets and proxies API and WebSocket traffic to the Spring Boot service. The Spring Boot service connects to the Yak Ops metadata database and communicates with the configured Apache SeaTunnel engine.

<img width="1448" height="1086" alt="31db05202fb68511127f1f6dcf367466" src="https://github.com/user-attachments/assets/187f2558-3668-4cc0-9ba8-9eb8807c3b02" />


## Quick Start

Docker Compose is the recommended way to run Yak Ops locally.

For complete installation and deployment instructions, please refer to the project documentation:

**Documentation:**  
https://doc.yak-ops.com/

### Option A: Docker Compose with MySQL

This mode starts the following services together:

* MySQL 8.0
* Yak Ops API
* Nginx front end

Clone the repository and create the environment file:

```bash
git clone https://github.com/weifuwan/yak-ops.git
cd yak-ops
cp .env.example .env
```

Build and start the services:

```bash
docker compose up -d --build
```

Open Yak Ops:

```text
http://localhost:9527
```

View the service status and logs:

```bash
docker compose ps
docker compose logs -f yak-ops-api
```

Stop the services:

```bash
docker compose down
```

To recreate the local MySQL database and run the initialization scripts again:

```bash
docker compose down -v
docker compose up -d --build
```

> `docker compose down -v` permanently removes the Compose-managed MySQL data volume.

### Option B: Docker Compose with an Existing MySQL

Use this mode when MySQL is already installed on the host or deployed on another server.

Create the external database and execute the MySQL initialization SQL before starting Yak Ops. The SQL files are included in the distribution package under `sql/` and are also available in the source repository under:

```text
yak-ops-api/src/main/resources/sql/
```

Create the environment file:

```bash
cp .env.without-mysql.example .env.without-mysql
```

Configure the existing database:

```env
MYSQL_HOST=host.docker.internal
MYSQL_PORT=3306
MYSQL_DATABASE=baize_flow
MYSQL_USER=seatunnel
MYSQL_PASSWORD=change_me
```

On Docker Desktop for Windows or macOS, use:

```env
MYSQL_HOST=host.docker.internal
```

For a remote MySQL server, set `MYSQL_HOST` to its hostname or IP address.

The MySQL account must allow connections from the Docker host. A dedicated account is recommended:

```sql
CREATE USER IF NOT EXISTS 'seatunnel'@'%' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON baize_flow.* TO 'seatunnel'@'%';
FLUSH PRIVILEGES;
```

Start Yak Ops without starting another MySQL container:

```bash
docker compose   --env-file .env.without-mysql   -f compose.without-mysql.yaml   up -d --build
```

View logs:

```bash
docker compose   --env-file .env.without-mysql   -f compose.without-mysql.yaml   logs -f yak-ops-api
```

### Option C: Build the Distribution Package from Source

Requirements:

* JDK 21
* Node.js 20 or later
* Yarn Classic
* MySQL 8.0
* Maven, or the Maven Wrapper included in the repository

Build the front-end assets first:

```bash
cd yak-ops-ui
yarn install --frozen-lockfile
yarn build
cd ..
```

Build the complete distribution package from the repository root:

```bash
./mvnw clean package -DskipTests
```

On Windows:

```cmd
mvnw.cmd clean package -DskipTests
```

The generated package is located under:

```text
yak-ops-dist/target/
```

The distribution package contains:

```text
yak-ops-<version>/
├── bin/
│   ├── run-yak-ops.sh
│   ├── start-yak-ops.sh
│   ├── status-yak-ops.sh
│   └── stop-yak-ops.sh
├── conf/
│   ├── application.yml
│   ├── logback-spring.xml
│   └── nginx/
│       └── default.conf
├── jdbc-drivers/
├── libs/
│   └── yak-ops-api.jar
├── sql/
├── web/
├── LICENSE
├── NOTICE
└── README.md
```

The same distribution package is used to produce both runtime images:

* `yak-ops-api`: Java 21 back-end runtime
* `yak-ops`: Nginx front end and reverse proxy

For a manual Linux deployment, extract the package, review `conf/application.yml`, start the back end with the scripts under `bin/`, and configure Nginx with `conf/nginx/default.conf`.

### Connect to Apache SeaTunnel

After Yak Ops starts:

1. Open the SeaTunnel client management page.
2. Add an Apache SeaTunnel 2.3.13 engine address.
3. Test the connection.
4. Create a data source.
5. Create and publish a synchronization job.
6. Submit the job and inspect runtime logs and metrics.

## Development

### Back-End Development

Requirements:

* JDK 21
* Maven 3.8 or later
* MySQL 8.0

Start the back end:

```bash
./mvnw clean install -DskipTests
./mvnw -pl yak-ops-api spring-boot:run
```

The default back-end port is:

```text
9527
```

### Front-End Development

Enter the front-end directory:

```bash
cd yak-ops-ui
```

Install dependencies:

```bash
yarn
```

Build the production assets:

```bash
yarn build
```

## Documentation

Detailed installation, configuration, operation, and usage guides are available at:

### Yak Ops Documentation

https://doc.yak-ops.com/

The documentation covers topics such as:

* Environment preparation
* Database initialization
* SeaTunnel engine configuration
* Data source management
* Batch synchronization
* Streaming synchronization
* Workflow configuration
* Field mapping
* Task scheduling
* Runtime logs
* Metrics monitoring
* Docker and Docker Compose deployment
* Troubleshooting

## Live Demo

An online demo environment is available at:

http://111.230.213.87:8000

The demo environment is intended for product preview and functional evaluation.

Please do not enter confidential, sensitive, or production data into the public demo environment.

## Roadmap

Planned improvements include:

* Additional data source plugins
* More SeaTunnel version compatibility
* Improved upgrade and database migration support
* Enhanced job validation
* Alert and notification capabilities
* More complete operational monitoring
* Improved permission management
* Better internationalization
* Improved container image release, upgrade, and migration tooling

Roadmap priorities may change based on community feedback and actual usage scenarios.

## Known Limitations

Before using the current version, please note:

* The currently validated SeaTunnel version is 2.3.13.
* MySQL 8.0 is recommended for the Yak Ops metadata database.
* Some advanced SeaTunnel connector parameters may still require script-mode configuration.
* Production deployment should use secure database credentials, persistent volumes, and controlled network access.
* The public demo environment must not be used with sensitive data.
* Back up the Yak Ops database before upgrading to a newer version.

Please review open issues before deploying the project in a production environment:

https://github.com/weifuwan/yak-ops/issues

## Contributing

Contributions are warmly welcome.

You can contribute by:

* Reporting bugs
* Submitting feature requests
* Improving documentation
* Adding data source plugins
* Fixing issues
* Improving test coverage
* Sharing deployment experience
* Helping other community users

Recommended contribution workflow:

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request.
5. Describe the motivation, implementation, and verification process clearly.

Repository:

https://github.com/weifuwan/yak-ops

Issues:

https://github.com/weifuwan/yak-ops/issues

Pull requests:

https://github.com/weifuwan/yak-ops/pulls

## Community

If you are interested in Yak Ops, want to share feedback, or would like to participate in its development, you are welcome to join the community.

Contributions are not limited to writing code. Documentation, testing, issue reports, feature discussions, product suggestions, and usage experience are all valuable.

<p align="center">
  <img
    width="200"
    height="320"
    src="https://github.com/user-attachments/assets/41de5095-91af-41e6-9345-7c26496f9469"
    alt="Yak Ops Community Group"
  />
</p>

<p align="center">
  Join the Yak Ops community and help build the project together.
</p>

## Security

Please do not disclose security vulnerabilities through public GitHub issues.

When reporting a security issue, include:

* The affected version
* The affected component
* Reproduction steps
* Potential impact
* Suggested remediation, when available

A dedicated security reporting process will be documented in `SECURITY.md`.

## License

Yak Ops is licensed under the Apache License 2.0.

See the [LICENSE](./LICENSE) file for details.

## Disclaimer

Yak Ops is an independent third-party project.

It is not an official Apache Software Foundation project and is not affiliated with or endorsed by the Apache Software Foundation.

Apache SeaTunnel, SeaTunnel, Apache, and the Apache feather logo are trademarks of the Apache Software Foundation.

The use of Apache SeaTunnel in this project name and documentation is intended only to describe compatibility and integration with Apache SeaTunnel.

---

<p align="center">
  Made with ❤️ by the Yak Ops community
</p>

<p align="center">
  <a href="https://github.com/weifuwan/yak-ops">GitHub</a>
  ·
  <a href="https://doc.yak-ops.com/">Documentation</a>
  ·
  <a href="https://github.com/weifuwan/yak-ops/issues">Feedback</a>
</p>
