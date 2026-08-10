export type GenrePresetMatchMode =
  | "any"
  | "all";

export interface GenrePreset {
  id: string;
  name: string;
  genres: string[];
  matchMode: GenrePresetMatchMode;
  createdAt: number;
}

const GENRE_PRESETS_STORAGE_KEY =
  "playlist-plus:genre-presets:v1";

function isGenrePreset(
  value: unknown
): value is GenrePreset {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const preset =
    value as Partial<GenrePreset>;

  return Boolean(
    typeof preset.id === "string" &&
    typeof preset.name === "string" &&
    Array.isArray(preset.genres) &&
    preset.genres.every(
      genre => typeof genre === "string"
    ) &&
    (
      preset.matchMode === "any" ||
      preset.matchMode === "all"
    ) &&
    typeof preset.createdAt === "number"
  );
}

export function readGenrePresets():
  GenrePreset[] {
  try {
    const raw = Spicetify.LocalStorage.get(
      GENRE_PRESETS_STORAGE_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isGenrePreset);
  } catch {
    return [];
  }
}

export function writeGenrePresets(
  presets: GenrePreset[]
): void {
  try {
    Spicetify.LocalStorage.set(
      GENRE_PRESETS_STORAGE_KEY,
      JSON.stringify(presets)
    );
  } catch (error) {
    console.error(
      "[Playlist+] Could not save genre presets:",
      error
    );
  }
}

export function createGenrePreset(
  name: string,
  genres: string[],
  matchMode: GenrePresetMatchMode
): GenrePreset {
  return {
    id:
      `preset-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    name,
    genres: [...genres],
    matchMode,
    createdAt: Date.now(),
  };
}
