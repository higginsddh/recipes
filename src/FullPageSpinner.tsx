import ReactDOM from "react-dom";

export default function FullPageSpinner() {
  return ReactDOM.createPortal(
    <div className="overlay" style={{ zIndex: 2000 }}>
      <div className="d-flex justify-content-center">
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>,
    document.getElementsByTagName("body")[0]
  );
}
