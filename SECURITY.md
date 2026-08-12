# Security Policy

## Supported version

The current production version is the latest release shown in the repository. Older builds may not receive security fixes.

## Reporting a security issue

Please do not publish security vulnerabilities, API keys, passwords, tokens, or other sensitive information in a public issue.

For a suspected secret leak, revoke/rotate the credential first, then report the affected file and commit privately through GitHub's security reporting features if available.

## Security principles

- API credentials must remain in Cloudflare Worker Secrets or GitHub Actions Secrets, never in browser JavaScript.
- Inventory data is stored locally on the user's device; users should export backups carefully and avoid sharing backup files publicly.
- The Android app should request only the permissions required for its features.
- Security checks run through GitHub Actions where supported.
