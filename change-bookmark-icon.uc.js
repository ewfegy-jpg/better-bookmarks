setTimeout(() => {
  const menu = document.getElementById("placesContext");
  if (!menu || menu.querySelector("#change-bookmark-icon")) return;

  const fragment = window.MozXULElement.parseXULToFragment(`
    <menuitem id="change-bookmark-icon" label="Change Bookmark Icon…"/>
  `);

  const deleteItem = menu.querySelector("#placesContext_deleteBookmark");
  if (deleteItem) {
    deleteItem.before(fragment);
  } else {
    menu.appendChild(fragment);
  }

  // ---- STORAGE ----
  function getSavedIcons() {
    try {
      return JSON.parse(
        SessionStore.getCustomWindowValue(window, "bookmarkIcons") || "{}"
      );
    } catch {
      return {};
    }
  }

  function saveIcons(data) {
    SessionStore.setCustomWindowValue(
      window,
      "bookmarkIcons",
      JSON.stringify(data)
    );
  }

function applyIcon(node, iconUrl) {
  if (!node) return;

  if (node.getAttribute("container") === "true") {
    // Folder
    node.style.setProperty(
      "list-style-image",
      `url("${iconUrl}")`,
      "important"
    );
  } else {
    // Bookmark
    node.setAttribute("image", iconUrl);
  }
}
  // ---- APPLY SAVED ICONS ON LOAD ----
  function applySavedIcons() {
    const icons = getSavedIcons();

    document.querySelectorAll(".bookmark-item").forEach((node) => {
      const id = node._placesNode?.bookmarkGuid || node._placesNode?.guid;
      if (id && icons[id]) {
        applyIcon(node, icons[id]);
      }
    });
  }

  // Initial apply
  setTimeout(applySavedIcons, 1000);

  // Reapply when UI changes
  const observer = new MutationObserver(() => {
    applySavedIcons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // ---- CONTEXT MENU ACTION ----
  menu.addEventListener("command", async (event) => {
    if (event.target.id !== "change-bookmark-icon") return;

    const triggerNode = menu.triggerNode;
    if (!triggerNode || !triggerNode.classList.contains("bookmark-item")) {
      console.error("No bookmark node");
      return;
    }

    if (!window.gZenEmojiPicker) {
      alert("Zen icon picker not available");
      return;
    }

    const iconUrl = await window.gZenEmojiPicker.open(triggerNode, {
      onlySvgIcons: true,
    });

    if (!iconUrl) return;

    const id =
      triggerNode._placesNode?.bookmarkGuid ||
      triggerNode._placesNode?.guid;

    if (!id) {
      console.error("No bookmark ID");
      return;
    }

    // Apply instantly
    applyIcon(triggerNode, iconUrl);

    // Save
    const icons = getSavedIcons();
    icons[id] = iconUrl;
    saveIcons(icons);

    console.log("Saved icon for", id, iconUrl);
  });
}, 500);setTimeout(() => {
  const menu = document.getElementById("placesContext");
  if (!menu || menu.querySelector("#change-bookmark-icon")) return;

  const fragment = window.MozXULElement.parseXULToFragment(`
    <menuitem id="change-bookmark-icon" label="Change Bookmark Icon…"/>
  `);

  const deleteItem = menu.querySelector("#placesContext_deleteBookmark");
  if (deleteItem) {
    deleteItem.before(fragment);
  } else {
    menu.appendChild(fragment);
  }

  // ---- STORAGE ----
  function getSavedIcons() {
    try {
      return JSON.parse(
        SessionStore.getCustomWindowValue(window, "bookmarkIcons") || "{}"
      );
    } catch {
      return {};
    }
  }

  function saveIcons(data) {
    SessionStore.setCustomWindowValue(
      window,
      "bookmarkIcons",
      JSON.stringify(data)
    );
  }

function applyIcon(node, iconUrl) {
  if (!node) return;

  if (node.getAttribute("container") === "true") {
    // Folder
    node.style.setProperty(
      "list-style-image",
      `url("${iconUrl}")`,
      "important"
    );
  } else {
    // Bookmark
    node.setAttribute("image", iconUrl);
  }
}
  // ---- APPLY SAVED ICONS ON LOAD ----
  function applySavedIcons() {
    const icons = getSavedIcons();

    document.querySelectorAll(".bookmark-item").forEach((node) => {
      const id = node._placesNode?.bookmarkGuid || node._placesNode?.guid;
      if (id && icons[id]) {
        applyIcon(node, icons[id]);
      }
    });
  }

  // Initial apply
  setTimeout(applySavedIcons, 1000);

  // Reapply when UI changes
  const observer = new MutationObserver(() => {
    applySavedIcons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // ---- CONTEXT MENU ACTION ----
  menu.addEventListener("command", async (event) => {
    if (event.target.id !== "change-bookmark-icon") return;

    const triggerNode = menu.triggerNode;
    if (!triggerNode || !triggerNode.classList.contains("bookmark-item")) {
      console.error("No bookmark node");
      return;
    }

    if (!window.gZenEmojiPicker) {
      alert("Zen icon picker not available");
      return;
    }

    const iconUrl = await window.gZenEmojiPicker.open(triggerNode, {
      onlySvgIcons: true,
    });

    if (!iconUrl) return;

    const id =
      triggerNode._placesNode?.bookmarkGuid ||
      triggerNode._placesNode?.guid;

    if (!id) {
      console.error("No bookmark ID");
      return;
    }

    // Apply instantly
    applyIcon(triggerNode, iconUrl);

    // Save
    const icons = getSavedIcons();
    icons[id] = iconUrl;
    saveIcons(icons);

    console.log("Saved icon for", id, iconUrl);
  });
}, 500);
