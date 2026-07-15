async function main() {
  while (!Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  Spicetify.showNotification("🎵 Playlist+ loaded!");
}

export default main;