# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Disclose Publicly

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send details to: [your-email@example.com]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and keep you updated

### 4. Disclosure

- We will coordinate disclosure timing with you
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` as a template
   - Keep OAuth credentials secure

2. **GitHub Tokens**
   - Use personal access tokens with minimal permissions
   - Rotate tokens regularly
   - Never share tokens publicly

3. **Deployment**
   - Use HTTPS in production
   - Keep dependencies updated
   - Review OAuth app permissions

### For Developers

1. **Code Security**
   - Validate all user inputs
   - Sanitize data before storage
   - Use parameterized queries
   - Implement rate limiting

2. **Dependencies**
   - Regularly update dependencies
   - Review security advisories
   - Use `npm audit` to check for vulnerabilities

3. **Authentication**
   - Use secure OAuth flows
   - Store tokens encrypted
   - Implement proper session management

## Known Security Considerations

### OAuth Tokens
- Tokens are stored in IndexedDB (client-side)
- Consider implementing server-side token storage for production
- Tokens should be encrypted at rest

### API Keys
- DUB5 AI requires no API key (free service)
- GitHub tokens should have minimal required permissions
- Vercel/Netlify OAuth should be properly configured

### Data Storage
- Projects are stored in browser localStorage
- Consider implementing server-side storage for production
- Implement data backup mechanisms

## Security Updates

Security updates will be released as patch versions and documented in [CHANGELOG.md](CHANGELOG.md).

## Contact

For security concerns, contact: [your-email@example.com]

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve Aether's security.
