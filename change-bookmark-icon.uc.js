setTimeout(() => {
  const menu = document.getElementById("placesContext");
  if (!menu || menu.querySelector("#change-bookmark-icon")) return;

  // ---- CLONE NATIVE MENU ITEM ----
  const tabMenuItem = document.getElementById("context_zen-edit-tab-icon");
  let fragment;
  if (tabMenuItem) {
    fragment = tabMenuItem.cloneNode(true);
    fragment.id = "change-bookmark-icon";
    fragment.removeAttribute("data-lazy-l10n-id");

    setTimeout(() => {
      const l10nId = tabMenuItem.getAttribute("data-l10n-id") || "tab-context-zen-edit-icon";
      try {
        document.l10n.setAttributes(fragment, l10nId);
        const labelText = tabMenuItem.getAttribute("label") || "Change Icon…";
        for (const lbl of fragment.querySelectorAll("label")) {
          lbl.textContent = labelText;
          lbl.setAttribute("value", labelText);
        }
      } catch (e) {
        console.warn("Localization failed", e);
      }
    }, 50);
  } else {
    fragment = window.MozXULElement.parseXULToFragment(`
      <menuitem id="change-bookmark-icon" label="Change Bookmark Icon…"/>
    `);
  }

  const deleteItem = menu.querySelector("#placesContext_deleteBookmark");
  if (deleteItem) deleteItem.before(fragment);
  else menu.appendChild(fragment);

  console.log("Bookmark 'Change Icon' menu item inserted correctly");

  // ---- STORAGE HELPERS ----
  function getSavedIcons() {
    try {
      return JSON.parse(SessionStore.getCustomWindowValue(window, "bookmarkIcons") || "{}");
    } catch {
      return {};
    }
  }
  function saveIcons(data) {
    SessionStore.setCustomWindowValue(window, "bookmarkIcons", JSON.stringify(data));
  }

  // ---- EMOJI -> DATA URL ----
  function emojiToSvgDataUrl(emoji) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <text y="28" font-size="28">${emoji}</text>
      </svg>
    `.trim();
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  }

  // ---- ICON / EMOJI APPLY FUNCTION ----
  function applyIcon(node, iconUrl) {
    if (!node) return;
    const isFolder = node.getAttribute("container") === "true";

    // RESET ICON
    if (!iconUrl || iconUrl === "RESET_ICON") {
      if (isFolder) {
        node.style.removeProperty("--bookmark-item-icon");
      } else {
        const uri = node._placesNode?.uri || "";
        if (uri) node.setAttribute("image", `page-icon:${uri}`);
        else node.removeAttribute("image");
      }
      return;
    }

    // Emoji -> convert to SVG data URL
    let finalUrl = iconUrl;
    if (!/^(data:|chrome:|file:|resource:)/.test(iconUrl)) {
      finalUrl = emojiToSvgDataUrl(iconUrl);
    }

    if (isFolder) {
      // Instead of list-style-image, store in CSS variable
      node.style.setProperty("--bookmark-item-icon", `url("${finalUrl}")`);
    } else {
      node.setAttribute("image", finalUrl);
    }
  }

  // ---- APPLY SAVED ICONS BY BOOKMARK ID ----
  function applySavedIcons() {
    const icons = getSavedIcons();
    document.querySelectorAll(".bookmark-item").forEach(node => {
      const id = node._placesNode?.bookmarkGuid || node._placesNode?.guid;
      if (id && icons[id]) applyIcon(node, icons[id]);
    });
  }

  setTimeout(applySavedIcons, 1000);

  // Reapply when DOM changes (new bookmarks, moved folders)
  const observer = new MutationObserver(() => {
    const icons = getSavedIcons();
    document.querySelectorAll(".bookmark-item").forEach(node => {
      const id = node._placesNode?.bookmarkGuid || node._placesNode?.guid;
      if (id && icons[id]) applyIcon(node, icons[id]);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ---- CONTEXT MENU HANDLER ----
  menu.addEventListener("command", async (event) => {
    if (event.target.id !== "change-bookmark-icon") return;

    const triggerNode = menu.triggerNode;
    if (!triggerNode || !triggerNode.classList.contains("bookmark-item")) {
      console.error("No bookmark node");
      return;
    }

    if (!window.gZenEmojiPicker) {
      alert("Zen emoji picker not available");
      return;
    }

    const icon = await window.gZenEmojiPicker.open(triggerNode, { onlySvgIcons: false });
    const icons = getSavedIcons();
    const id = triggerNode._placesNode?.bookmarkGuid || triggerNode._placesNode?.guid;
    if (!id) return;

    if (!icon || icon === "RESET_ICON") {
      applyIcon(triggerNode, "RESET_ICON");
      delete icons[id];
      saveIcons(icons);
      console.log("Reset icon for", id);
      return;
    }

    applyIcon(triggerNode, icon);
    icons[id] = icon;
    saveIcons(icons);
    console.log("Saved icon for", id, icon);
  });

}, 500);
