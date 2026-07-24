# Security Policy

Yak Ops takes security issues seriously. Please report suspected vulnerabilities privately so maintainers can investigate and coordinate a fix before public disclosure.

## Supported Versions

Security fixes are provided for actively maintained release lines. Until the first stable release is published, security fixes target the `main` branch.

| Version | Supported |
| ------- | --------- |
| main    | Yes       |
| < 1.0.0 | No        |

## Reporting a Vulnerability

Please do **not** create a public GitHub issue for security vulnerabilities.

Instead, report issues through this project security process:

- Use GitHub Private Vulnerability Reporting from the repository Security tab.
- If private reporting is unavailable, open a minimal public advisory issue without exploit details and request a private contact channel.
- Provide a description, affected versions or commits, reproduction steps, impact, and any suggested mitigation.

The project will acknowledge reports as soon as possible and will coordinate disclosure through this repository's maintainer-managed security process.

## Security Best Practices for Deployments

- Change default credentials before exposing an environment.
- Restrict access to the Web UI and API with network controls and authentication.
- Store datasource credentials securely and rotate them regularly.
- Keep Yak Ops, Apache SeaTunnel, JDK, Node.js, and database drivers up to date.
- Review logs and audit trails for unexpected activity.
