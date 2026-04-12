import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { queryClient } from "./lib/query-client";
import { setupWebGlobalErrorMonitoring } from "./lib/monitoring";
import { router } from "./router";

export default function App() {
  useEffect(() => setupWebGlobalErrorMonitoring(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </QueryClientProvider>
  );
}
