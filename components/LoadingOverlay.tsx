"use client";

import { useHealthInsuranceStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  const { isLoading } = useHealthInsuranceStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold mb-1">Please wait...</p>
          <p className="text-sm text-muted-foreground">Processing your request</p>
        </div>
      </div>
    </div>
  );
}

