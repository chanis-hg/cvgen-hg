const PATHS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3",
  up: "M6 14l6-6 6 6",
  down: "M6 10l6 6 6-6",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4",
  download: "M12 4v11M7 11l5 5 5-5M5 20h14",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  info: "M12 11v6M12 7.5v.01M12 21a9 9 0 100-18 9 9 0 000 18z",
  warning: "M12 4l9 16H3zM12 10v4M12 17v.01",
  close: "M6 6l12 12M18 6L6 18",
  spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  lock: "M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z",
  file: "M7 3h7l5 5v13H7zM14 3v5h5",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  columns: "M4 5h16v14H4zM12 5v14",
  page: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
  zoomIn: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4M11 8.5v5M8.5 11h5",
  zoomOut: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4M8.5 11h5",
};

export default function Icon({ name, size = 20, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
