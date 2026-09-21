export type IconName =
  | "fish"
  | "grid"
  | "box"
  | "list"
  | "clock"
  | "ban"
  | "bars"
  | "wallet"
  | "chevleft"
  | "plus"
  | "minus"
  | "check"
  | "checkcircle"
  | "xcircle"
  | "send"
  | "copy"
  | "download"
  | "lock"
  | "tag"
  | "gear";

const viewBoxes: Partial<Record<IconName, string>> = { fish: "0 0 44 20" };

function paths(name: IconName) {
  switch (name) {
    case "fish":
      return (
        <>
          <path d="M3 12C7 5 15 2 22 2c6 0 11 3 14 7l5-4v14l-5-4c-3 4-8 7-14 7-7 0-15-3-19-10z" />
          <circle cx="13" cy="9" r="1.3" fill="currentColor" stroke="none" />
        </>
      );
    case "grid":
      return (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      );
    case "box":
      return (
        <>
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 7v10l9 4 9-4V7" />
          <path d="M12 11v10" />
        </>
      );
    case "list":
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 3v3h6V3" />
          <path d="M8 11h8M8 15h8M8 19h5" />
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3.5 2" />
        </>
      );
    case "ban":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M6.5 6.5l11 11" />
        </>
      );
    case "bars":
      return (
        <>
          <path d="M4 20V10M11 20V4M18 20v-7" />
          <path d="M2.5 20.5h19" />
        </>
      );
    case "wallet":
      return (
        <>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <circle cx="16" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
        </>
      );
    case "chevleft":
      return <path d="M14.5 5l-7 7 7 7" />;
    case "plus":
      return <path d="M12 5v14M5 12h14" />;
    case "minus":
      return <path d="M5 12h14" />;
    case "check":
      return <path d="M5 13l4.5 4.5L19 8" />;
    case "checkcircle":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </>
      );
    case "xcircle":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </>
      );
    case "send":
      return <path d="M4 12l16-8-6 16-3-6-7-2z" />;
    case "copy":
      return (
        <>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </>
      );
    case "download":
      return (
        <>
          <path d="M12 3v12M7 10l5 5 5-5" />
          <path d="M4 19h16" />
        </>
      );
    case "lock":
      return (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      );
    case "tag":
      return (
        <>
          <path d="M12 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-.6 1.4l-9 9a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1 0-2.8l9-9A2 2 0 0 1 12 2z" />
          <circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none" />
        </>
      );
    case "gear":
      return (
        <>
          <path d="M3 6h10M20 6h1" />
          <circle cx="15" cy="6" r="2" />
          <path d="M3 12h4M15 12h6" />
          <circle cx="9" cy="12" r="2" />
          <path d="M3 18h9M18 18h3" />
          <circle cx="13" cy="18" r="2" />
        </>
      );
  }
}

export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const isFish = name === "fish";
  return (
    <svg
      viewBox={viewBoxes[name] ?? "0 0 24 24"}
      width={size}
      height={isFish ? size * 0.45 : size}
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "plus" || name === "minus" ? 2.1 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths(name)}
    </svg>
  );
}
