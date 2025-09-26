# UTM Webhook Receiver Specification

## Purpose

Receive webhook data from https://utm.fiveonefour.dev/admin into this moose project.

## Context

The UTM redirect service allows configuring redirect rules with:
- Path matching (e.g., /blog/Reference)
- Target URL for redirection
- Optional UTM parameters for tracking
- Analytics endpoint configuration for webhook delivery

## Data Flow

1. UTM redirect tool sends webhook POST requests
2. Moose project receives and processes the data
3. Data is stored/forwarded as needed

## Webhook Data Format

```json
{
  "originalUrl": "https://your-domain.com/blog-post?utm_source=google",
  "redirectUrl": "https://example.com/target-page",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "utmParams": {
    "utm_source": "google",
    "utm_medium": "cpc"
  },
  "path": "/blog-post"
}
```

Note: `utmParams` is a JSON object with variable keys/values

## Implementation with MooseStack

### Data Model
```typescript
interface UTMWebhookEvent {
  id: Key<string>;
  originalUrl: string;
  redirectUrl: string;
  timestamp: Date;
  userAgent: string;
  referrer: string;
  utmParams: Record<string, any>; // Dynamic JSON for variable UTM parameters
  path: string;
}
```

### Components
1. **Ingest API**: Receive webhook POST requests from UTM redirect service
2. **Stream**: Real-time processing of UTM events
3. **OLAP Table**: Store events in ClickHouse for analytics

### Architecture
```typescript
// Stream for real-time processing
const utmEventStream = new Stream<UTMWebhookEvent>("utm-events", {
  destination: new OlapTable<UTMWebhookEvent>("utm_events")
});

// Ingest API endpoint
const utmWebhookApi = new IngestApi<UTMWebhookEvent>("utm-webhook", {
  destination: utmEventStream
});
```

## Requirements

- Webhook endpoint to receive POST requests via IngestApi
- Type-safe data validation using TypeScript interface
- Stream processing for real-time event handling
- ClickHouse storage for analytics queries

## Development Setup

- **Local**: Use ngrok to expose local Moose endpoints for webhook testing
- **Production**: Deploy to Boreal for production webhook handling