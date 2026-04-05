'use client'

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function TestSentry() {
  useEffect(() => {
    // Sentry.logger is internal for the SDK usually.
    // For manual logging, we use Sentry.captureMessage
    Sentry.captureMessage('Sentry Test Event', {
        level: 'info',
        extra: {
            log_source: 'sentry_test',
            timestamp: new Date().toISOString()
        }
    });

    console.log("Sentry event captured manually.");
  }, []);

  return (
    <div className="p-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Sentry Test Triggered!</h1>
      <p className="text-muted mb-8">An info message has been sent to your Sentry dashboard.</p>
      
      <button 
        onClick={() => {
            throw new Error("Sentry Test Error from Sakani Front-end");
        }}
        className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
      >
        Trigger a Real Error
      </button>
      
      <div className="mt-8">
        <a href="/" className="text-primary hover:underline">Back to Home</a>
      </div>
    </div>
  );
}
