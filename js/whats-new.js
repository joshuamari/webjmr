(function () {
  var STORAGE_KEY = "webJMR.lastViewedVersion";
  var NOTE_SECTIONS = [
    { key: "added", label: "ADDED" },
    { key: "changed", label: "CHANGED" },
    { key: "fixed", label: "FIXED" },
    { key: "removed", label: "REMOVED" },
  ];
  var PAGE_NOTE_SECTIONS = [
    { key: "added", label: "ADDED" },
    { key: "changed", label: "CHANGED" },
    { key: "modified", label: "MODIFIED" },
  ];

  var lastTrigger = null;
  var previousFocus = null;
  var escapeBound = false;

  function getReleases() {
    return Array.isArray(window.WEB_JMR_RELEASES) ? window.WEB_JMR_RELEASES : [];
  }

  function isLatestRelease(release) {
    return !!(release && (release.latest === true || release.current === true));
  }

  function getCurrentVersion() {
    if (window.WEB_JMR_CURRENT_VERSION) {
      return window.WEB_JMR_CURRENT_VERSION;
    }
    var current = getReleases().find(isLatestRelease);
    return current ? current.version : "";
  }

  function getAppRoot() {
    var parts = window.location.pathname.replace(/\\/g, "/").split("/").filter(Boolean);
    var idx = parts.findIndex(function (part) {
      return /^webjmr$/i.test(part);
    });
    if (idx >= 0) {
      return "/" + parts.slice(0, idx + 1).join("/");
    }
    return "";
  }

  function getWhatsNewUrl() {
    var root = getAppRoot();
    return root ? root + "/WhatsNew/" : "../WhatsNew/";
  }

  function getDashboardUrl() {
    var root = getAppRoot();
    return root ? root + "/" : "../";
  }

  function isWhatsNewPage() {
    return !!document.getElementById("whatsNewRoot");
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    var date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hasUnreadUpdate() {
    var current = getCurrentVersion();
    if (!current) return false;
    try {
      return localStorage.getItem(STORAGE_KEY) !== current;
    } catch (err) {
      return false;
    }
  }

  function markVersionViewed() {
    var current = getCurrentVersion();
    if (!current) return;
    try {
      localStorage.setItem(STORAGE_KEY, current);
    } catch (err) {}
    updateUnreadDots();
  }

  function isNoteObject(item) {
    return !!(item && typeof item === "object" && item.title);
  }

  function noteItemText(item) {
    if (isNoteObject(item)) {
      return item.description
        ? item.title + " — " + item.description
        : item.title;
    }
    return String(item == null ? "" : item);
  }

  function getPageNoteItems(items) {
    return (Array.isArray(items) ? items : [])
      .map(function (item) {
        if (isNoteObject(item)) {
          return item;
        }
        if (typeof item === "string" && item) {
          return { title: item };
        }
        return null;
      })
      .filter(Boolean);
  }

  function notesMarkup(release) {
    return NOTE_SECTIONS.map(function (section) {
      var items = Array.isArray(release[section.key]) ? release[section.key] : [];
      if (!items.length) return "";
      return (
        '<div class="whats-new-notes-group">' +
        '<p class="whats-new-notes-label">' +
        escapeHtml(section.label) +
        "</p><ul>" +
        items
          .map(function (item) {
            return "<li>" + escapeHtml(noteItemText(item)) + "</li>";
          })
          .join("") +
        "</ul></div>"
      );
    }).join("");
  }

  function pageNotesMarkup(release) {
    var sections = PAGE_NOTE_SECTIONS.map(function (section) {
      var items = getPageNoteItems(
        Array.isArray(release[section.key]) ? release[section.key] : [],
      );
      if (!items.length) return "";
      return (
        '<div class="whats-new-group">' +
        "<h3>" +
        escapeHtml(section.label) +
        "</h3>" +
        "<ul>" +
        items
          .map(function (item) {
            if (isNoteObject(item)) {
              return (
                "<li>" +
                '<span class="whats-new-note-title">' +
                escapeHtml(item.title) +
                "</span>" +
                (item.description
                  ? "<p>" + escapeHtml(item.description) + "</p>"
                  : "") +
                "</li>"
              );
            }
            return "<li>" + escapeHtml(item) + "</li>";
          })
          .join("") +
        "</ul></div>"
      );
    }).join("");

    return sections ? '<div class="whats-new-notes">' + sections + "</div>" : "";
  }

  function findPortalBlock() {
    var names = document.querySelectorAll(".logo_name.home");
    for (var i = 0; i < names.length; i++) {
      if (names[i].textContent.trim() === "KDT Portal") {
        return (
          names[i].closest(".position-relative, .relative") || names[i].parentElement
        );
      }
    }
    return null;
  }

  function injectSidebarItem() {
    if (document.getElementById("whatsNewLink")) return;
    var portal = findPortalBlock();
    if (!portal || !portal.parentNode) return;

    var url = getWhatsNewUrl();
    var slot = document.createElement("div");
    slot.className = "whats-new-sidebar-slot";
    slot.id = "whatsNewLink";
    slot.innerHTML =
      '<a class="whats-new-sidebar-link" href="' +
      escapeHtml(url) +
      '">' +
      '<i class="bx bx-info-circle" aria-hidden="true"></i>' +
      '<span class="link_name">What\'s New</span>' +
      '<span class="whats-new-dot" hidden></span>' +
      "</a>" +
      '<span class="whats-new-sidebar-tooltip">What\'s New</span>';
    portal.parentNode.insertBefore(slot, portal);
    if (isWhatsNewPage()) {
      var link = slot.querySelector("a");
      if (link) link.setAttribute("aria-current", "page");
    }
    updateUnreadDots();
  }

  function findCopyrightHost() {
    var footerText = document.querySelector(".footer-text");
    if (footerText) return footerText;
    var icon = document.querySelector(".bx-copyright");
    if (icon) {
      return icon.closest("p, div") || icon.parentElement;
    }
    return document.querySelector("footer");
  }

  function injectFooterVersion() {
    if (document.querySelector(".version-history-trigger")) return;
    var host = findCopyrightHost();
    if (!host) return;
    var version = getCurrentVersion();
    if (!version) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "version-history-trigger";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "versionHistoryModal");
    button.setAttribute("aria-label", "View version history");
    button.textContent = "Web JMR v" + version;
    host.appendChild(button);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      lastTrigger = button;
      openVersionHistory();
    });
  }

  function ensureModal() {
    if (document.getElementById("versionHistoryModal")) return;

    var backdrop = document.createElement("div");
    backdrop.className = "version-history-backdrop";
    backdrop.id = "versionHistoryBackdrop";
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div class="version-history-modal" id="versionHistoryModal" role="dialog" aria-modal="true" aria-labelledby="versionHistoryTitle" tabindex="-1">' +
      '<div class="version-history-header">' +
      "<div>" +
      '<h2 id="versionHistoryTitle">Version history</h2>' +
      "<p>What's new in WEB JMR</p>" +
      "</div>" +
      '<button type="button" class="version-history-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="version-history-body" id="versionHistoryBody"></div>' +
      "</div>";
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) {
        closeVersionHistory();
      }
    });
    backdrop
      .querySelector(".version-history-close")
      .addEventListener("click", closeVersionHistory);
  }

  function renderModalBody() {
    var body = document.getElementById("versionHistoryBody");
    if (!body) return;
    var releases = getReleases();
    body.innerHTML = releases
      .map(function (release, index) {
        var isCurrent = isLatestRelease(release);
        var openClass = isCurrent || index === 0 ? " is-open" : "";
        var expanded = isCurrent || index === 0;
        return (
          '<div class="version-history-item' +
          openClass +
          '">' +
          '<button type="button" class="version-history-item-header" aria-expanded="' +
          (expanded ? "true" : "false") +
          '">' +
          '<span class="version-history-version">v' +
          escapeHtml(release.version) +
          "</span>" +
          (isCurrent ? '<span class="version-history-badge">Current</span>' : "") +
          '<span class="version-history-date">' +
          escapeHtml(formatDate(release.date)) +
          "</span>" +
          '<i class="bx bx-chevron-down version-history-chevron" aria-hidden="true"></i>' +
          "</button>" +
          '<div class="version-history-item-body">' +
          notesMarkup(release) +
          "</div></div>"
        );
      })
      .join("");

    var headers = body.querySelectorAll(".version-history-item-header");
    for (var i = 0; i < headers.length; i++) {
      headers[i].addEventListener("click", function () {
        var item = this.closest(".version-history-item");
        var willOpen = !item.classList.contains("is-open");
        item.classList.toggle("is-open", willOpen);
        this.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    }
  }

  function onEscape(event) {
    if (event.key === "Escape") {
      closeVersionHistory();
    }
  }

  function openVersionHistory() {
    ensureModal();
    renderModalBody();
    var backdrop = document.getElementById("versionHistoryBackdrop");
    var modal = document.getElementById("versionHistoryModal");
    if (!backdrop || !modal) return;
    previousFocus = document.activeElement;
    backdrop.hidden = false;
    var closeBtn = backdrop.querySelector(".version-history-close");
    if (closeBtn) closeBtn.focus();
    if (!escapeBound) {
      document.addEventListener("keydown", onEscape);
      escapeBound = true;
    }
  }

  function closeVersionHistory() {
    var backdrop = document.getElementById("versionHistoryBackdrop");
    if (backdrop) backdrop.hidden = true;
    if (escapeBound) {
      document.removeEventListener("keydown", onEscape);
      escapeBound = false;
    }
    var restore = lastTrigger || previousFocus;
    if (restore && typeof restore.focus === "function") {
      restore.focus();
    }
  }

  function updateUnreadDots() {
    var show = hasUnreadUpdate() && !isWhatsNewPage();
    var dots = document.querySelectorAll(".whats-new-dot");
    for (var i = 0; i < dots.length; i++) {
      dots[i].hidden = !show;
    }
  }

  function renderWhatsNewPage() {
    var root = document.getElementById("whatsNewRoot");
    if (!root) return;

    var releases = getReleases();
    var latest = releases.find(isLatestRelease) || releases[0];
    var previous = releases.filter(function (release) {
      return release !== latest;
    });

    var notesHtml = pageNotesMarkup(latest);
    var latestHtml = latest
      ? '<section class="whats-new-release">' +
        '<p class="whats-new-kicker">Latest Release</p>' +
        '<div class="whats-new-release-head">' +
        "<h2>v" +
        escapeHtml(latest.version) +
        "</h2>" +
        (isLatestRelease(latest)
          ? '<span class="whats-new-latest-badge">Latest</span>'
          : "") +
        '<span class="whats-new-release-date">' +
        escapeHtml(formatDate(latest.date)) +
        "</span></div>" +
        (latest.summary
          ? '<p class="whats-new-summary">' +
            escapeHtml(latest.summary) +
            "</p>"
          : "") +
        notesHtml +
        "</section>"
      : "";

    var previousHtml = previous.length
      ? '<h2 class="whats-new-prev-heading">Previous Releases</h2>' +
        '<div class="whats-new-prev-list">' +
        previous
          .map(function (release, index) {
            return (
              '<article class="whats-new-prev-item" data-index="' +
              index +
              '">' +
              '<button type="button" class="whats-new-prev-header" aria-expanded="false">' +
              '<span class="whats-new-prev-version">v' +
              escapeHtml(release.version) +
              "</span>" +
              '<span class="whats-new-prev-date">' +
              escapeHtml(formatDate(release.date)) +
              "</span>" +
              '<span class="whats-new-prev-summary">' +
              escapeHtml(release.summary || "") +
              "</span>" +
              '<span class="whats-new-prev-toggle">' +
              "<span>View details</span>" +
              '<i class="bx bx-chevron-down" aria-hidden="true"></i>' +
              "</span></button>" +
              '<div class="whats-new-prev-body">' +
              pageNotesMarkup(release) +
              "</div></article>"
            );
          })
          .join("") +
        "</div>"
      : "";

    root.innerHTML =
      '<div class="whats-new-wrap">' + latestHtml + previousHtml + "</div>";

    var items = root.querySelectorAll(".whats-new-prev-item");
    for (var i = 0; i < items.length; i++) {
      bindPreviousItem(items[i]);
    }

    markVersionViewed();
  }

  function bindPreviousItem(item) {
    function toggle() {
      var willOpen = !item.classList.contains("is-open");
      item.classList.toggle("is-open", willOpen);
      var buttons = item.querySelectorAll("[aria-expanded]");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
    }
    var header = item.querySelector(".whats-new-prev-header");
    if (header) header.addEventListener("click", toggle);
  }

  function init() {
    if (!getReleases().length) return;
    injectSidebarItem();
    injectFooterVersion();
    ensureModal();
    if (isWhatsNewPage()) {
      document.body.classList.add("whats-new-page");
      renderWhatsNewPage();
    }
    updateUnreadDots();
  }

  function whenReady(callback) {
    var dataReady =
      window.WEB_JMR_RELEASES_READY &&
      typeof window.WEB_JMR_RELEASES_READY.then === "function"
        ? window.WEB_JMR_RELEASES_READY
        : Promise.resolve();
    var domReady =
      document.readyState === "loading"
        ? new Promise(function (resolve) {
            document.addEventListener("DOMContentLoaded", resolve);
          })
        : Promise.resolve();

    Promise.all([dataReady, domReady]).then(callback);
  }

  whenReady(init);
})();
