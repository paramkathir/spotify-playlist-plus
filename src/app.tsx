import { getCurrentPage } from "./services/spotify";

const wait = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

async function main() {
  while (
    !Spicetify?.showNotification ||
    !Spicetify?.Menu?.Item ||
    !Spicetify?.Platform?.History
  ) {
    await wait(100);
  }

  const playlistPlusMenu = new Spicetify.Menu.Item(
    "Playlist+",
    true,
    () => {
      const currentPage = getCurrentPage();
      Spicetify.showNotification(`Playlist+ — ${currentPage}`);
    },
    "playlist"
  );

  playlistPlusMenu.register();

  Spicetify.showNotification("Playlist+ loaded!");
}

export default main;
