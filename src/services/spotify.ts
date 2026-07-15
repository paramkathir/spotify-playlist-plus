export function getCurrentPage(): string {
  const pathname = Spicetify.Platform.History.location.pathname;

  if (pathname.startsWith("/playlist/")) {
    return `Playlist (${pathname.split("/")[2]})`;
  }

  if (pathname.startsWith("/album/")) {
    return "Album";
  }

  if (pathname.startsWith("/artist/")) {
    return "Artist";
  }

  if (pathname.startsWith("/search")) {
    return "Search";
  }

  if (pathname === "/" || pathname === "/home") {
    return "Home";
  }

  return pathname || "Unknown page";
}
