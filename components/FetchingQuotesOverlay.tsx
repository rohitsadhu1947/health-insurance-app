"use client";

import { Shield, Loader2 } from "lucide-react";

interface FetchingQuotesOverlayProps {
  quotesReceived?: number;
}

export function FetchingQuotesOverlay({ quotesReceived = 0 }: FetchingQuotesOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center space-y-6">
        <div className="relative">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Fetching Your Quotes...</h3>
          <p className="text-gray-600">
            We're comparing plans from 6 trusted insurers to find you the best options
          </p>
          {quotesReceived > 0 && (
            <p className="text-green-600 font-semibold animate-pulse">
              ✨ {quotesReceived} quote{quotesReceived > 1 ? 's' : ''} received!
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-center space-x-4 pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <p>✨ This usually takes 5-10 seconds</p>
        </div>
      </div>
    </div>
  );
}

