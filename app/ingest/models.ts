import {
  IngestPipeline,
  OlapTable,
  DeadLetterModel,
  DateTime,
} from "@514labs/moose-lib";

/**
 * UTM Webhook Event Data Model
 * Receives webhook data from https://utm.fiveonefour.dev/admin
 */

/** Webhook data from UTM redirect service */
export interface UTMWebhookEvent {
  id?: string; // Unique event ID (optional - not sent by service)
  originalUrl: string; // Original URL with UTM parameters
  redirectUrl: string; // Target redirect URL
  timestamp: DateTime; // Event timestamp
  userAgent: string; // User's browser agent
  referer?: string; // Referer URL (optional - not sent by service)
  utmParams: Record<string, any>; // Dynamic JSON for variable UTM parameters
  path: string; // URL path that was accessed
}

/** Dead letter queue for failed webhook processing */
export const deadLetterTable = new OlapTable<DeadLetterModel>("UTMWebhookDeadLetter", {
  orderByFields: ["failedAt"],
});

/** Processed UTM event with extracted common parameters */
export interface ProcessedUTMEvent extends UTMWebhookEvent {
  // Common UTM parameters as separate columns for better query performance
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/** UTM webhook data ingestion pipeline */
export const UTMWebhookPipeline = new IngestPipeline<UTMWebhookEvent>("UTMWebhook", {
  table: false, // Don't store raw events, only stream
  stream: true, // Enable real-time streaming
  ingest: true, // Create POST /ingest/UTMWebhook endpoint
  deadLetterQueue: {
    destination: deadLetterTable,
  },
});

/** Processed UTM events pipeline */
export const ProcessedUTMPipeline = new IngestPipeline<ProcessedUTMEvent>("ProcessedUTM", {
  table: {
    orderByFields: ["timestamp"], // Order events by timestamp
  },
  stream: true, // Enable streaming for further processing
  ingest: false, // No direct API, only via transformation
});