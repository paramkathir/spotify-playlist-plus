import { LASTFM_API_KEY } from "../config";

interface LastFmTag {
  name?: string;
  count?: number | string;
}

interface LastFmTopTagsResponse {
  toptags?: {
    tag?: LastFmTag[];
  };
  error?: number;
  message?: string;
}

export interface LastFmTagResult {
  name: string;
  score: number;
}

async function requestTopTags(
  params: Record<string, string>
): Promise<LastFmTagResult[]> {
  const url =
    "https://ws.audioscrobbler.com/2.0/?" +
    new URLSearchParams({
      ...params,
      api_key: LASTFM_API_KEY,
      autocorrect: "1",
      format: "json",
    });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Last.fm returned HTTP ${response.status}`
    );
  }

  const data =
    (await response.json()) as LastFmTopTagsResponse;

  if (data.error) {
    throw new Error(
      data.message || `Last.fm error ${data.error}`
    );
  }

  return (data.toptags?.tag ?? [])
    .filter(tag => Boolean(tag.name))
    .map(tag => ({
      name: tag.name?.trim() ?? "",
      score: Number(tag.count ?? 0),
    }))
    .filter(tag => Boolean(tag.name));
}

export async function getArtistTags(
  artist: string
): Promise<LastFmTagResult[]> {
  return requestTopTags({
    method: "artist.gettoptags",
    artist,
  });
}

export async function getAlbumTags(
  artist: string,
  album: string
): Promise<LastFmTagResult[]> {
  return requestTopTags({
    method: "album.gettoptags",
    artist,
    album,
  });
}

export async function getTrackTags(
  artist: string,
  track: string
): Promise<LastFmTagResult[]> {
  return requestTopTags({
    method: "track.gettoptags",
    artist,
    track,
  });
}

// Keep the existing artist test compatible.
export async function getArtistGenres(
  artist: string
): Promise<string[]> {
  const tags = await getArtistTags(artist);

  return tags.map(tag => tag.name);
}
