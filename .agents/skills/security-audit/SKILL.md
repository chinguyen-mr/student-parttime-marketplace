---
name: security-audit
description: "Comprehensive multi-phase security auditing skill (Recon, Hunt, Validate, Verify, Report) for web applications, APIs, databases, and Docker environments. Aligned with OWASP Top 10, CWE standards, and official community security audit specifications."
---

# Security Audit Skill — Multi-Phase Application Security Auditing

Official Lineage: [https://github.com/shaxbozaka/security-audit](https://github.com/shaxbozaka/security-audit) / Cloudflare Security Audit Lineage  
Standard: Agent Skills Specification / Claude Code & Cursor Compatibility

## Overview
This skill executes a disciplined, non-destructive 5-stage security audit across frontend applications, REST/GraphQL APIs, backend business logic, relational databases, and containerization layers. It rejects speculation and insists on verified data traces.

---

## 5-Step Security Audit Methodology

### Phase 1: Recon (Reconnaissance)
Map the complete attack surface, entry points, and trust boundaries:
- Identify public vs authenticated endpoints (`/api/auth/*`, `/api/jobs/*`, `/api/admin/*`).
- Map input surfaces: Query params, request bodies, HTTP headers, file upload payloads.
- Identify sensitive assets: Passwords, JWT secrets, database connection strings, PII (phone, email).

### Phase 2: Hunt (Coverage-Led Hunting)
Methodically search for vulnerability categories using targeted pattern matching and control-flow inspection:
- **Authentication & Authorization**: Missing auth middleware, weak JWT verification, IDOR (Insecure Direct Object Reference), privilege escalation between Student, Employer, Admin.
- **Injection Flaws**: SQL Injection (dynamic concatenation vs `$1` parameterized queries), NoSQL injection, Command injection, Cross-Site Scripting (XSS via `dangerouslySetInnerHTML`).
- **Data Protection**: Cleartext credentials in logs or git commits, weak password hashing algorithms, insecure cookies, overly permissive CORS (`*` with credentials).
- **Rate Limiting & DoS**: Lack of throttling on authentication endpoints (`/login`, `/register`).
- **Container & Infrastructure**: Privileged Docker containers, exposed database ports, hardcoded secrets in Dockerfiles.

### Phase 3: Validate (Candidate Validation)
Actively attempt to invalidate or challenge every candidate finding:
- Trace the data flow from source (user input) to sink (database, shell, response).
- Check if upstream validators (e.g. Joi, express-validator, regex) or sanitizers neutralize the input.
- Weed out false positives rigorously. If input is strictly parameterized or cast to integer, it is NOT vulnerable to SQL injection.

### Phase 4: Verify (Independent Record Verification)
Verify remaining valid findings against environment configurations:
- Check `.env.example` vs active environment variables.
- Run automated unit and integration tests (`npm test`) to confirm stability.
- Ensure no destructive actions, database wipes, or credential tampering are performed.

### Phase 5: Report (Standardized Reporting)
Compile structured findings into `docs/security/SECURITY_AUDIT_REPORT.md` using the standard format:
- **ID**: `SEC-001`, `SEC-002`, ...
- **Severity**: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFORMATIONAL`.
- **Location**: Exact file and line numbers.
- **Description**: What the issue is and under what conditions it triggers.
- **Impact**: Real-world threat scenario (data leakage, privilege escalation, DoS).
- **Proof/Evidence**: Code excerpt showing the trace.
- **Remediation**: Concrete code fix or configuration change.
- **Verification Status**: `CONFIRMED` | `POTENTIAL` | `FALSE POSITIVE` | `MITIGATED`.

---

## Rules of Engagement (Safety Guardrails)
1. **Never perform destructive actions**: No dropping tables, deleting files, or changing active user passwords.
2. **Never send real credentials outside the local environment**: No telemetry exfiltration.
3. **Never claim 100% security**: Security is continuous defense-in-depth, not a binary state.

