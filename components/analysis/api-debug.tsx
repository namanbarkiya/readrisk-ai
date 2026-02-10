"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ApiCall {
  id: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  status: "pending" | "success" | "error";
  duration?: number;
}

export const ApiDebug = () => {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);

  useEffect(() => {
    // Intercept fetch calls to monitor API usage
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || "GET";
      const endpoint = typeof url === "string" ? url : url.toString();

      // Only track API calls to our endpoints
      if (endpoint.includes("/api/")) {
        const callId = Math.random().toString(36).substr(2, 9);
        const startTime = Date.now();

        const apiCall: ApiCall = {
          id: callId,
          endpoint,
          method,
          timestamp: new Date(),
          status: "pending",
        };

        setApiCalls((prev) => [apiCall, ...prev.slice(0, 19)]); // Keep last 20 calls

        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - startTime;

          setApiCalls((prev) =>
            prev.map((call) =>
              call.id === callId
                ? { ...call, status: "success", duration }
                : call
            )
          );

          return response;
        } catch (error) {
          const duration = Date.now() - startTime;

          setApiCalls((prev) =>
            prev.map((call) =>
              call.id === callId ? { ...call, status: "error", duration } : call
            )
          );

          throw error;
        }
      }

      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const getStatusColor = (status: ApiCall["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "-";
    return `${duration}ms`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Debug Monitor
          <Badge variant="outline">{apiCalls.length}</Badge>
        </CardTitle>
        <CardDescription>
          Monitor API calls in real-time. Shows the last 20 API requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {apiCalls.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No API calls detected yet...
            </p>
          ) : (
            apiCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 border rounded-md text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {call.method}
                    </Badge>
                    <span className="font-mono text-xs truncate">
                      {call.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatTime(call.timestamp)}</span>
                    <span>{formatDuration(call.duration)}</span>
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(call.status)}`}>
                  {call.status}
                </Badge>
              </div>
            ))
          )}
        </div>

        {apiCalls.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total calls: {apiCalls.length}</span>
              <button
                onClick={() => setApiCalls([])}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
