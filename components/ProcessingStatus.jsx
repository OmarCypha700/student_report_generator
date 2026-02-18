// export default function ProcessingStatus({ loading, error, progress }) {
//   if (loading) return <p>Processing… {progress}%</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;
//   return null;
// }



import { Loader2, AlertCircle } from "lucide-react";

/**
 * Inline status indicator for file processing.
 * Returns null when there is nothing to display.
 *
 * @param {{ loading: boolean, error: string|null, progress: number }} props
 */
export default function ProcessingStatus({ loading, error, progress }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
        <Loader2 className="animate-spin" size={16} />
        <span>Processing… {progress}%</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  return null;
}