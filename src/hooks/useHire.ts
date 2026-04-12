/**
 * Hire mutation hook — creates hire records via Supabase
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseSafe } from "../lib/supabase";

interface HireInput {
  workerId: string;
  workDescription?: string;
}

export function useHire(onSuccess?: (msg: string) => void, onError?: (msg: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HireInput) => {
      const supabase = getSupabaseSafe();
      if (!supabase) throw new Error("Supabase not available");

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Please sign in to hire a worker");

      // Try via edge function first (server will capture IP)
      const { data, error } = await supabase.functions.invoke("hire-worker", {
        body: {
          workerId: input.workerId,
          workDescription: input.workDescription,
        },
      });

      if (error) {
        // Fallback: direct insert (less secure, no IP capture)
        const { error: insertError } = await supabase
          .from("hire_records")
          .insert({
            worker_id: input.workerId,
            hirer_id: userData.user.id,
            hirer_ip: "0.0.0.0", // Server should capture this
            work_description: input.workDescription ?? null,
            status: "pending",
          } as any);

        if (insertError) throw insertError;
        return { success: true };
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      onSuccess?.("Worker hired successfully!");
    },
    onError: (err: Error) => {
      onError?.(err.message || "Failed to hire worker");
    },
  });
}
