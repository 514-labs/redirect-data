# UTM Redirect Data Receiver

A [Moose](https://docs.fiveonefour.com/moose) application for receiving and processing UTM redirect webhook data from [utm.fiveonefour.dev](https://utm.fiveonefour.dev/admin).

<a href="https://docs.fiveonefour.com/moose/"><img src="https://raw.githubusercontent.com/514-labs/moose/main/logo-m-light.png" alt="moose logo" height="100px"></a>

[![NPM Version](https://img.shields.io/npm/v/%40514labs%2Fmoose-cli?logo=npm)](https://www.npmjs.com/package/@514labs/moose-cli?activeTab=readme)
[![Moose Community](https://img.shields.io/badge/slack-moose_community-purple.svg?logo=slack)](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg)
[![Docs](https://img.shields.io/badge/quick_start-docs-blue.svg)](https://docs.fiveonefour.com/moose/getting-started/quickstart)

## Overview

This project implements a webhook receiver that:
- Accepts redirect event data from the UTM redirect service
- Processes and enriches the data with extracted UTM parameters
- Stores events in ClickHouse for analytics and reporting

## Project Structure

```
app/
├── ingest/
│   ├── models.ts      # Data models for UTM webhook events
│   └── transforms.ts  # Data transformation logic
└── index.ts           # Main application entry point
```

## Data Flow

1. **Webhook Ingestion**: Receives POST requests at `/ingest/UTMWebhook`
2. **Data Processing**: Transforms raw webhook data and extracts UTM parameters
3. **Storage**: Stores processed events in ClickHouse's `ProcessedUTM` table

## Getting Started

### Prerequisites
- [Moose CLI](https://docs.fiveonefour.com/moose/getting-started/installation)
- Node.js 18+
- ngrok (for local webhook testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/514-labs/redirect-data.git
cd redirect-data
```

2. Install dependencies:
```bash
npm install
```

3. Configure authentication (see Authentication section below)

4. Start the development server:
```bash
moose dev
```

The server will start on http://localhost:4000

### Local Webhook Testing

To receive webhooks from the UTM service locally:

1. Start ngrok to expose your local server:
```bash
ngrok http 4000
```

2. Configure the UTM service at [utm.fiveonefour.dev/admin](https://utm.fiveonefour.dev/admin) to use your ngrok URL as the analytics endpoint.

## Authentication

This service requires bearer token authentication for security. The UTM tracker prototype must include an `Authorization: Bearer <token>` header when sending webhook data.

### Setup

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Generate a hashed API key using the Moose CLI:
```bash
moose generate hash-token
```

3. Set the generated hash in your `.env` file:
```bash
MOOSE_INGEST_API_KEY=your_generated_hash_here
```

4. Configure the UTM tracker prototype to send the same token (before hashing) in the `Authorization` header:
```bash
# In the utm-tracker-prototype .env file:
ANALYTICS_BEARER_TOKEN=your-plain-token-here
```

### How It Works

- The UTM tracker sends: `Authorization: Bearer your-plain-token-here`
- Moose verifies this against the hashed version in `MOOSE_INGEST_API_KEY`
- Requests without valid authentication are rejected with a 401 error

### Alternative: JWT Authentication

For more advanced use cases, you can use JWT tokens with RSA signatures. See the [Moose authentication docs](https://docs.fiveonefour.com/moose/apis/auth) for setup instructions.

## Webhook Data Format

The webhook endpoint expects POST requests with the following JSON structure:

```json
{
  "originalUrl": "https://your-domain.com/page?utm_source=twitter",
  "redirectUrl": "https://target-site.com/landing",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "utmParams": {
    "utm_source": "twitter",
    "utm_medium": "social",
    "utm_campaign": "launch2025"
  },
  "path": "/page"
}
```

## Data Storage

Processed events are stored in ClickHouse in the `ProcessedUTM` table with:

**Original webhook fields:**
- `originalUrl`, `redirectUrl`, `timestamp`, `userAgent`, `path`
- `utmParams`: JSON object with all UTM parameters
- `referer`: Optional field (if provided by webhook)

**Additional generated fields:**
- `id`: Auto-generated unique identifier (format: `utm-{timestamp}-{random}`)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`: Extracted as separate columns for efficient querying

**Table configuration:**
- Ordered by `timestamp` for optimal query performance

## Deployment

The easiest way to deploy your Moose application is to use [Boreal](https://www.fiveonefour.com/boreal).

Check out the [Moose deployment documentation](https://docs.fiveonefour.com/moose/deploying) for more details.

## Community

Join the Moose community [on Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg).

## Made by 514

Built with [Moose](https://docs.fiveonefour.com/moose) by [514 Labs](https://www.fiveonefour.com/).
