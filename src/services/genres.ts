import {
  getAlbumTags,
  getArtistTags,
  getTrackTags,
} from "./lastfm";
import type { LastFmTagResult } from "./lastfm";
import type { PlaylistTrack } from "./playlist";
import {
  GENRE_ALIASES,
  GENRE_PRIORITY,
  JUNK_TAGS,
} from "./genreRules";

export type ClassificationSource =
  | "track"
  | "album"
  | "artist"
  | "unknown";

export interface GenreScore {
  genre: string;
  score: number;
}

export interface ClassifiedTrack {
  track: PlaylistTrack;
  primaryGenre: string | null;
  secondaryGenres: string[];
  genreScores: GenreScore[];
  source: ClassificationSource;
  classifiedAt: number;
  fromCache: boolean;
}

interface CachedClassification {
  cacheVersion: 4;
  uri: string;
  title: string;
  artist: string;
  album: string;
  primaryGenre: string | null;
  secondaryGenres: string[];
  genreScores: GenreScore[];
  source: ClassificationSource;
  classifiedAt: number;
}

const CACHE_PREFIX =
  "playlist-plus:classification:v4:";

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ");
}

function getPriority(genre: string): number {
  const index = GENRE_PRIORITY.indexOf(genre);

  return index === -1
    ? GENRE_PRIORITY.length
    : index;
}

function isJunkTag(
  tag: string,
  track: PlaylistTrack
): boolean {
  if (JUNK_TAGS.has(tag)) {
    return true;
  }

  if (/^(19|20)\d{2}$/.test(tag)) {
    return true;
  }

  const artistNames = track.artists.map(artist =>
    normalizeText(artist.name)
  );

  if (artistNames.includes(tag)) {
    return true;
  }

  return tag === normalizeText(track.name);
}

function createCacheEntry(
  track: PlaylistTrack,
  primaryArtist: string,
  source: ClassificationSource,
  primaryGenre: string | null,
  secondaryGenres: string[],
  genreScores: GenreScore[]
): CachedClassification {
  return {
    cacheVersion: 4,
    uri: track.uri,
    title: track.name,
    artist: primaryArtist,
    album: track.album,
    primaryGenre,
    secondaryGenres,
    genreScores,
    source: primaryGenre ? source : "unknown",
    classifiedAt: Date.now(),
  };
}

function classifyTags(
  track: PlaylistTrack,
  primaryArtist: string,
  rawTags: LastFmTagResult[],
  source: ClassificationSource
): CachedClassification {
  const scores = new Map<string, number>();

  for (const tag of rawTags) {
    const normalized = normalizeText(tag.name);

    if (!normalized || isJunkTag(normalized, track)) {
      continue;
    }

    const genre =
      GENRE_ALIASES[normalized] ??
      GENRE_ALIASES[
        normalized.replace(/and/g, "&")
      ];

    if (!genre) {
      continue;
    }

    const previous = scores.get(genre) ?? 0;
    const score = Number(tag.score) || 0;

    scores.set(
      genre,
      Math.max(previous, score)
    );
  }

  const ranked = [...scores.entries()]
    .map(([genre, score]) => ({
      genre,
      score,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        getPriority(a.genre) -
        getPriority(b.genre)
      );
    });

  const primaryGenre =
    ranked[0]?.genre ?? null;

  const primaryScore =
    ranked[0]?.score ?? 0;

  const secondaryGenres = ranked
    .slice(1)
    .filter(entry => {
      if (primaryScore <= 0) {
        return false;
      }

      return (
        entry.score >= 15 &&
        entry.score >= primaryScore * 0.2
      );
    })
    .slice(0, 2)
    .map(entry => entry.genre);

  return createCacheEntry(
    track,
    primaryArtist,
    source,
    primaryGenre,
    secondaryGenres,
    ranked.slice(0, 5)
  );
}

function createUnknownClassification(
  track: PlaylistTrack,
  primaryArtist: string
): CachedClassification {
  return createCacheEntry(
    track,
    primaryArtist,
    "unknown",
    null,
    [],
    []
  );
}

function getCacheKey(
  track: PlaylistTrack
): string {
  return `${CACHE_PREFIX}${track.uri}`;
}

function readCache(
  track: PlaylistTrack
): CachedClassification | null {
  try {
    const raw = Spicetify.LocalStorage.get(
      getCacheKey(track)
    );

    if (!raw) {
      return null;
    }

    const cached =
      JSON.parse(raw) as CachedClassification;

    if (
      cached.cacheVersion !== 4 ||
      cached.uri !== track.uri
    ) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writeCache(
  track: PlaylistTrack,
  classification: CachedClassification
): void {
  try {
    Spicetify.LocalStorage.set(
      getCacheKey(track),
      JSON.stringify(classification)
    );
  } catch {
    // Classification still works if storage is unavailable.
  }
}

function toClassifiedTrack(
  track: PlaylistTrack,
  cached: CachedClassification,
  fromCache: boolean
): ClassifiedTrack {
  return {
    track,
    primaryGenre: cached.primaryGenre,
    secondaryGenres: cached.secondaryGenres,
    genreScores: cached.genreScores,
    source: cached.source,
    classifiedAt: cached.classifiedAt,
    fromCache,
  };
}

async function fetchClassification(
  track: PlaylistTrack,
  primaryArtist: string
): Promise<CachedClassification> {
  try {
    const trackTags = await getTrackTags(
      primaryArtist,
      track.name
    );

    const trackClassification = classifyTags(
      track,
      primaryArtist,
      trackTags,
      "track"
    );

    if (trackClassification.primaryGenre) {
      return trackClassification;
    }
  } catch {
    // Continue to release fallback.
  }

  if (track.album) {
    try {
      const albumTags = await getAlbumTags(
        primaryArtist,
        track.album
      );

      const albumClassification = classifyTags(
        track,
        primaryArtist,
        albumTags,
        "album"
      );

      if (albumClassification.primaryGenre) {
        return albumClassification;
      }
    } catch {
      // Continue to artist fallback.
    }
  }

  try {
    const artistTags = await getArtistTags(
      primaryArtist
    );

    const artistClassification = classifyTags(
      track,
      primaryArtist,
      artistTags,
      "artist"
    );

    if (artistClassification.primaryGenre) {
      return artistClassification;
    }
  } catch {
    // Return unknown below.
  }

  return createUnknownClassification(
    track,
    primaryArtist
  );
}

export async function classifyTracks(
  tracks: PlaylistTrack[],
  onProgress?: (
    completed: number,
    total: number,
    trackName: string
  ) => void
): Promise<ClassifiedTrack[]> {
  const results: ClassifiedTrack[] = [];

  for (
    let index = 0;
    index < tracks.length;
    index += 1
  ) {
    const track = tracks[index];
    const cached = readCache(track);

    if (cached) {
      results.push(
        toClassifiedTrack(
          track,
          cached,
          true
        )
      );

      onProgress?.(
        index + 1,
        tracks.length,
        track.name
      );

      continue;
    }

    const primaryArtist =
      track.artists[0]?.name ?? "";

    const classification = primaryArtist
      ? await fetchClassification(
          track,
          primaryArtist
        )
      : createUnknownClassification(
          track,
          ""
        );

    writeCache(
      track,
      classification
    );

    results.push(
      toClassifiedTrack(
        track,
        classification,
        false
      )
    );

    onProgress?.(
      index + 1,
      tracks.length,
      track.name
    );

    await new Promise(resolve =>
      setTimeout(resolve, 175)
    );
  }

  return results;
}



