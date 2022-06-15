export default function FullPageSpinner() {
  return (
    <div className="overlay">
      <div className="d-flex justify-content-center">
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem", zIndex: 10000 }}
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}
