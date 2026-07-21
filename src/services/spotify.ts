export type CurrentPage =
  | { type: "playlist"; id: string; pathname: string }
  | { type: "album"; id: string; pathname: string }
  | { type: "artist"; id: string; pathname: string }
  | { type: "search"; pathname: string }
  | { type: "home"; pathname: string }
  | { type: "other"; pathname: string };

export function getCurrentPage(): CurrentPage {
  const pathname = Spicetify.Platform.History.location.pathname;
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "playlist" && parts[1]) {
    return {
      type: "playlist",
      id: parts[1],
      pathname,
    };
  }

  if (parts[0] === "album" && parts[1]) {
    return {
      type: "album",
      id: parts[1],
      pathname,
    };
  }

  if (parts[0] === "artist" && parts[1]) {
    return {
      type: "artist",
      id: parts[1],
      pathname,
    };
  }

  if (parts[0] === "search") {
    return { type: "search", pathname };
  }

  if (pathname === "/" || pathname === "/home") {
    return { type: "home", pathname };
  }

  return { type: "other", pathname };
}

export function getCurrentPageLabel(): string {
  const page = getCurrentPage();

  switch (page.type) {
    case "playlist":
      return `Playlist ID: ${page.id}`;
    case "album":
      return `Album ID: ${page.id}`;
    case "artist":
      return `Artist ID: ${page.id}`;
    case "search":
      return "Search";
    case "home":
      return "Home";
    default:
      return page.pathname || "Unknown page";
  }
}
