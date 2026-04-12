/**
 * Loading Skeleton Components
 * For showing loading states while data is being fetched
 */

import { motion } from "framer-motion";

export function WorkerCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  return (
    <div className={`bg-white rounded-lg border border-terrain-200 p-4 ${variant === "list" ? "flex gap-4" : ""}`}>
      {/* Avatar skeleton */}
      <div className={`${variant === "list" ? "flex-shrink-0" : "mb-3"}`}>
        <motion.div
          className="w-16 h-16 rounded-full bg-terrain-200"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 space-y-3">
        {/* Name */}
        <motion.div
          className="h-5 bg-terrain-200 rounded w-3/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }}
        />

        {/* Job category */}
        <motion.div
          className="h-4 bg-terrain-200 rounded w-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
        />

        {/* Location */}
        <motion.div
          className="h-4 bg-terrain-200 rounded w-2/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
        />

        {/* Stats */}
        <div className="flex gap-4">
          <motion.div
            className="h-4 bg-terrain-200 rounded w-16"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
          />
          <motion.div
            className="h-4 bg-terrain-200 rounded w-16"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          />
        </div>

        {/* Button */}
        <motion.div
          className="h-10 bg-terrain-200 rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
        />
      </div>
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="bg-white rounded-lg border border-terrain-200 p-4">
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-10 bg-terrain-200 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Results skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <WorkerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
