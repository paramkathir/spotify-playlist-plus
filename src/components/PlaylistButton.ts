import { openPlaylistModal } from "./PlaylistModal";

const BUTTON_ID = "playlist-plus-action-button";

function isPlaylistPage(): boolean {
  return Spicetify.Platform.History.location.pathname.startsWith("/playlist/");
}

export function removePlaylistPlusButton(): void {
  document.getElementById(BUTTON_ID)?.remove();
}

function findNameAndDetailsButton(): HTMLButtonElement | null {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button")
  );

  return (
    buttons.find(button =>
      button.textContent?.trim().toLowerCase().includes("name & details")
    ) ?? null
  );
}

function createPlaylistPlusButton(): HTMLButtonElement {
  const button = document.createElement("button");

  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "Playlist+";

  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.gap = "8px";
  button.style.minHeight = "32px";
  button.style.padding = "6px 16px";
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.background = "rgba(255, 255, 255, 0.1)";
  button.style.color = "var(--spice-text, #ffffff)";
  button.style.fontFamily = "inherit";
  button.style.fontSize = "14px";
  button.style.fontWeight = "700";
  button.style.cursor = "pointer";
  button.style.transition = "background 120ms ease, transform 120ms ease";

  button.addEventListener("mouseenter", () => {
    button.style.background = "rgba(255, 255, 255, 0.18)";
    button.style.transform = "scale(1.03)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.background = "rgba(255, 255, 255, 0.1)";
    button.style.transform = "scale(1)";
  });

  button.addEventListener("click", openPlaylistModal);

  return button;
}

export function injectPlaylistPlusButton(): void {
  if (!isPlaylistPage()) {
    removePlaylistPlusButton();
    return;
  }

  if (document.getElementById(BUTTON_ID)) {
    return;
  }

  const nameAndDetailsButton = findNameAndDetailsButton();

  if (!nameAndDetailsButton?.parentElement) {
    return;
  }

  const playlistPlusButton = createPlaylistPlusButton();

  nameAndDetailsButton.insertAdjacentElement(
    "afterend",
    playlistPlusButton
  );
}

