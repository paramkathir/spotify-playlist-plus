import type {
  GenrePreset,
  GenrePresetMatchMode,
} from "../services/genrePresetStorage";

export interface GenrePresetDialogResult {
  name: string;
  genres: string[];
  matchMode: GenrePresetMatchMode;
}

interface GenrePresetDialogOptions {
  title: string;
  allGenres: string[];
  initialName?: string;
  initialGenres?: string[];
  initialMatchMode?: GenrePresetMatchMode;
  existingPreset?: GenrePreset;
}

function makeElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string
): HTMLElementTagNameMap[K] {
  const element =
    document.createElement(tag);

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

export function openGenrePresetDialog(
  options: GenrePresetDialogOptions
): Promise<GenrePresetDialogResult | null> {
  return new Promise(resolve => {
    const selectedGenres = new Set(
      options.initialGenres ?? []
    );

    let matchMode:
      GenrePresetMatchMode =
        options.initialMatchMode ?? "any";

    const overlay =
      makeElement("div");

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "100000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "24px";
    overlay.style.background =
      "rgba(0,0,0,0.72)";
    overlay.style.backdropFilter =
      "blur(8px)";

    const dialog =
      makeElement("div");

    dialog.style.width =
      "min(680px, 100%)";
    dialog.style.maxHeight =
      "min(760px, 88vh)";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";
    dialog.style.background =
      "var(--spice-main, #181818)";
    dialog.style.color =
      "var(--spice-text, #ffffff)";
    dialog.style.border =
      "1px solid rgba(255,255,255,0.14)";
    dialog.style.borderRadius = "18px";
    dialog.style.boxShadow =
      "0 24px 80px rgba(0,0,0,0.55)";
    dialog.style.overflow = "hidden";

    const header =
      makeElement("div");

    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent =
      "space-between";
    header.style.padding = "20px 22px";
    header.style.borderBottom =
      "1px solid rgba(255,255,255,0.10)";

    const heading =
      makeElement("div", options.title);

    heading.style.fontSize = "20px";
    heading.style.fontWeight = "800";

    const closeButton =
      makeElement("button", "×");

    closeButton.type = "button";
    closeButton.style.width = "36px";
    closeButton.style.height = "36px";
    closeButton.style.border = "none";
    closeButton.style.borderRadius =
      "999px";
    closeButton.style.background =
      "rgba(255,255,255,0.08)";
    closeButton.style.color =
      "var(--spice-text, #ffffff)";
    closeButton.style.fontSize = "22px";
    closeButton.style.cursor = "pointer";

    header.append(
      heading,
      closeButton
    );

    const body =
      makeElement("div");

    body.style.padding = "22px";
    body.style.overflowY = "auto";

    const nameLabel =
      makeElement("label", "Preset name");

    nameLabel.style.display = "block";
    nameLabel.style.marginBottom = "8px";
    nameLabel.style.fontSize = "13px";
    nameLabel.style.fontWeight = "750";

    const nameInput =
      makeElement("input");

    nameInput.type = "text";
    nameInput.value =
      options.initialName ?? "";
    nameInput.placeholder =
      "Example: Late Night";
    nameInput.maxLength = 50;
    nameInput.style.boxSizing =
      "border-box";
    nameInput.style.width = "100%";
    nameInput.style.padding =
      "12px 14px";
    nameInput.style.border =
      "1px solid rgba(255,255,255,0.16)";
    nameInput.style.borderRadius = "10px";
    nameInput.style.background =
      "rgba(255,255,255,0.07)";
    nameInput.style.color =
      "var(--spice-text, #ffffff)";
    nameInput.style.fontFamily = "inherit";
    nameInput.style.fontSize = "14px";
    nameInput.style.outline = "none";

    const modeHeading =
      makeElement("div", "Match mode");

    modeHeading.style.marginTop = "22px";
    modeHeading.style.marginBottom =
      "10px";
    modeHeading.style.fontSize = "13px";
    modeHeading.style.fontWeight = "750";

    const modeRow =
      makeElement("div");

    modeRow.style.display = "flex";
    modeRow.style.gap = "10px";

    const anyButton =
      makeElement("button", "Any");

    const allButton =
      makeElement("button", "All");

    for (
      const button of [
        anyButton,
        allButton,
      ]
    ) {
      button.type = "button";
      button.style.padding =
        "9px 18px";
      button.style.borderRadius =
        "999px";
      button.style.fontFamily = "inherit";
      button.style.fontWeight = "750";
      button.style.cursor = "pointer";
    }

    function refreshModeButtons(): void {
      for (
        const [
          button,
          mode,
        ] of [
          [anyButton, "any"],
          [allButton, "all"],
        ] as const
      ) {
        const active =
          matchMode === mode;

        button.style.border = active
          ? "1px solid rgba(30,215,96,0.75)"
          : "1px solid rgba(255,255,255,0.14)";

        button.style.background = active
          ? "rgba(30,215,96,0.17)"
          : "rgba(255,255,255,0.06)";

        button.style.color = active
          ? "var(--spice-button, #1ed760)"
          : "var(--spice-text, #ffffff)";
      }
    }

    anyButton.addEventListener(
      "click",
      () => {
        matchMode = "any";
        refreshModeButtons();
      }
    );

    allButton.addEventListener(
      "click",
      () => {
        matchMode = "all";
        refreshModeButtons();
      }
    );

    modeRow.append(
      anyButton,
      allButton
    );

    const genresHeadingRow =
      makeElement("div");

    genresHeadingRow.style.display =
      "flex";
    genresHeadingRow.style.alignItems =
      "center";
    genresHeadingRow.style.justifyContent =
      "space-between";
    genresHeadingRow.style.gap = "12px";
    genresHeadingRow.style.marginTop =
      "22px";
    genresHeadingRow.style.marginBottom =
      "10px";

    const genresHeading =
      makeElement("div", "Genres");

    genresHeading.style.fontSize = "13px";
    genresHeading.style.fontWeight =
      "750";

    const selectionCount =
      makeElement("div");

    selectionCount.style.fontSize =
      "12px";
    selectionCount.style.color =
      "var(--spice-subtext, #b3b3b3)";

    genresHeadingRow.append(
      genresHeading,
      selectionCount
    );

    const genreSearch =
      makeElement("input");

    genreSearch.type = "text";
    genreSearch.placeholder =
      "Search genres";
    genreSearch.style.boxSizing =
      "border-box";
    genreSearch.style.width = "100%";
    genreSearch.style.padding =
      "10px 13px";
    genreSearch.style.marginBottom =
      "12px";
    genreSearch.style.border =
      "1px solid rgba(255,255,255,0.14)";
    genreSearch.style.borderRadius =
      "10px";
    genreSearch.style.background =
      "rgba(255,255,255,0.06)";
    genreSearch.style.color =
      "var(--spice-text, #ffffff)";
    genreSearch.style.fontFamily =
      "inherit";
    genreSearch.style.fontSize = "13px";
    genreSearch.style.outline = "none";

    const genreGrid =
      makeElement("div");

    genreGrid.style.display = "grid";
    genreGrid.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(150px, 1fr))";
    genreGrid.style.gap = "9px";

    const sortedGenres =
      [...options.allGenres].sort(
        (a, b) =>
          a.localeCompare(b)
      );

    function renderGenres(): void {
      genreGrid.innerHTML = "";

      const query =
        genreSearch.value
          .trim()
          .toLowerCase();

      const visibleGenres =
        sortedGenres.filter(
          genre =>
            genre
              .toLowerCase()
              .includes(query)
        );

      selectionCount.textContent =
        `${selectedGenres.size} selected`;

      for (
        const genre of visibleGenres
      ) {
        const selected =
          selectedGenres.has(genre);

        const button =
          makeElement("button", genre);

        button.type = "button";
        button.style.padding =
          "10px 12px";
        button.style.border = selected
          ? "1px solid rgba(30,215,96,0.75)"
          : "1px solid rgba(255,255,255,0.12)";
        button.style.borderRadius =
          "10px";
        button.style.background = selected
          ? "rgba(30,215,96,0.17)"
          : "rgba(255,255,255,0.055)";
        button.style.color = selected
          ? "var(--spice-button, #1ed760)"
          : "var(--spice-text, #ffffff)";
        button.style.fontFamily =
          "inherit";
        button.style.fontSize = "12px";
        button.style.fontWeight = "700";
        button.style.textAlign = "left";
        button.style.cursor = "pointer";

        button.addEventListener(
          "click",
          () => {
            if (
              selectedGenres.has(genre)
            ) {
              selectedGenres.delete(genre);
            } else {
              selectedGenres.add(genre);
            }

            renderGenres();
          }
        );

        genreGrid.append(button);
      }

      if (visibleGenres.length === 0) {
        const empty =
          makeElement(
            "div",
            "No genres match your search."
          );

        empty.style.gridColumn = "1 / -1";
        empty.style.padding = "20px";
        empty.style.textAlign = "center";
        empty.style.color =
          "var(--spice-subtext, #b3b3b3)";
        empty.style.fontSize = "13px";

        genreGrid.append(empty);
      }
    }

    genreSearch.addEventListener(
      "input",
      renderGenres
    );

    body.append(
      nameLabel,
      nameInput,
      modeHeading,
      modeRow,
      genresHeadingRow,
      genreSearch,
      genreGrid
    );

    const footer =
      makeElement("div");

    footer.style.display = "flex";
    footer.style.justifyContent =
      "flex-end";
    footer.style.gap = "10px";
    footer.style.padding = "18px 22px";
    footer.style.borderTop =
      "1px solid rgba(255,255,255,0.10)";

    const cancelButton =
      makeElement("button", "Cancel");

    const saveButton =
      makeElement(
        "button",
        options.existingPreset
          ? "Save changes"
          : "Create preset"
      );

    cancelButton.type = "button";
    saveButton.type = "button";

    cancelButton.style.padding =
      "10px 17px";
    cancelButton.style.border =
      "1px solid rgba(255,255,255,0.14)";
    cancelButton.style.borderRadius =
      "999px";
    cancelButton.style.background =
      "rgba(255,255,255,0.06)";
    cancelButton.style.color =
      "var(--spice-text, #ffffff)";
    cancelButton.style.fontFamily =
      "inherit";
    cancelButton.style.fontWeight =
      "750";
    cancelButton.style.cursor =
      "pointer";

    saveButton.style.padding =
      "10px 18px";
    saveButton.style.border = "none";
    saveButton.style.borderRadius =
      "999px";
    saveButton.style.background =
      "var(--spice-button, #1ed760)";
    saveButton.style.color = "#000000";
    saveButton.style.fontFamily =
      "inherit";
    saveButton.style.fontWeight = "850";
    saveButton.style.cursor = "pointer";

    footer.append(
      cancelButton,
      saveButton
    );

    dialog.append(
      header,
      body,
      footer
    );

    overlay.append(dialog);
    document.body.append(overlay);

    let closed = false;

    function close(
      result: GenrePresetDialogResult | null
    ): void {
      if (closed) {
        return;
      }

      closed = true;
      overlay.remove();
      resolve(result);
    }

    closeButton.addEventListener(
      "click",
      () => close(null)
    );

    cancelButton.addEventListener(
      "click",
      () => close(null)
    );

    overlay.addEventListener(
      "click",
      event => {
        if (event.target === overlay) {
          close(null);
        }
      }
    );

    dialog.addEventListener(
      "click",
      event =>
        event.stopPropagation()
    );

    saveButton.addEventListener(
      "click",
      () => {
        const name =
          nameInput.value.trim();

        if (!name) {
          Spicetify.showNotification(
            "Enter a name for the preset.",
            true
          );

          nameInput.focus();
          return;
        }

        if (selectedGenres.size === 0) {
          Spicetify.showNotification(
            "Choose at least one genre.",
            true
          );

          return;
        }

        close({
          name,
          genres: [...selectedGenres],
          matchMode,
        });
      }
    );

    const keyHandler = (
      event: KeyboardEvent
    ): void => {
      if (event.key === "Escape") {
        document.removeEventListener(
          "keydown",
          keyHandler
        );

        close(null);
      }
    };

    document.addEventListener(
      "keydown",
      keyHandler
    );

    refreshModeButtons();
    renderGenres();

    window.setTimeout(
      () => {
        nameInput.focus();
        nameInput.select();
      },
      50
    );
  });
}
