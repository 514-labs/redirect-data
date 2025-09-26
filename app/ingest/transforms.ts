import { UTMWebhookPipeline, ProcessedUTMPipeline, UTMWebhookEvent, ProcessedUTMEvent } from "./models";

// Add a streaming consumer to conform incoming webhook data to our schema
UTMWebhookPipeline.stream!.addConsumer((webhookData: any) => {
  console.log("Raw webhook received:", webhookData);
});

// Transform raw UTM webhook events to processed events with extracted parameters
UTMWebhookPipeline.stream!.addTransform(
  ProcessedUTMPipeline.stream!,
  async (rawEvent: UTMWebhookEvent): Promise<ProcessedUTMEvent> => {
    // Note: rawEvent already conforms to UTMWebhookEvent interface
    // The IngestPipeline handles the initial data validation
    
    const processedEvent: ProcessedUTMEvent = {
      ...rawEvent, // Spread all fields from the raw event
      // Generate ID if not provided
      id: rawEvent.id || `utm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      
      // Extract common UTM parameters (case-insensitive)
      utm_source: rawEvent.utmParams?.utm_source || rawEvent.utmParams?.UTM_SOURCE,
      utm_medium: rawEvent.utmParams?.utm_medium || rawEvent.utmParams?.UTM_MEDIUM,
      utm_campaign: rawEvent.utmParams?.utm_campaign || rawEvent.utmParams?.UTM_CAMPAIGN,
      utm_term: rawEvent.utmParams?.utm_term || rawEvent.utmParams?.UTM_TERM,
      utm_content: rawEvent.utmParams?.utm_content || rawEvent.utmParams?.UTM_CONTENT,
    };
    
    return processedEvent;
  },
  {
    deadLetterQueue: UTMWebhookPipeline.deadLetterQueue,
  }
);

// Add a streaming consumer to log processed events
ProcessedUTMPipeline.stream!.addConsumer((event: ProcessedUTMEvent) => {
  console.log("Processed UTM event:", {
    id: event.id,
    path: event.path,
    source: event.utm_source,
    medium: event.utm_medium,
    campaign: event.utm_campaign,
    totalUtmParams: event.utmParams ? Object.keys(event.utmParams).length : 0
  });
});