export interface PlaylistInfo {
  id: string;
  name: string;
  owner: string;
  trackCount: number | null;
}

export interface PlaylistTrack {
  id: string;
  name: string;
  artists: string[];
  uri: string;
}

export interface PlaylistTrackPage {
  tracks: PlaylistTrack[];
  total: number;
  hasMore: boolean;
  debugDefinitions: string[];
}

interface SpotifyArtist {
  name?: string;
}

interface SpotifyPlaylistItem {
  uid?: string;
  uri?: string;
  name?: string;
  artists?: SpotifyArtist[];
}

interface SpotifyPlaylistContents {
  items?: SpotifyPlaylistItem[];
  offset?: number;
  limit?: number;
  totalLength?: number;
}

function getPlaylistId(): string | null {
  const pathname = Spicetify.Platform.History.location.pathname;
  const match = pathname.match(/^\/playlist\/([^/?]+)/);

  return match?.[1] ?? null;
}

function getPlaylistPageRoot(): Element {
  return (
    document.querySelector('[data-testid="playlist-page"]') ??
    document.querySelector("main") ??
    document.body
  );
}

export function getCurrentPlaylist(): PlaylistInfo | null {
  const id = getPlaylistId();

  if (!id) {
    return null;
  }

  const pageRoot = getPlaylistPageRoot();

  const name =
    pageRoot.querySelector("h1")?.textContent?.trim() ||
    "Unknown playlist";

  const owner =
    pageRoot
      .querySelector<HTMLAnchorElement>('a[href^="/user/"]')
      ?.textContent?.trim() ||
    "Unknown owner";

  const pageText = pageRoot.textContent ?? "";
  const trackCountMatch = pageText.match(
    /([\d,]+)\s+(?:songs?|tracks?)/i
  );

  const trackCount = trackCountMatch
    ? Number(trackCountMatch[1].replace(/,/g, ""))
    : null;

  return {
    id,
    name,
    owner,
    trackCount,
  };
}

function mapPlaylistItems(
  items: SpotifyPlaylistItem[]
): PlaylistTrack[] {
  return items
    .filter(item => Boolean(item.uri && item.name))
    .map(item => ({
      id: item.uid ?? item.uri ?? "",
      uri: item.uri ?? "",
      name: item.name ?? "Unknown track",
      artists: (item.artists ?? [])
        .map(artist => artist.name)
        .filter((name): name is string => Boolean(name)),
    }));
}

export async function getAllPlaylistTracks(
  playlistId: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<PlaylistTrack[]> {
  const api = (Spicetify.Platform as any).PlaylistAPI;
  const playlistUri = `spotify:playlist:${playlistId}`;
  const batchSize = 100;

  const firstPage = (await api.getContents(playlistUri, {
    offset: 0,
    limit: batchSize,
  })) as SpotifyPlaylistContents;

  const total = firstPage.totalLength ?? 0;
  const tracks = mapPlaylistItems(firstPage.items ?? []);

  onProgress?.(tracks.length, total);

  for (let offset = batchSize; offset < total; offset += batchSize) {
    const page = (await api.getContents(playlistUri, {
      offset,
      limit: batchSize,
    })) as SpotifyPlaylistContents;

    tracks.push(...mapPlaylistItems(page.items ?? []));
    onProgress?.(Math.min(offset + batchSize, total), total);
  }

  return tracks;
}

export async function getPlaylistTracksFirstPage(
  playlistId: string
): Promise<PlaylistTrackPage> {
  const api = (Spicetify.Platform as any).PlaylistAPI;
  const playlistUri = `spotify:playlist:${playlistId}`;

  const result = (await api.getContents(playlistUri, {
    offset: 0,
    limit: 5,
  })) as SpotifyPlaylistContents;

  const tracks = mapPlaylistItems(result.items ?? []);
  const offset = result.offset ?? 0;
  const limit = result.limit ?? tracks.length;
  const total = result.totalLength ?? tracks.length;

  return {
    tracks,
    total,
    hasMore: offset + limit < total,
    debugDefinitions: tracks.map(
      track =>
        `${track.name} — ${track.artists.join(", ") || "Unknown artist"}`
    ),
  };
}
