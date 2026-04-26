# ForgePilot Deployment Assets

This directory contains baseline deployment assets for ForgePilot Studio.

## Contents

- `helm/forgepilot-studio`: Helm chart with ingress, secret, postgres, redis, and runtime quota templates.
- `environments/dev.values.yaml`: local or preview defaults.
- `environments/staging.values.yaml`: staging defaults.
- `environments/prod.values.yaml`: production defaults.

## Example Usage

```bash
helm upgrade --install forgepilot deploy/helm/forgepilot-studio \
  -f deploy/environments/staging.values.yaml
```

## Notes

- Move secret values to your secret manager before production.
- Override image tag per release and keep a rollback tag ready.
- Keep runtime quota aligned with team concurrency and budget policies.
