export default function ProcessingStatus({ loading, error, progress }) {
  if (loading) return <p>Processing… {progress}%</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  return null;
}
