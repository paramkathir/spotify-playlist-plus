import {
  injectPlaylistPlusButton,
  removePlaylistPlusButton,
} from "./components/PlaylistButton";

const wait = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

async function main() {
  while (
    !Spicetify?.Platform?.History ||
    !Spicetify?.PopupModal ||
    !Spicetify?.showNotification
  ) {
    await wait(100);
  }

  const observer = new MutationObserver(() => {
    injectPlaylistPlusButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  Spicetify.Platform.History.listen(() => {
    removePlaylistPlusButton();

    setTimeout(() => {
      injectPlaylistPlusButton();
    }, 500);
  });

  injectPlaylistPlusButton();
  Spicetify.showNotification("Playlist+ loaded!");
}

export default main;
