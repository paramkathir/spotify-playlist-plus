const LASTFM_API_KEY_STORAGE_KEY =
  "playlist-plus:lastfm-api-key:v1";

export function getLastFmApiKey():
  string | null {
  try {
    const value =
      Spicetify.LocalStorage.get(
        LASTFM_API_KEY_STORAGE_KEY
      );

    const trimmed =
      value?.trim() ?? "";

    return trimmed || null;
  } catch {
    return null;
  }
}

export function setLastFmApiKey(
  apiKey: string
): void {
  const trimmed = apiKey.trim();

  if (!trimmed) {
    throw new Error(
      "Last.fm API key cannot be empty."
    );
  }

  Spicetify.LocalStorage.set(
    LASTFM_API_KEY_STORAGE_KEY,
    trimmed
  );
}

export function clearLastFmApiKey():
  void {
  try {
    Spicetify.LocalStorage.remove(
      LASTFM_API_KEY_STORAGE_KEY
    );
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function requireLastFmApiKey():
  string {
  const apiKey = getLastFmApiKey();

  if (!apiKey) {
    throw new Error(
      "Playlist+ needs a Last.fm API key. Add one in Playlist+ settings first."
    );
  }

  return apiKey;
}
