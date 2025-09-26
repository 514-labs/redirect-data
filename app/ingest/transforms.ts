import { UTMWebhookPipeline, ProcessedUTMPipeline, UTMWebhookEvent, ProcessedUTMEvent } from "./models";

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

