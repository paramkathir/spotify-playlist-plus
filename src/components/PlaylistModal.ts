import {
  getAllPlaylistTracks,
  getCurrentPlaylist,
} from "../services/playlist";

function createInfoRow(label: string, value: string): HTMLDivElement {
  const row = document.createElement("div");

  row.style.padding = "14px 0";
  row.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";

  const labelElement = document.createElement("div");
  labelElement.textContent = label;
  labelElement.style.color = "var(--spice-subtext, #b3b3b3)";
  labelElement.style.fontSize = "12px";
  labelElement.style.fontWeight = "700";
  labelElement.style.letterSpacing = "0.08em";
  labelElement.style.marginBottom = "6px";
  labelElement.style.textTransform = "uppercase";

  const valueElement = document.createElement("div");
  valueElement.textContent = value;
  valueElement.style.color = "var(--spice-text, #ffffff)";
  valueElement.style.fontSize = "18px";
  valueElement.style.fontWeight = "700";

  row.append(labelElement, valueElement);
  return row;
}

function createActionButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.style.marginTop = "18px";
  button.style.padding = "12px 18px";
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.background = "var(--spice-button, #1ed760)";
  button.style.color = "#000000";
  button.style.fontFamily = "inherit";
  button.style.fontSize = "14px";
  button.style.fontWeight = "700";
  button.style.cursor = "pointer";

  return button;
}

function createPlaylistModalContent(): HTMLDivElement {
  const container = document.createElement("div");
  const playlist = getCurrentPlaylist();

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.minWidth = "420px";
  container.style.padding = "0 4px 12px";

  if (!playlist) {
    container.append(
      createInfoRow("Current page", "Open a playlist to use Playlist+.")
    );

    return container;
  }

  container.append(
    createInfoRow("Current playlist", playlist.name),
    createInfoRow(
      "Songs",
      playlist.trackCount?.toLocaleString() ?? "Unavailable"
    ),
    createInfoRow("Owner", playlist.owner)
  );

  const loadButton = createActionButton("Load all playlist tracks");
  const results = document.createElement("div");

  results.style.marginTop = "16px";
  results.style.padding = "14px";
  results.style.borderRadius = "8px";
  results.style.background = "rgba(255, 255, 255, 0.06)";
  results.style.color = "var(--spice-text, #ffffff)";
  results.style.fontSize = "14px";
  results.style.lineHeight = "1.7";
  results.style.display = "none";

  loadButton.addEventListener("click", async () => {
    loadButton.disabled = true;
    results.style.display = "block";
    results.textContent = "Starting...";

    try {
      const tracks = await getAllPlaylistTracks(
        playlist.id,
        (loaded, total) => {
          loadButton.textContent =
            `Loading ${loaded.toLocaleString()} / ${total.toLocaleString()}`;

          results.textContent =
            `Loaded ${loaded.toLocaleString()} of ${total.toLocaleString()} tracks...`;
        }
      );

      const artistsByUri = new Map<string, string>();

      for (const track of tracks) {
        for (const artist of track.artists) {
          const key = artist.uri || artist.name.toLowerCase();

          if (!artistsByUri.has(key)) {
            artistsByUri.set(key, artist.name);
          }
        }
      }

      const artistsWithUris = [...artistsByUri.keys()].filter(
        key => key.startsWith("spotify:artist:")
      ).length;

      loadButton.textContent = "All tracks loaded";

      results.textContent =
        `Loaded ${tracks.length.toLocaleString()} tracks.\n` +
        `Found ${artistsByUri.size.toLocaleString()} unique artists.\n` +
        `${artistsWithUris.toLocaleString()} artists have Spotify URIs.\n\n` +
        `Next step: retrieve genre metadata.`;

      Spicetify.showNotification(
        `Loaded ${tracks.length.toLocaleString()} playlist tracks`
      );
    } catch (error) {
      results.textContent =
        error instanceof Error
          ? `Error: ${error.message}`
          : `Error: ${String(error)}`;

      loadButton.disabled = false;
      loadButton.textContent = "Try again";
    }
  });

  container.append(loadButton, results);
  return container;
}

export function openPlaylistModal(): void {
  Spicetify.PopupModal.display({
    title: "Playlist+",
    content: createPlaylistModalContent(),
    isLarge: false,
  });
}
