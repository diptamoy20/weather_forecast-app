export default function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      <div className="spinner" />
      <span>Fetching weather...</span>
    </div>
  );
}
