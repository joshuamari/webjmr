const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
let allowedGroups = [];
let reportData = null;
let viewMode = "pivot";
let jrdFocus = null;
let customizeState = defaultCustomize([]);
let expandedGroups = {};
let tableTimer = null;
let suggestIndex = -1;

checkAccess()
  .then((result) => {
    if (result.isSuccess) {
      empDetails = result.data;
      $(document).ready(function () {
        setDate();
        getGroups()
          .then((grps) => {
            if (grps.isSuccess) {
              fillGroups(grps.data || []);
              getTable();
              return;
            }
            alert(grps.message || "Could not load groups.");
          })
          .catch((error) => {
            alert(rdAlertText(error));
          });
      });
    } else {
      alert(result.message);
      window.location.href = `${rootFolder}/webJMR/DailyReport`;
    }
  })
  .catch((error) => {
    alert(rdAlertText(error));
  });

$(document).on("change", "#monthSel", function () {
  syncMonthDisplay();
  scheduleTable();
});

$(document).on("click", "#groupControl", function (e) {
  e.stopPropagation();
  toggleGroupMenu();
});

$(document).on("keydown", "#groupControl", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleGroupMenu();
  }
});

$(document).on("click", "#groupMenu", function (e) {
  e.stopPropagation();
});

$(document).on("click", function () {
  closeGroupMenu();
});

$(document).on("keydown", function (e) {
  if (e.key === "Escape") {
    closeGroupMenu();
  }
});

$(document).on("change", ".grp-check", function () {
  syncGroupDisplay();
  scheduleTable();
});

$(document).on("change", "#chkAllGroups", function () {
  var selectAll = $(this).prop("checked");
  $(".grp-check").prop("checked", selectAll);
  this.indeterminate = false;
  syncGroupDisplay();
  scheduleTable();
});

$(document).on("click", ".rd-view-btn", function () {
  var nextView = $(this).data("view");
  if (nextView === viewMode) {
    return;
  }
  viewMode = nextView;
  $(".rd-view-btn").removeClass("active");
  $(this).addClass("active");
  if (viewMode !== "pivot") {
    closeCustomize();
  }
  updateViewChrome();
  renderCurrentView();
});

$(document).on("input", "#jrdFocusInput", function () {
  renderJrdSuggestions($(this).val());
});

$(document).on("focus", "#jrdFocusInput", function () {
  closeGroupMenu();
  renderJrdSuggestions($(this).val());
});

$(document).on("keydown", "#jrdFocusInput", function (e) {
  var items = $("#jrdFocusMenu .rd-jrd-suggest-item");
  if (!$("#jrdFocusMenu").hasClass("d-none") && items.length) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      suggestIndex = Math.min(suggestIndex + 1, items.length - 1);
      items.removeClass("active").eq(suggestIndex).addClass("active");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      suggestIndex = Math.max(suggestIndex - 1, 0);
      items.removeClass("active").eq(suggestIndex).addClass("active");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      var chosen = items.filter(".active").first();
      if (!chosen.length) {
        chosen = items.first();
      }
      chosen.trigger("click");
      return;
    }
  }
  if (e.key === "Escape") {
    hideJrdSuggestions();
    syncJrdFocusInput();
  }
});

$(document).on("click", ".rd-jrd-suggest-item", function () {
  setJrdFocus({
    id: String($(this).attr("data-jrd-id")),
    description: $(this).attr("data-jrd-desc") || "",
    group: $(this).attr("data-jrd-group") || "",
    groupName: $(this).attr("data-jrd-group-name") || "",
  });
});

$(document).on("click", "#btnClearJrdFocus", function () {
  setJrdFocus(null);
});

$(document).on("click", function (e) {
  if (!$(e.target).closest(".rd-jrd-search-wrap").length) {
    hideJrdSuggestions();
    syncJrdFocusInput();
  }
});

$(document).on("click", "#btnResetTable", function () {
  customizeState = defaultCustomize((reportData && reportData.jrds) || []);
  renderCurrentView();
});

$(document).on("click", "#btnCustomize", function () {
  openCustomize();
});

$(document).on("click", "#btnCloseCustomize, #btnCancelCustomize, #customizeOverlay", function () {
  closeCustomize();
});

$(document).on("click", "#btnApplyCustomize", function () {
  applyCustomize();
});

$(document).on("input", "#customizeSearch", function () {
  filterCustomizeList($(this).val());
});

$(document).on("click", ".rd-group-card-head", function () {
  var card = $(this).closest(".rd-group-card");
  card.toggleClass("collapsed");
  var expanded = !card.hasClass("collapsed");
  expandedGroups[card.attr("data-group")] = expanded;
  $(this).find(".rd-card-chevron").toggleClass("bx-chevron-up", expanded);
  $(this).find(".rd-card-chevron").toggleClass("bx-chevron-down", !expanded);
});

$(document).on("dragstart", ".rd-jrd-col-item", function (e) {
  if ($(e.target).closest("input, label").length) {
    e.preventDefault();
    return;
  }
  var id = $(this).attr("data-jrd-id");
  e.originalEvent.dataTransfer.setData("text/plain", id);
  e.originalEvent.dataTransfer.effectAllowed = "move";
  $(this).addClass("dragging");
});

$(document).on("dragend", ".rd-jrd-col-item", function () {
  $(".rd-jrd-col-item").removeClass("dragging");
});

$(document).on("dragover", ".rd-jrd-col-item", function (e) {
  e.preventDefault();
  var dragging = document.querySelector(".rd-jrd-col-item.dragging");
  if (!dragging || dragging === this) {
    return;
  }
  var rect = this.getBoundingClientRect();
  var before = e.originalEvent.clientY < rect.top + rect.height / 2;
  if (before) {
    this.parentNode.insertBefore(dragging, this);
  } else {
    this.parentNode.insertBefore(dragging, this.nextSibling);
  }
});

function rdAlertText(error) {
  if (!error) {
    return "Could not load R&D Manhour Report data.";
  }
  if (typeof error === "string") {
    return error;
  }
  return error.message || "Could not load R&D Manhour Report data.";
}

function rdAjaxMessage(xhr, fallback) {
  if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
    return xhr.responseJSON.message;
  }
  if (xhr && xhr.responseText) {
    try {
      var parsed = JSON.parse(xhr.responseText);
      if (parsed && parsed.message) {
        return parsed.message;
      }
    } catch (ignore) {}
  }
  if (xhr && xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  }
  return fallback;
}

function escapeHtml(value) {
  return $("<div>").text(value == null ? "" : String(value)).html();
}

function formatHours(hours) {
  var num = Number(hours);
  if (!isFinite(num)) {
    num = 0;
  }
  return num.toFixed(2);
}

function hasHours(hours) {
  var num = Number(hours);
  return isFinite(num) && Math.abs(num) > 0.0001;
}

function monthLabel(ym) {
  var parts = String(ym || "").split("-");
  if (parts.length < 2) {
    return ym || "";
  }
  var date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  if (isNaN(date.getTime())) {
    return ym;
  }
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function defaultCustomize(jrds) {
  var ids = (jrds || []).map(function (jrd) {
    return String(jrd.id);
  });
  return {
    visibleJrdIds: ids.slice(),
    jrdOrder: ids.slice(),
    showTotalRow: true,
    showGroupSubtotal: true,
    compactRows: false,
    wrapJrdTitles: true,
  };
}

function checkedGroupAbbrevs() {
  var groups = [];
  $(".grp-check:checked").each(function () {
    groups.push($(this).val());
  });
  return groups;
}

function selectedGroups() {
  var checked = checkedGroupAbbrevs();
  if (checked.length === 0) {
    return allowedGroups.map(function (group) {
      return group.abbreviation;
    });
  }
  return checked;
}

function selectedGroupLabel() {
  var checked = checkedGroupAbbrevs();
  if (checked.length === 0 || checked.length === allowedGroups.length) {
    return "All Groups";
  }
  if (checked.length === 1) {
    return checked[0];
  }
  if (checked.length === 2) {
    return checked[0] + ", " + checked[1];
  }
  return checked.length + " Groups Selected";
}

function isGroupMenuOpen() {
  return !$("#groupMenu").hasClass("d-none");
}

function closeGroupMenu() {
  $("#groupMenu").addClass("d-none");
  $("#groupControl").attr("aria-expanded", "false");
  $(".rd-field-group").removeClass("is-open");
}

function openGroupMenu() {
  $("#groupMenu").removeClass("d-none");
  $("#groupControl").attr("aria-expanded", "true");
  $(".rd-field-group").addClass("is-open");
}

function toggleGroupMenu() {
  if (isGroupMenuOpen()) {
    closeGroupMenu();
  } else {
    openGroupMenu();
  }
}

function syncGroupDisplay() {
  var label = selectedGroupLabel();
  var total = $(".grp-check").length;
  var checked = $(".grp-check:checked").length;
  var selectAll = document.getElementById("chkAllGroups");
  $("#buSelDisplay").text(label);
  $("#groupControl").attr("aria-label", "Group: " + label);
  if (selectAll) {
    selectAll.indeterminate = checked > 0 && checked < total;
    selectAll.checked = total > 0 && checked === total;
  }
}

function groupTitle(group) {
  return (group && group.name) || (group && group.abbreviation) || "";
}

function jrdByIdMap() {
  var map = {};
  ((reportData && reportData.jrds) || []).forEach(function (jrd) {
    map[String(jrd.id)] = jrd;
  });
  return map;
}

function hoursLookup(map, jrdId) {
  if (!map) {
    return 0;
  }
  var key = String(jrdId);
  if (Object.prototype.hasOwnProperty.call(map, key)) {
    return Number(map[key]) || 0;
  }
  return 0;
}

function duplicateJrdNames(jrds) {
  var counts = {};
  (jrds || []).forEach(function (jrd) {
    var name = String(jrd.description || "").toLowerCase();
    counts[name] = (counts[name] || 0) + 1;
  });
  return counts;
}

function jrdHeaderLabel(jrd, jrds) {
  var counts = duplicateJrdNames(jrds);
  var name = jrd.description || "";
  if ((counts[String(name).toLowerCase()] || 0) > 1) {
    return name + " (" + (jrd.groupName || jrd.group || "") + ")";
  }
  return name;
}

function jrdFocusLabel(focus) {
  if (!focus) {
    return "";
  }
  return (focus.description || "") + " — " + (focus.groupName || focus.group || "");
}

function focusedJrdRecord() {
  if (!jrdFocus) {
    return null;
  }
  return jrdByIdMap()[String(jrdFocus.id)] || null;
}

function groupContainsFocusedJrd(group) {
  var jrd = focusedJrdRecord();
  if (!jrd || !group) {
    return false;
  }
  var jrdId = String(jrd.id);
  if (String(jrd.group || "") !== String(group.abbreviation || "")) {
    return false;
  }
  if (
    (group.jrdIds || []).some(function (id) {
      return String(id) === jrdId;
    })
  ) {
    return true;
  }
  return hasHours(hoursLookup(group.hoursByJrd, jrdId));
}

function groupsForCurrentView(data) {
  var groups = (data && data.groups) || [];
  if (!jrdFocus) {
    return groups.slice();
  }
  return groups.filter(groupContainsFocusedJrd);
}

function groupFocusStats(group) {
  if (!jrdFocus) {
    return {
      activityCount: group.activityCount || 0,
      contributorCount: group.contributorCount || 0,
      totalHours: Number(group.totalHours) || 0,
    };
  }
  var jrdId = String(jrdFocus.id);
  var contributorCount = 0;
  (group.employees || []).forEach(function (emp) {
    if (hasHours(hoursLookup(emp.hoursByJrd, jrdId))) {
      contributorCount += 1;
    }
  });
  return {
    activityCount: 1,
    contributorCount: contributorCount,
    totalHours: hoursLookup(group.hoursByJrd, jrdId),
  };
}

function focusedViewStats(data) {
  var groups = groupsForCurrentView(data);
  if (!jrdFocus) {
    var summary = (data && data.summary) || {};
    return {
      groups: groups,
      activityCount: summary.activityCount || 0,
      contributorCount: summary.contributorCount || 0,
      totalHours: summary.totalHours || 0,
      groupCount: summary.groupCount || groups.length,
      summaryTotalLabel: (data && data.summaryTotalLabel) || "ALL GROUPS TOTAL",
    };
  }
  var contributorMap = {};
  var totalHours = 0;
  groups.forEach(function (group) {
    var stats = groupFocusStats(group);
    totalHours += Number(stats.totalHours) || 0;
    (group.employees || []).forEach(function (emp) {
      if (hasHours(hoursLookup(emp.hoursByJrd, jrdFocus.id))) {
        contributorMap[emp.empNum] = true;
      }
    });
  });
  return {
    groups: groups,
    activityCount: groups.length ? 1 : 0,
    contributorCount: Object.keys(contributorMap).length,
    totalHours: totalHours,
    groupCount: groups.length,
    summaryTotalLabel: "ALL GROUPS TOTAL",
  };
}

function groupTableId(group) {
  return (
    "groupTable_" +
    String((group && group.abbreviation) || "group").replace(/[^A-Za-z0-9_-]/g, "_")
  );
}

function visibleJrdColumns() {
  var jrds = (reportData && reportData.jrds) || [];
  var byId = jrdByIdMap();
  if (jrdFocus && byId[String(jrdFocus.id)]) {
    return [byId[String(jrdFocus.id)]];
  }
  var order =
    customizeState.jrdOrder && customizeState.jrdOrder.length
      ? customizeState.jrdOrder.slice()
      : jrds.map(function (jrd) {
          return String(jrd.id);
        });
  jrds.forEach(function (jrd) {
    if (order.indexOf(String(jrd.id)) === -1) {
      order.push(String(jrd.id));
    }
  });
  var visibleIds = customizeState.visibleJrdIds || order;
  var visible = [];
  order.forEach(function (id) {
    var jrd = byId[String(id)];
    if (!jrd) {
      return;
    }
    if (visibleIds.indexOf(String(id)) === -1) {
      return;
    }
    visible.push(jrd);
  });
  return visible;
}

function groupJrdColumns(group) {
  var byId = jrdByIdMap();
  var jrds = [];
  (group.jrdIds || []).forEach(function (id) {
    var jrd = byId[String(id)];
    if (jrd) {
      jrds.push(jrd);
    }
  });
  if (jrdFocus) {
    jrds = jrds.filter(function (jrd) {
      return String(jrd.id) === String(jrdFocus.id);
    });
  }
  return jrds;
}

function scheduleTable() {
  clearTimeout(tableTimer);
  tableTimer = setTimeout(getTable, 200);
}

function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_access.php",
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(
          rdAjaxMessage(
            xhr,
            "An error occurred in the PHP script while checking login details."
          )
        );
      },
    });
  });
}

function setDate() {
  var today = new Date();
  var rawMonth = `${today.getMonth() + 1}`;
  var dateString = `${today.getFullYear()}-${rawMonth.padStart(2, "0")}`;
  $("#monthSel").val(dateString);
  syncMonthDisplay();
}

function syncMonthDisplay() {
  var label = monthLabel($("#monthSel").val());
  $("#monthDisplay").text(label || "");
}

function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_user_groups.php",
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(
          rdAjaxMessage(
            xhr,
            "An error occurred in the PHP script while fetching group details."
          )
        );
      },
    });
  });
}

function fillGroups(grps) {
  allowedGroups = (grps || []).filter(function (group) {
    return group && group.abbreviation;
  });
  var html = "";
  allowedGroups.forEach(function (group) {
    html += `<label class="rd-group-option" title="${escapeHtml(
      group.name || group.abbreviation
    )}">
      <input type="checkbox" class="rd-checkbox grp-check" value="${escapeHtml(
        group.abbreviation
      )}" data-grp-id="${escapeHtml(group.group_id || "")}" checked />
      <span>${escapeHtml(group.abbreviation)}</span>
    </label>`;
  });
  $("#groupChecks").html(html);
  syncGroupDisplay();
}

function cellAttrs(extra) {
  return `data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-v="middle" ${extra || ""}`;
}

function hoursCell(hours, className, extra) {
  if (!hasHours(hours)) {
    return `<td class="${className} rd-dash" ${cellAttrs(
      'data-a-h="center" ' + (extra || "")
    )}>-</td>`;
  }
  return `<td class="${className}" ${cellAttrs(
    'data-t="n" data-a-h="center" ' + (extra || "")
  )}>${formatHours(hours)}</td>`;
}

function renderEmpty(message) {
  reportData = null;
  $("#reportView").empty();
  $("#summaryCards, #viewToolbar").addClass("d-none");
  if (message) {
    $("#emptyState").text(message).removeClass("d-none");
  } else {
    $("#emptyState").text("").addClass("d-none");
  }
  $("#btnPrint, #btnExport").prop("disabled", true);
}

function updateSummaryCards(stats) {
  var summary = stats || {};
  $("#sumHours").text(formatHours(summary.totalHours || 0));
  $("#sumActivities").text(summary.activityCount || 0);
  $("#sumContributors").text(summary.contributorCount || 0);
  $("#sumGroups").text(summary.groupCount || 0);
  $("#summaryCards").removeClass("d-none");
}

function updateViewChrome() {
  var isPivot = viewMode === "pivot";
  $("#pivotActions").toggleClass("d-none", !isPivot);
  $("#btnViewPivot").toggleClass("active", isPivot);
  $("#btnViewByGroup").toggleClass("active", !isPivot);
  $("#viewHintText").text(
    isPivot
      ? "Group, Employee No. and Employee stay fixed while JRD columns scroll."
      : "Each group displays only its own R&D Job Request Descriptions."
  );
}

function syncJrdFocusInput() {
  if (jrdFocus) {
    $("#jrdFocusInput").val(jrdFocusLabel(jrdFocus));
    $("#btnClearJrdFocus").removeClass("d-none");
    $(".rd-jrd-search-wrap").addClass("has-focus");
  } else {
    if (!$("#jrdFocusInput").is(":focus")) {
      $("#jrdFocusInput").val("");
    }
    $("#btnClearJrdFocus").addClass("d-none");
    $(".rd-jrd-search-wrap").removeClass("has-focus");
  }
}

function hideJrdSuggestions() {
  $("#jrdFocusMenu").addClass("d-none").empty();
  suggestIndex = -1;
}

function matchingJrds(query) {
  var jrds = (reportData && reportData.jrds) || [];
  var checked = checkedGroupAbbrevs();
  var restrictGroups = checked.length > 0 && checked.length < allowedGroups.length;
  var needle = String(query || "").trim().toLowerCase();
  if (jrdFocus && needle === jrdFocusLabel(jrdFocus).toLowerCase()) {
    needle = "";
  }
  return jrds.filter(function (jrd) {
    if (restrictGroups && checked.indexOf(String(jrd.group)) === -1) {
      return false;
    }
    if (!needle) {
      return true;
    }
    var hay = (
      (jrd.description || "") +
      " " +
      (jrd.groupName || "") +
      " " +
      (jrd.group || "")
    ).toLowerCase();
    return hay.indexOf(needle) !== -1;
  });
}

function renderJrdSuggestions(query) {
  if (!reportData) {
    hideJrdSuggestions();
    return;
  }
  var matches = matchingJrds(query).slice(0, 20);
  if (!matches.length) {
    $("#jrdFocusMenu")
      .html('<div class="rd-jrd-suggest-empty">No matching JRD.</div>')
      .removeClass("d-none");
    suggestIndex = -1;
    return;
  }
  var html = matches
    .map(function (jrd) {
      var label = escapeHtml(jrd.description || "") + " — " + escapeHtml(jrd.groupName || jrd.group || "");
      return `<button type="button" class="rd-jrd-suggest-item" data-jrd-id="${escapeHtml(
        jrd.id
      )}" data-jrd-desc="${escapeHtml(jrd.description || "")}" data-jrd-group="${escapeHtml(
        jrd.group || ""
      )}" data-jrd-group-name="${escapeHtml(jrd.groupName || "")}">${label}</button>`;
    })
    .join("");
  $("#jrdFocusMenu").html(html).removeClass("d-none");
  suggestIndex = -1;
}

function setJrdFocus(nextFocus) {
  jrdFocus = nextFocus;
  hideJrdSuggestions();
  syncJrdFocusInput();
  renderCurrentView();
}

function tableClassNames(extra, useCustomize) {
  var cls = "rd-table " + (extra || "");
  if (useCustomize && customizeState.compactRows) {
    cls += " rd-compact";
  }
  if (useCustomize && !customizeState.wrapJrdTitles) {
    cls += " rd-nowrap-titles";
  }
  return cls.trim();
}

function measureTextWidth(text, fontSpec) {
  var span = document.createElement("span");
  span.style.position = "absolute";
  span.style.left = "-9999px";
  span.style.top = "0";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  span.style.fontFamily = fontSpec.fontFamily || "Poppins, sans-serif";
  span.style.fontSize = fontSpec.fontSize || "13px";
  span.style.fontWeight = fontSpec.fontWeight || "400";
  span.style.letterSpacing = fontSpec.letterSpacing || "normal";
  span.style.textTransform = fontSpec.textTransform || "none";
  span.textContent = text == null ? "" : String(text);
  document.body.appendChild(span);
  var width = span.getBoundingClientRect().width;
  span.remove();
  return width;
}

function computePivotGroupColumn(data) {
  var compact = !!(customizeState && customizeState.compactRows);
  var bodyFont = {
    fontFamily: "Poppins, sans-serif",
    fontSize: compact ? "12px" : "13px",
    fontWeight: "700",
  };
  var headerFont = {
    fontFamily: "Poppins, sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };
  var texts = ["GROUP"];
  ((data && data.groups) || []).forEach(function (group) {
    var name = groupTitle(group);
    if (name) {
      texts.push(name);
      texts.push(name + " Total");
    }
  });
  if (data && data.grandTotalLabel) {
    texts.push(data.grandTotalLabel);
  }
  var widest = 0;
  texts.forEach(function (text) {
    var isHeader = String(text).toUpperCase() === "GROUP";
    var width = measureTextWidth(text, isHeader ? headerFont : bodyFont);
    if (width > widest) {
      widest = width;
    }
  });
  var padding = compact ? 20 : 24;
  var safety = 8;
  var rawNeeded = Math.ceil(widest + padding + safety);
  var minWidth = 120;
  var maxWidth = 280;
  var width = Math.max(minWidth, Math.min(maxWidth, rawNeeded));
  return {
    width: width,
    wrap: rawNeeded > maxWidth,
    rawNeeded: rawNeeded,
  };
}

function computeByGroupEmployeeColumn(group) {
  var bodyFont = {
    fontFamily: "Poppins, sans-serif",
    fontSize: "13px",
    fontWeight: "400",
  };
  var headerFont = {
    fontFamily: "Poppins, sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };
  var widest = measureTextWidth("EMPLOYEE", headerFont);
  ((group && group.employees) || []).forEach(function (emp) {
    var name = emp && emp.name ? String(emp.name) : "";
    if (!name) {
      return;
    }
    var width = measureTextWidth(name, bodyFont);
    if (width > widest) {
      widest = width;
    }
  });
  var padding = 24;
  var safety = 8;
  var rawNeeded = Math.ceil(widest + padding + safety);
  var minWidth = 160;
  var maxWidth = 240;
  var width = Math.max(minWidth, Math.min(maxWidth, rawNeeded));
  return {
    width: width,
    wrap: rawNeeded > maxWidth,
    rawNeeded: rawNeeded,
  };
}

function renderPivot(data) {
  var groups = data.groups || [];
  var jrds = visibleJrdColumns();
  var jrdHeaders = jrds
    .map(function (jrd) {
      return `<th class="rd-jrd" ${cellAttrs(
        'data-a-h="center" data-a-wrap="true" data-fill-color="E8F1FB" data-f-bold="true"'
      )}>${escapeHtml(jrdHeaderLabel(jrd, data.jrds || []))}</th>`;
    })
    .join("");

  var bodyHtml = "";
  groups.forEach(function (group) {
    var employees = group.employees || [];
    var rowspan = employees.length;
    employees.forEach(function (emp, index) {
      var groupCell =
        index === 0
          ? `<td class="rd-col-group rd-sticky-1" rowspan="${rowspan}" ${cellAttrs(
              'data-a-h="left" data-f-bold="true"'
            )}>${escapeHtml(groupTitle(group))}</td>`
          : "";
      var jrdCells = jrds
        .map(function (jrd) {
          return hoursCell(hoursLookup(emp.hoursByJrd, jrd.id), "rd-jrd");
        })
        .join("");
      bodyHtml += `
        <tr class="rd-emp-row">
          ${groupCell}
          <td class="rd-col-empno rd-sticky-2" ${cellAttrs('data-a-h="left"')}>${escapeHtml(
            emp.empNum
          )}</td>
          <td class="rd-col-emp rd-sticky-3" title="${escapeHtml(emp.name)}" ${cellAttrs(
            'data-a-h="left" data-a-wrap="false"'
          )}>${escapeHtml(emp.name)}</td>
          ${jrdCells}
          <td class="rd-total" ${cellAttrs(
            'data-t="n" data-a-h="center" data-f-bold="true"'
          )}>${formatHours(emp.hours)}</td>
        </tr>`;
    });

    if (customizeState.showGroupSubtotal) {
      var subJrd = jrds
        .map(function (jrd) {
          return hoursCell(
            hoursLookup(group.hoursByJrd, jrd.id),
            "rd-jrd",
            'data-f-bold="true" data-fill-color="EEF5FD"'
          );
        })
        .join("");
      bodyHtml += `
        <tr class="rd-group-total">
          <td class="rd-sticky-1" ${cellAttrs(
            'data-a-h="left" data-f-bold="true" data-fill-color="EEF5FD"'
          )}>${escapeHtml(groupTitle(group) + " Total")}</td>
          <td class="rd-sticky-2" ${cellAttrs('data-fill-color="EEF5FD"')}></td>
          <td class="rd-sticky-3" ${cellAttrs('data-fill-color="EEF5FD"')}></td>
          ${subJrd}
          <td class="rd-total" ${cellAttrs(
            'data-t="n" data-a-h="center" data-f-bold="true" data-fill-color="EEF5FD"'
          )}>${formatHours(group.totalHours)}</td>
        </tr>`;
    }
  });

  if (customizeState.showTotalRow && data.showGrandTotal) {
    var grandJrd = jrds
      .map(function (jrd) {
        return hoursCell(
          hoursLookup(data.grandHoursByJrd, jrd.id),
          "rd-jrd",
          'data-f-bold="true" data-fill-color="DCEAFB"'
        );
      })
      .join("");
    bodyHtml += `
      <tr class="rd-grand-total">
        <td class="rd-sticky-1" ${cellAttrs(
          'data-a-h="left" data-f-bold="true" data-fill-color="DCEAFB"'
        )}>${escapeHtml(data.grandTotalLabel || "GRAND TOTAL (ALL GROUPS)")}</td>
        <td class="rd-sticky-2" ${cellAttrs('data-fill-color="DCEAFB"')}></td>
        <td class="rd-sticky-3" ${cellAttrs('data-fill-color="DCEAFB"')}></td>
        ${grandJrd}
        <td class="rd-total" ${cellAttrs(
          'data-t="n" data-a-h="center" data-f-bold="true" data-fill-color="DCEAFB"'
        )}>${formatHours(data.grandTotalHours)}</td>
      </tr>`;
  }

  var groupCol = computePivotGroupColumn(data);
  var empNoWidth = 85;
  var empWidth = 210;
  var totalWidth = 110;
  var wrapClass = groupCol.wrap ? " rd-group-col-wrap" : "";
  var minWidth =
    groupCol.width +
    empNoWidth +
    empWidth +
    totalWidth +
    Math.max(jrds.length, 1) * 150;
  return `
    <div class="rd-pivot-view" style="--pivot-group-width:${groupCol.width}px;--pivot-empno-width:${empNoWidth}px;--pivot-employee-width:${empWidth}px;--pivot-total-width:${totalWidth}px">
    <div class="rd-table-wrap">
      <table class="${tableClassNames(
        "rd-pivot-table" + wrapClass,
        true
      )}" id="mainTable" style="min-width:${minWidth}px">
        <thead>
          <tr class="rd-col-header">
            <th class="rd-col-group rd-sticky-1" ${cellAttrs(
              'data-a-h="left" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Group</th>
            <th class="rd-col-empno rd-sticky-2" ${cellAttrs(
              'data-a-h="left" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>EMP NO.</th>
            <th class="rd-col-emp rd-sticky-3" ${cellAttrs(
              'data-a-h="left" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Employee</th>
            ${jrdHeaders}
            <th class="rd-total rd-col-total" ${cellAttrs(
              'data-a-h="center" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Total MH</th>
          </tr>
        </thead>
        <tbody>
          ${bodyHtml}
        </tbody>
      </table>
    </div>
    </div>`;
}

function renderGroupSummary(data, viewStats) {
  var stats = viewStats || focusedViewStats(data);
  var groups = stats.groups || [];
  var rows = groups
    .map(function (group) {
      var groupStats = groupFocusStats(group);
      return `
        <tr class="rd-emp-row">
          <td class="rd-col-group" ${cellAttrs('data-a-h="left"')}>${escapeHtml(
            groupTitle(group)
          )}</td>
          <td class="rd-hours" ${cellAttrs('data-t="n" data-a-h="center"')}>${
            groupStats.activityCount
          }</td>
          <td class="rd-hours" ${cellAttrs('data-t="n" data-a-h="center"')}>${
            groupStats.contributorCount
          }</td>
          <td class="rd-total" ${cellAttrs(
            'data-t="n" data-a-h="center" data-f-bold="true"'
          )}>${formatHours(groupStats.totalHours)}</td>
        </tr>`;
    })
    .join("");

  return `
    <h3 class="rd-section-title">ALL GROUPS SUMMARY</h3>
    <div class="rd-table-wrap">
      <table class="${tableClassNames("rd-summary-table")}" id="summaryTable">
        <thead>
          <tr>
            <th class="rd-col-group" ${cellAttrs(
              'data-a-h="left" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Group</th>
            <th ${cellAttrs(
              'data-a-h="center" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>No. of Activities</th>
            <th ${cellAttrs(
              'data-a-h="center" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Contributors</th>
            <th class="rd-total" ${cellAttrs(
              'data-a-h="center" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Total MH</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="rd-grand-total">
            <td ${cellAttrs(
              'data-a-h="left" data-f-bold="true" data-fill-color="DCEAFB"'
            )}>${escapeHtml(stats.summaryTotalLabel || "ALL GROUPS TOTAL")}</td>
            <td ${cellAttrs(
              'data-t="n" data-a-h="center" data-f-bold="true" data-fill-color="DCEAFB"'
            )}>${stats.activityCount || 0}</td>
            <td ${cellAttrs(
              'data-t="n" data-a-h="center" data-f-bold="true" data-fill-color="DCEAFB"'
            )}>${stats.contributorCount || 0}</td>
            <td class="rd-total" ${cellAttrs(
              'data-t="n" data-a-h="center" data-f-bold="true" data-fill-color="DCEAFB"'
            )}>${formatHours(stats.totalHours)}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

function renderGroupDetailTable(group, jrds, tableId) {
  var employees = group.employees || [];
  var empCol = computeByGroupEmployeeColumn(group);
  var empNoWidth = 80;
  var totalWidth = 100;
  var jrdMin = 150;
  var jrdCount = Math.max(jrds.length, 1);
  var minWidth = empNoWidth + empCol.width + totalWidth + jrdCount * jrdMin;
  var wrapClass = empCol.wrap ? " rd-emp-col-wrap" : "";
  var jrdCols = jrds
    .map(function () {
      return '<col class="bygroup-jrd-col" />';
    })
    .join("");
  var jrdHeaders = jrds
    .map(function (jrd) {
      return `<th class="rd-jrd" ${cellAttrs(
        'data-a-h="center" data-a-wrap="true" data-fill-color="E8F1FB" data-f-bold="true"'
      )}>${escapeHtml(jrd.description || "")}</th>`;
    })
    .join("");
  var bodyHtml = employees
    .map(function (emp) {
      var jrdCells = jrds
        .map(function (jrd) {
          return hoursCell(hoursLookup(emp.hoursByJrd, jrd.id), "rd-jrd");
        })
        .join("");
      return `
        <tr class="rd-emp-row">
          <td class="rd-col-empno rd-sticky-1" ${cellAttrs('data-a-h="left"')}>${escapeHtml(
            emp.empNum
          )}</td>
          <td class="rd-col-emp rd-sticky-2" title="${escapeHtml(emp.name)}" ${cellAttrs(
            'data-a-h="left" data-a-wrap="false"'
          )}>${escapeHtml(emp.name)}</td>
          ${jrdCells}
          <td class="rd-total rd-col-total" ${cellAttrs(
            'data-t="n" data-a-h="center" data-f-bold="true"'
          )}>${formatHours(emp.hours)}</td>
        </tr>`;
    })
    .join("");

  var subJrd = jrds
    .map(function (jrd) {
      return hoursCell(
        hoursLookup(group.hoursByJrd, jrd.id),
        "rd-jrd",
        'data-f-bold="true" data-fill-color="EEF5FD"'
      );
    })
    .join("");

  return `
    <div class="rd-table-wrap">
      <table class="${tableClassNames(
        "rd-group-detail-table" + wrapClass
      )}" id="${tableId}" style="--bygroup-empno-width:${empNoWidth}px;--bygroup-employee-width:${empCol.width}px;--bygroup-total-width:${totalWidth}px;--bygroup-jrd-min:${jrdMin}px;min-width:${minWidth}px">
        <colgroup>
          <col class="bygroup-empno-col" />
          <col class="bygroup-employee-col" />
          ${jrdCols}
          <col class="bygroup-total-col" />
        </colgroup>
        <thead>
          <tr>
            <th class="rd-col-empno rd-sticky-1" ${cellAttrs(
              'data-a-h="left" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>EMP NO.</th>
            <th class="rd-col-emp rd-sticky-2" ${cellAttrs(
              'data-a-h="left" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Employee</th>
            ${jrdHeaders}
            <th class="rd-total rd-col-total" ${cellAttrs(
              'data-a-h="center" data-fill-color="E8F1FB" data-f-bold="true"'
            )}>Total MH</th>
          </tr>
        </thead>
        <tbody>
          ${bodyHtml}
          <tr class="rd-group-total">
            <td class="rd-bygroup-total-label" colspan="2" ${cellAttrs(
              'data-a-h="left" data-f-bold="true" data-fill-color="EEF5FD"'
            )}>${escapeHtml(groupTitle(group) + " Total")}</td>
            ${subJrd}
            <td class="rd-total rd-col-total" ${cellAttrs(
              'data-t="n" data-a-h="center" data-f-bold="true" data-fill-color="EEF5FD"'
            )}>${formatHours(group.totalHours)}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

function renderByGroup(data) {
  var viewStats = focusedViewStats(data);
  var groups = viewStats.groups || [];
  var cards = groups
    .map(function (group, index) {
      var jrds = groupJrdColumns(group);
      var groupStats = groupFocusStats(group);
      var expanded = jrdFocus ? true : expandedGroups[group.abbreviation];
      if (!jrdFocus && expanded === undefined) {
        expanded = index === 0;
        expandedGroups[group.abbreviation] = expanded;
      }
      var collapsedClass = expanded ? "" : " collapsed";
      var chevron = expanded ? "bx-chevron-up" : "bx-chevron-down";
      return `
        <div class="rd-group-card${collapsedClass}" data-group="${escapeHtml(
          group.abbreviation
        )}">
          <button type="button" class="rd-group-card-head">
            <span class="rd-group-card-title">${escapeHtml(groupTitle(group))}</span>
            <span class="rd-group-pills">
              <span class="rd-pill">${groupStats.activityCount} JRDs</span>
              <span class="rd-pill">${groupStats.contributorCount} Contributors</span>
              <span class="rd-pill">${formatHours(groupStats.totalHours)} Total MH</span>
            </span>
            <i class="bx ${chevron} rd-card-chevron"></i>
          </button>
          <div class="rd-group-card-body">
            ${renderGroupDetailTable(group, jrds, groupTableId(group))}
          </div>
        </div>`;
    })
    .join("");

  return `
    ${renderGroupSummary(data, viewStats)}
    <h3 class="rd-section-title">GROUP DETAIL TABLES</h3>
    ${cards || '<p class="rd-empty">No groups contain the selected JRD.</p>'}`;
}

function printMetaText(data) {
  var parts = [
    monthLabel(data && data.month ? data.month : $("#monthSel").val()),
    selectedGroupLabel(),
  ];
  if (jrdFocus) {
    parts.push("JRD: " + jrdFocusLabel(jrdFocus));
  }
  parts.push(viewMode === "pivot" ? "Pivot Table (One Table)" : "By Group (Separated Tables)");
  return parts.join("  ·  ");
}

function renderCurrentView() {
  if (!reportData || !(reportData.groups || []).length) {
    return;
  }
  updateViewChrome();
  updateSummaryCards(focusedViewStats(reportData));
  $("#printMeta").text(printMetaText(reportData));
  var html =
    viewMode === "bygroup" ? renderByGroup(reportData) : renderPivot(reportData);
  $("#reportView").html(html);
}

function renderReport(data) {
  var groups = data.groups || [];
  var previousJrdIds = ((reportData && reportData.jrds) || []).map(function (jrd) {
    return String(jrd.id);
  }).join("|");
  reportData = data;
  var nextJrdIds = (data.jrds || []).map(function (jrd) {
    return String(jrd.id);
  }).join("|");
  if (previousJrdIds !== nextJrdIds) {
    customizeState = defaultCustomize(data.jrds || []);
  }
  expandedGroups = {};
  if (jrdFocus) {
    var stillThere = (data.jrds || []).some(function (jrd) {
      return String(jrd.id) === String(jrdFocus.id);
    });
    var checked = checkedGroupAbbrevs();
    var restrictGroups = checked.length > 0 && checked.length < allowedGroups.length;
    var groupOk =
      !restrictGroups || checked.indexOf(String(jrdFocus.group)) !== -1;
    if (!stillThere || !groupOk) {
      jrdFocus = null;
    }
  }
  syncJrdFocusInput();
  $("#viewToolbar").removeClass("d-none");
  $("#emptyState").addClass("d-none");
  if (groups.length === 0) {
    updateSummaryCards({
      totalHours: 0,
      activityCount: 0,
      contributorCount: 0,
      groupCount: 0,
    });
    $("#reportView").empty();
    $("#emptyState").text("No R&D hours for this month.").removeClass("d-none");
    $("#btnPrint, #btnExport").prop("disabled", true);
    return;
  }
  $("#btnPrint, #btnExport").prop("disabled", false);
  renderCurrentView();
}

function getTable() {
  var groups = selectedGroups();
  if (!$("#monthSel").val()) {
    return;
  }
  if (allowedGroups.length === 0 || groups.length === 0) {
    renderEmpty("No groups available.");
    return;
  }

  $.ajax({
    type: "POST",
    url: "php/get_rd_hours.php",
    data: {
      getGroups: groups,
      getYMSel: $("#monthSel").val(),
    },
    dataType: "json",
    success: function (response) {
      if (!response || !response.isSuccess) {
        renderEmpty("");
        alert((response && response.message) || "Could not load R&D hours.");
        return;
      }
      renderReport(response);
    },
    error: function (xhr) {
      renderEmpty("");
      alert(rdAjaxMessage(xhr, "Could not load R&D hours."));
    },
  });
}

function openCustomize() {
  if (viewMode !== "pivot" || !reportData) {
    return;
  }
  renderCustomizeList();
  $("#optShowTotalRow").prop("checked", customizeState.showTotalRow);
  $("#optShowGroupSubtotal").prop("checked", customizeState.showGroupSubtotal);
  $("#optCompactRows").prop("checked", customizeState.compactRows);
  $("#optWrapJrdTitles").prop("checked", customizeState.wrapJrdTitles);
  $("#customizeSearch").val("");
  filterCustomizeList("");
  $("#customizeOverlay").removeClass("d-none");
  $("#customizeDrawer").addClass("open").attr("aria-hidden", "false");
}

function closeCustomize() {
  $("#customizeOverlay").addClass("d-none");
  $("#customizeDrawer").removeClass("open").attr("aria-hidden", "true");
}

function renderCustomizeList() {
  var jrds = (reportData && reportData.jrds) || [];
  var byId = jrdByIdMap();
  var order =
    customizeState.jrdOrder && customizeState.jrdOrder.length
      ? customizeState.jrdOrder.slice()
      : jrds.map(function (jrd) {
          return String(jrd.id);
        });
  jrds.forEach(function (jrd) {
    if (order.indexOf(String(jrd.id)) === -1) {
      order.push(String(jrd.id));
    }
  });
  var visible = customizeState.visibleJrdIds || order;
  var html = "";
  order.forEach(function (id) {
    var jrd = byId[String(id)];
    if (!jrd) {
      return;
    }
    var checked = visible.indexOf(String(id)) !== -1 ? "checked" : "";
    var inputId =
      "jrdCol_" + String(jrd.id).replace(/[^A-Za-z0-9_-]/g, "_");
    html += `
      <div class="rd-jrd-col-item" draggable="true" data-jrd-id="${escapeHtml(jrd.id)}">
        <span class="rd-drag-handle" title="Reorder" aria-hidden="true">⠿</span>
        <input
          type="checkbox"
          class="rd-checkbox jrd-col-check"
          id="${escapeHtml(inputId)}"
          value="${escapeHtml(jrd.id)}"
          ${checked}
        />
        <label class="rd-jrd-option-label" for="${escapeHtml(inputId)}">
          <span class="rd-jrd-col-title">${escapeHtml(jrd.description || "")}</span>
          <span class="rd-jrd-col-group">${escapeHtml(jrd.groupName || jrd.group || "")}</span>
        </label>
      </div>`;
  });
  if (!html) {
    html = '<div class="rd-jrd-suggest-empty">No JRD columns for this period.</div>';
  }
  $("#jrdColumnList").html(html);
}

function filterCustomizeList(query) {
  var needle = String(query || "").trim().toLowerCase();
  $("#jrdColumnList .rd-jrd-col-item").each(function () {
    var text = $(this).text().toLowerCase();
    $(this).toggleClass("hidden-item", needle !== "" && text.indexOf(needle) === -1);
  });
}

function applyCustomize() {
  var order = [];
  var visible = [];
  $("#jrdColumnList .rd-jrd-col-item").each(function () {
    var id = String($(this).attr("data-jrd-id"));
    order.push(id);
    if ($(this).find(".jrd-col-check").prop("checked")) {
      visible.push(id);
    }
  });
  customizeState = {
    visibleJrdIds: visible,
    jrdOrder: order,
    showTotalRow: $("#optShowTotalRow").prop("checked"),
    showGroupSubtotal: $("#optShowGroupSubtotal").prop("checked"),
    compactRows: $("#optCompactRows").prop("checked"),
    wrapJrdTitles: $("#optWrapJrdTitles").prop("checked"),
  };
  closeCustomize();
  renderCurrentView();
}

function appendClonedRows(tbody, sourceTable) {
  if (!sourceTable) {
    return;
  }
  $(sourceTable)
    .find("tr")
    .each(function () {
      tbody.appendChild(this.cloneNode(true));
    });
}

function appendTitleRow(tbody, text) {
  var tr = document.createElement("tr");
  var th = document.createElement("th");
  th.setAttribute("colspan", "12");
  th.setAttribute("data-f-name", "Arial");
  th.setAttribute("data-f-sz", "9");
  th.setAttribute("data-f-bold", "true");
  th.setAttribute("data-a-h", "left");
  th.textContent = text;
  tr.appendChild(th);
  tbody.appendChild(tr);
}

function buildExportTable() {
  var holder = document.getElementById("rdExportTable");
  if (!holder) {
    return null;
  }
  holder.innerHTML = "";
  var tbody = document.createElement("tbody");
  appendTitleRow(tbody, "R&D Manhour Report");
  appendTitleRow(tbody, printMetaText(reportData));
  tbody.appendChild(document.createElement("tr"));

  if (viewMode === "pivot") {
    appendClonedRows(tbody, document.getElementById("mainTable"));
  } else {
    appendTitleRow(tbody, "All Groups Summary");
    appendClonedRows(tbody, document.getElementById("summaryTable"));
    tbody.appendChild(document.createElement("tr"));
    groupsForCurrentView(reportData).forEach(function (group) {
      appendTitleRow(tbody, groupTitle(group));
      appendClonedRows(tbody, document.getElementById(groupTableId(group)));
      tbody.appendChild(document.createElement("tr"));
    });
  }

  holder.appendChild(tbody);
  holder.className = "d-none";
  return holder;
}

$(document).on("click", "#btnPrint", function () {
  if (!reportData || !(reportData.groups || []).length) {
    return;
  }
  $("#printMeta").text(printMetaText(reportData));
  $(".xPrint").toggle();
  $(".lower").toggleClass("lower lower_");
  print();
  $(".lower_").toggleClass("lower lower_");
  $(".xPrint").toggle();
});

$(document).on("click", "#btnExport", function () {
  if (!reportData || !(reportData.groups || []).length) {
    return;
  }
  var exportEl = buildExportTable();
  if (!exportEl) {
    return;
  }
  var groupLabel = selectedGroupLabel().replace(/\s+/g, "");
  var viewLabel = viewMode === "pivot" ? "Pivot" : "ByGroup";
  var xlsName = `${$("#monthSel").val()}_${groupLabel} ${viewLabel} R&D Manhour Report.xlsx`;
  TableToExcel.convert(exportEl, {
    name: xlsName,
    sheet: {
      name: (viewLabel + " " + (groupLabel || "RD")).substring(0, 31),
    },
  });
});
