# Release Checklist

Use this checklist to prepare, validate, and publish a Baize Flow release.

## 1. Prepare

- [ ] Confirm the target version and release manager.
- [ ] Review open issues and pull requests for release blockers.
- [ ] Update `CHANGELOG.md` with the release date and notable changes.
- [ ] Verify documentation and examples match the release behavior.
- [ ] Confirm dependency licenses and notices are up to date.

## 2. Validate

- [ ] Run backend verification: `./mvnw -T 1C clean verify`.
- [ ] Run frontend linting: `cd baize-flow-ui && yar`.
- [ ] Run frontend build: `cd baize-flow-ui && yarn build`.
- [ ] Validate Docker image build if publishing container artifacts.
- [ ] Smoke test installation, login, datasource creation, job submission, monitoring, and logs.

## 3. Tag and Build

- [ ] Create a release branch if required.
- [ ] Update Maven and frontend versions.
- [ ] Commit release metadata changes.
- [ ] Create and push the signed release tag.
- [ ] Build source and binary artifacts from the tag.
- [ ] Generate checksums and signatures.

## 4. Publish

- [ ] Upload artifacts to the approved distribution location.
- [ ] Create the GitHub release and attach release notes.
- [ ] Publish Docker images if applicable.
- [ ] Update documentation links.
- [ ] Announce the release to the community.

## 5. Post-release

- [ ] Bump versions back to the next development iteration.
- [ ] Open a follow-up issue for any deferred release tasks.
- [ ] Monitor reports from users and triage regressions quickly.
