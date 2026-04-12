import { motion } from "framer-motion";

export default function NotFound({ onGoHome }: { onGoHome: () => void }) {
  return (
    <motion.div
      className="section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-header">
        <h1 className="page-title">Page not found</h1>
        <p className="page-desc">That page doesn’t exist in the app.</p>
      </div>
      <button className="btn btn-crimson" onClick={onGoHome}>
        ← Back to Home
      </button>
    </motion.div>
  );
}

