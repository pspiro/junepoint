# CapitalFlow LMS — Overview

**CapitalFlow LMS** is a full-lifecycle private mortgage lending platform that digitizes and automates the entire loan origination process from application through investor sale. It is a multi-sided SaaS platform connecting mortgage brokers, borrowers, underwriters, title clerks, and institutional investors through a single system, with AI agents handling automated analysis, document classification, and intelligent routing at every stage.

The platform operator is the private lending company. Brokers and investors are B2B customers who access role-specific portals. Borrowers are end-users invited by their broker via magic link to complete their portion of the loan file.

## Supported Loan Programs

- Bridge Loan
- DSCR (Debt Service Coverage Ratio)
- Fix & Flip
- Long-Term Rental
- Construction
- Commercial

## Loan Lifecycle

```
DRAFT → SUBMITTED → IN_REVIEW → CONDITIONALLY_APPROVED → APPROVED → IN_CLOSING → CLOSED → ON_MARKET → SOLD
```

Plus terminal/exception states: `SUSPENDED`, `DECLINED`

## AI Strategy

- AI model: Claude (`claude-sonnet-4-20250514`) via Anthropic API
- AI is event-driven: triggered by SQS queue messages, never called synchronously from HTTP handlers
- Every AI analysis is stored in full (input snapshot, output, scores, reasoning) for fair lending compliance
- Human underwriters always make the final credit decision — AI produces scored recommendations only
- AI has web search tool access for property research and market data
