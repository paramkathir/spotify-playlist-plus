import {
  createGenrePreset,
  readGenrePresets,
  writeGenrePresets,
  type GenrePreset,
  type GenrePresetMatchMode,
} from "../services/genrePresetStorage";

import {
  openGenrePresetDialog,
} from "./GenrePresetDialog";

interface GenrePresetsOptions {
  allGenres: string[];
  selectedGenres: Set<string>;
  getMatchMode:
    () => GenrePresetMatchMode;
  setMatchMode:
    (
      mode: GenrePresetMatchMode
    ) => void;
  onFiltersChanged: () => void;
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

export function createGenrePresetsSection(
  options: GenrePresetsOptions
): HTMLElement {
  let presets = readGenrePresets();

  const section =
    makeElement("div");

  section.style.marginTop = "22px";
  section.style.padding = "16px";
  section.style.border =
    "1px solid rgba(255,255,255,0.10)";
  section.style.borderRadius = "12px";
  section.style.background =
    "rgba(255,255,255,0.035)";

  const header =
    makeElement("div");

  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent =
    "space-between";
  header.style.gap = "12px";

  const title =
    makeElement("div", "Genre presets");

  title.style.fontSize = "14px";
  title.style.fontWeight = "800";

  const createButton =
    makeElement(
      "button",
      "+ Create preset"
    );

  createButton.type = "button";
  createButton.style.padding =
    "8px 12px";
  createButton.style.border =
    "1px solid rgba(30,215,96,0.45)";
  createButton.style.borderRadius =
    "999px";
  createButton.style.background =
    "rgba(30,215,96,0.12)";
  createButton.style.color =
    "var(--spice-button, #1ed760)";
  createButton.style.fontFamily =
    "inherit";
  createButton.style.fontSize = "12px";
  createButton.style.fontWeight = "800";
  createButton.style.cursor = "pointer";

  const list =
    makeElement("div");

  list.style.display = "grid";
  list.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(190px, 1fr))";
  list.style.gap = "10px";
  list.style.marginTop = "14px";

  header.append(
    title,
    createButton
  );

  section.append(
    header,
    list
  );

  async function createPreset(): Promise<void> {
    const result =
      await openGenrePresetDialog({
        title: "Create genre preset",
        allGenres: options.allGenres,
        initialGenres:
          [...options.selectedGenres],
        initialMatchMode:
          options.getMatchMode(),
      });

    if (!result) {
      return;
    }

    const duplicate =
      presets.find(
        preset =>
          preset.name.toLowerCase() ===
          result.name.toLowerCase()
      );

    if (duplicate) {
      Spicetify.showNotification(
        `A preset named "${duplicate.name}" already exists.`,
        true
      );

      return;
    }

    presets.push(
      createGenrePreset(
        result.name,
        result.genres,
        result.matchMode
      )
    );

    writeGenrePresets(presets);
    render();

    Spicetify.showNotification(
      `Created preset "${result.name}".`
    );
  }

  async function editPreset(
    preset: GenrePreset
  ): Promise<void> {
    const result =
      await openGenrePresetDialog({
        title: "Edit genre preset",
        allGenres: options.allGenres,
        initialName: preset.name,
        initialGenres: preset.genres,
        initialMatchMode:
          preset.matchMode,
        existingPreset: preset,
      });

    if (!result) {
      return;
    }

    const duplicate =
      presets.find(
        item =>
          item.id !== preset.id &&
          item.name.toLowerCase() ===
            result.name.toLowerCase()
      );

    if (duplicate) {
      Spicetify.showNotification(
        `A preset named "${duplicate.name}" already exists.`,
        true
      );

      return;
    }

    preset.name = result.name;
    preset.genres = [...result.genres];
    preset.matchMode =
      result.matchMode;

    writeGenrePresets(presets);
    render();

    Spicetify.showNotification(
      `Updated preset "${preset.name}".`
    );
  }

  function applyPreset(
    preset: GenrePreset
  ): void {
    const availableGenres =
      preset.genres.filter(
        genre =>
          options.allGenres.includes(genre)
      );

    const unavailableCount =
      preset.genres.length -
      availableGenres.length;

    if (
      availableGenres.length === 0
    ) {
      Spicetify.showNotification(
        `None of the genres in "${preset.name}" exist in this playlist.`,
        true
      );

      return;
    }

    options.selectedGenres.clear();

    for (
      const genre of availableGenres
    ) {
      options.selectedGenres.add(genre);
    }

    options.setMatchMode(
      preset.matchMode
    );

    options.onFiltersChanged();

    if (unavailableCount > 0) {
      Spicetify.showNotification(
        `Applied "${preset.name}". ${unavailableCount} unavailable genre${unavailableCount === 1 ? "" : "s"} skipped.`
      );
    } else {
      Spicetify.showNotification(
        `Applied preset "${preset.name}".`
      );
    }
  }

  function deletePreset(
    preset: GenrePreset
  ): void {
    const shouldDelete =
      window.confirm(
        `Delete the preset "${preset.name}"?`
      );

    if (!shouldDelete) {
      return;
    }

    presets =
      presets.filter(
        item => item.id !== preset.id
      );

    writeGenrePresets(presets);
    render();

    Spicetify.showNotification(
      `Deleted preset "${preset.name}".`
    );
  }

  function render(): void {
    list.innerHTML = "";

    if (presets.length === 0) {
      const empty =
        makeElement(
          "div",
          "No presets yet. Create one from your current genres or choose genres inside the preset editor."
        );

      empty.style.gridColumn = "1 / -1";
      empty.style.color =
        "var(--spice-subtext, #b3b3b3)";
      empty.style.fontSize = "12px";
      empty.style.padding = "4px 0";

      list.append(empty);
      return;
    }

    for (const preset of presets) {
      const card =
        makeElement("div");

      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.minHeight = "112px";
      card.style.padding = "13px";
      card.style.border =
        "1px solid rgba(255,255,255,0.13)";
      card.style.borderRadius = "12px";
      card.style.background =
        "rgba(255,255,255,0.055)";

      const cardTitle =
        makeElement("button", preset.name);

      cardTitle.type = "button";
      cardTitle.title =
        `Apply ${preset.name}`;
      cardTitle.style.padding = "0";
      cardTitle.style.border = "none";
      cardTitle.style.background =
        "transparent";
      cardTitle.style.color =
        "var(--spice-text, #ffffff)";
      cardTitle.style.fontFamily =
        "inherit";
      cardTitle.style.fontSize = "14px";
      cardTitle.style.fontWeight = "800";
      cardTitle.style.textAlign = "left";
      cardTitle.style.cursor = "pointer";

      const details =
        makeElement(
          "div",
          `${preset.genres.length} genre${preset.genres.length === 1 ? "" : "s"} • ${preset.matchMode === "any" ? "Any" : "All"}`
        );

      details.title =
        preset.genres.join(", ");
      details.style.marginTop = "5px";
      details.style.color =
        "var(--spice-subtext, #b3b3b3)";
      details.style.fontSize = "11px";
      details.style.whiteSpace = "nowrap";
      details.style.overflow = "hidden";
      details.style.textOverflow =
        "ellipsis";

      const actions =
        makeElement("div");

      actions.style.display = "flex";
      actions.style.gap = "8px";
      actions.style.marginTop = "auto";
      actions.style.paddingTop = "13px";

      const editButton =
        makeElement("button", "Edit");

      const deleteButton =
        makeElement("button", "Delete");

      for (
        const button of [
          editButton,
          deleteButton,
        ]
      ) {
        button.type = "button";
        button.style.flex = "1";
        button.style.padding = "7px 9px";
        button.style.border =
          "1px solid rgba(255,255,255,0.12)";
        button.style.borderRadius =
          "8px";
        button.style.background =
          "rgba(255,255,255,0.05)";
        button.style.color =
          "var(--spice-text, #ffffff)";
        button.style.fontFamily =
          "inherit";
        button.style.fontSize = "11px";
        button.style.fontWeight = "700";
        button.style.cursor = "pointer";
      }

      deleteButton.style.color =
        "#ff8f8f";

      cardTitle.addEventListener(
        "click",
        () => applyPreset(preset)
      );

      editButton.addEventListener(
        "click",
        () => {
          void editPreset(preset);
        }
      );

      deleteButton.addEventListener(
        "click",
        () => deletePreset(preset)
      );

      actions.append(
        editButton,
        deleteButton
      );

      card.append(
        cardTitle,
        details,
        actions
      );

      list.append(card);
    }
  }

  createButton.addEventListener(
    "click",
    () => {
      void createPreset();
    }
  );

  render();

  return section;
}
