/**
 * Loads WEB JMR release notes from data/whats-new.json.
 * Footer version, What's New page, Version History modal, and unread-dot
 * all read from that file after it loads.
 */
(function (global) {
  var NOTE_KEYS = ["added", "changed", "modified"];

  function getWhatsNewDataUrl() {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      var src = scripts[i].getAttribute("src") || "";
      if (/release-history\.js(\?|$)/.test(src)) {
        return src.replace(/js\/release-history\.js(\?.*)?$/, "data/whats-new.json");
      }
    }
    return "data/whats-new.json";
  }

  function normalizeItems(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map(function (item) {
        if (item && typeof item === "object" && item.title) {
          var note = { title: String(item.title) };
          if (item.description) {
            note.description = String(item.description);
          }
          return note;
        }
        if (typeof item === "string" && item) {
          return { title: item };
        }
        return null;
      })
      .filter(Boolean);
  }

  function normalizeReleases(data) {
    var releases = Array.isArray(data && data.releases) ? data.releases.slice() : [];
    var latestIndexes = [];

    releases.forEach(function (release, index) {
      NOTE_KEYS.forEach(function (key) {
        release[key] = normalizeItems(release[key]);
      });
      if (release.latest === true) {
        latestIndexes.push(index);
      }
    });

    if (!latestIndexes.length && releases.length) {
      releases[0].latest = true;
    } else if (latestIndexes.length > 1) {
      latestIndexes.slice(1).forEach(function (index) {
        releases[index].latest = false;
      });
    }

    releases.forEach(function (release) {
      release.current = release.latest === true;
    });

    return releases;
  }

  function applyReleases(data) {
    var releases = normalizeReleases(data);
    var latest =
      releases.find(function (release) {
        return release.latest === true;
      }) || releases[0];

    global.WEB_JMR_RELEASES = releases;
    global.WEB_JMR_CURRENT_VERSION = latest ? latest.version : "";
  }

  global.WEB_JMR_RELEASES = [];
  global.WEB_JMR_CURRENT_VERSION = "";
  global.WEB_JMR_RELEASES_READY = fetch(getWhatsNewDataUrl())
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load What's New data.");
      }
      return response.json();
    })
    .then(applyReleases)
    .catch(function (error) {
      console.error(error);
      applyReleases({ releases: [] });
    });
})(window);
