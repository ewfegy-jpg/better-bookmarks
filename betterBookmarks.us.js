// ==UserScript==
// @name           Bookmark Icons (Zen-style)
// @ignorecache
// ==/UserScript==

class BookmarkIcons {
  constructor() {
    this.init();
  }

  async init() {
    await this.waitForElm("#placesContext");

    this.addContextMenuItem();
    this.applySavedIcons();
    this.observeBookmarks();
  }

  waitForElm(selector) {
    return new Promise(resolve => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  // =========================
  // Context menu
  // =========================

  addContextMenuItem() {
    const menu = document.getElementById("placesContext");
    if (!menu || menu.querySelector(".change-bookmark-icon")) return;

    const frag = MozXULElement.parseXULToFragment(`
      <menuitem class="change-bookmark-icon" label="Change Icon"/>
    `);

    menu.appendChild(frag);

    menu.addEventListener("command", async (e) => {
      if (!e.target.classList.contains("change-bookmark-icon")) return;

      const node = document.popupNode;
      if (!node) return;

      const guid = node._placesNode?.bookmarkGuid;
      if (!guid) return;

      const icon = await gZenEmojiPicker.open(node, {
        onlySvgIcons: true
      });

      if (icon) {
        this.saveIcon(guid, icon);
        this.applyIconToNode(node, icon);
      } else {
        this.removeIcon(guid);
      }
    });
  }

  // =========================
  // Storage
  // =========================

  get savedIcons() {
    const data = SessionStore.getCustomWindowValue(window, "bookmarkIcons");
    return data ? JSON.parse(data) : {};
  }

  set savedIcons(val) {
    SessionStore.setCustomWindowValue(
      window,
      "bookmarkIcons",
      JSON.stringify(val)
    );
  }

  saveIcon(guid, icon) {
    const icons = this.savedIcons;
    icons[guid] = icon;
    this.savedIcons = icons;
  }

  removeIcon(guid) {
    const icons = this.savedIcons;
    delete icons[guid];
    this.savedIcons = icons;
  }

  // =========================
  // Apply icons
  // =========================

  applySavedIcons() {
    setTimeout(() => {
      document.querySelectorAll("[places-node]").forEach(node => {
        const guid = node._placesNode?.bookmarkGuid;
        if (!guid) return;

        const icon = this.savedIcons[guid];
        if (icon) {
          this.applyIconToNode(node, icon);
        }
      });
    }, 1000);
  }

  applyIconToNode(node, iconUrl) {
    let iconBox = node.querySelector(".bookmark-custom-icon");

    if (!iconBox) {
      iconBox = document.createElement("span");
      iconBox.className = "bookmark-custom-icon";

      node.prepend(iconBox);
    }

    iconBox.innerHTML = "";

    if (iconUrl.endsWith(".svg")) {
      const img = document.createElement("img");
      img.src = iconUrl;
      iconBox.appendChild(img);
    } else {
      iconBox.textContent = iconUrl;
    }
  }

  // =========================
  // Observer
  // =========================

  observeBookmarks() {
    const observer = new MutationObserver(() => {
      this.applySavedIcons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// init
(function () {
  if (!globalThis.bookmarkIcons) {
    globalThis.bookmarkIcons = new BookmarkIcons();
  }
})();
