// TEMPORARY MOCK DATA FOR DAILY REPORT HISTORY UI TESTING
// Set USE_MOCK_DAILY_REPORT_HISTORY to false (or delete this mock block)
// to restore live API history from get_history.php.
const USE_MOCK_DAILY_REPORT_HISTORY = true;

const mockDailyReportHistory = [
  {
    id: 1,
    occurredAt: "2026-09-10 10:34:00",
    timestamp: "Sep 10, 2026, 10:34 AM",
    actorName: "Maria Santos",
    actorRole: "Supervisor",
    actorInitials: "MS",
    action: "updated",
    actionLabel: "Updated Artemio Roel Becina's daily report",
    reportDate: "Sep 05, 2026",
    reportDateRaw: "2026-09-05",
    isOverride: true,
    overrideReason:
      "Employee is currently on leave. Supervisor corrected the previously entered hours and manhour type.",
    changes: [
      { field: "No. of Hours", previousValue: "08:00", newValue: "04:00" },
      { field: "Manhour Type", previousValue: "Regular", newValue: "Leave" },
      {
        field: "Remarks",
        previousValue: "Site inspection and coordination",
        newValue: "On leave - corrected by supervisor",
      },
    ],
  },
  {
    id: 2,
    occurredAt: "2026-09-09 15:18:00",
    timestamp: "Sep 09, 2026, 3:18 PM",
    actorName: "Artemio Roel Becina",
    actorRole: "Employee",
    actorInitials: "AR",
    action: "updated",
    actionLabel: "Updated daily report",
    reportDate: "Sep 09, 2026",
    reportDateRaw: "2026-09-09",
    isOverride: false,
    overrideReason: "",
    changes: [
      { field: "No. of Hours", previousValue: "07:30", newValue: "08:00" },
      {
        field: "Remarks",
        previousValue: "Updated drawing",
        newValue: "Updated drawing and submitted revision",
      },
    ],
  },
  {
    id: 3,
    occurredAt: "2026-09-09 08:12:00",
    timestamp: "Sep 09, 2026, 8:12 AM",
    actorName: "Artemio Roel Becina",
    actorRole: "Employee",
    actorInitials: "AR",
    action: "created",
    actionLabel: "Created daily report",
    reportDate: "Sep 09, 2026",
    reportDateRaw: "2026-09-09",
    isOverride: false,
    overrideReason: "",
    initialValues: [
      { field: "Project", value: "Project Alpha" },
      { field: "Item of Works", value: "Design Review" },
      { field: "Job Request Description", value: "Review structural drawing" },
      { field: "No. of Hours", value: "07:30" },
      { field: "Manhour Type", value: "Regular" },
      { field: "Remarks", value: "Updated drawing" },
    ],
  },
  {
    id: 4,
    occurredAt: "2026-09-08 16:42:00",
    timestamp: "Sep 08, 2026, 4:42 PM",
    actorName: "Juan Dela Cruz",
    actorRole: "Supervisor",
    actorInitials: "JD",
    action: "updated",
    actionLabel: "Updated Artemio Roel Becina's daily report",
    reportDate: "Aug 28, 2026",
    reportDateRaw: "2026-08-28",
    isOverride: true,
    overrideReason:
      "Previous month is locked. Supervisor corrected the employee's advanced Daily Report entry.",
    changes: [
      { field: "Project", previousValue: "Project Alpha", newValue: "Project Beta" },
      { field: "No. of Hours", previousValue: "08:00", newValue: "06:00" },
      {
        field: "Remarks",
        previousValue: "Site work",
        newValue: "Corrected project assignment",
      },
    ],
  },
  {
    id: 5,
    occurredAt: "2026-09-05 13:26:00",
    timestamp: "Sep 05, 2026, 1:26 PM",
    actorName: "Artemio Roel Becina",
    actorRole: "Employee",
    actorInitials: "AR",
    action: "updated",
    actionLabel: "Updated daily report",
    reportDate: "Sep 05, 2026",
    reportDateRaw: "2026-09-05",
    isOverride: false,
    overrideReason: "",
    changes: [
      {
        field: "Remarks",
        previousValue: "Coordination meeting",
        newValue:
          "Coordination meeting with client and engineering team to review outstanding drawing comments and confirm the next site inspection schedule.",
      },
    ],
  },
  {
    id: 6,
    occurredAt: "2026-09-05 08:05:00",
    timestamp: "Sep 05, 2026, 8:05 AM",
    actorName: "Artemio Roel Becina",
    actorRole: "Employee",
    actorInitials: "AR",
    action: "created",
    actionLabel: "Created daily report",
    reportDate: "Sep 05, 2026",
    reportDateRaw: "2026-09-05",
    isOverride: false,
    overrideReason: "",
    initialValues: [
      { field: "Project", value: "Project Alpha" },
      { field: "Item of Works", value: "Coordination" },
      { field: "No. of Hours", value: "08:00" },
      { field: "Manhour Type", value: "Regular" },
      { field: "Remarks", value: "Coordination meeting" },
    ],
  },
  {
    id: 7,
    occurredAt: "2026-09-02 11:20:00",
    timestamp: "Sep 02, 2026, 11:20 AM",
    actorName: "Artemio Roel Becina",
    actorRole: "Employee",
    actorInitials: "AR",
    action: "updated",
    actionLabel: "Updated daily report",
    reportDate: "Sep 02, 2026",
    reportDateRaw: "2026-09-02",
    isOverride: false,
    overrideReason: "",
    changes: [
      {
        field: "Job Request Description",
        previousValue: "Site inspection",
        newValue: "Site inspection and documentation",
      },
      { field: "No. of Hours", previousValue: "06:00", newValue: "07:00" },
    ],
  },
  {
    id: 8,
    occurredAt: "2026-09-01 09:15:00",
    timestamp: "Sep 01, 2026, 9:15 AM",
    actorName: "Artemio Roel Becina",
    actorRole: "Employee",
    actorInitials: "AR",
    action: "created",
    actionLabel: "Created daily report",
    reportDate: "Sep 01, 2026",
    reportDateRaw: "2026-09-01",
    isOverride: false,
    overrideReason: "",
    initialValues: [
      { field: "Project", value: "Project Alpha" },
      { field: "Item of Works", value: "Site Inspection" },
      { field: "Job Request Description", value: "Site inspection" },
      { field: "No. of Hours", value: "08:00" },
      { field: "Manhour Type", value: "Regular" },
      { field: "Remarks", value: "Initial site inspection" },
    ],
  },
];

function bindHistoryEvents() {
  $(document).off(".drhistory");

  $(document).on("click.drhistory", "#btnDailyReportHistory", function () {
    openDailyReportHistory();
  });

  $(document).on("click.drhistory", "#drHistoryClose", function () {
    closeDailyReportHistory();
  });

  $(document).on("click.drhistory", "#drHistoryModal", function (event) {
    if (event.target === this) {
      closeDailyReportHistory();
    }
  });

  $(document).on("keydown.drhistory", function (event) {
    if (event.key === "Escape" && $("#drHistoryModal").hasClass("is-open")) {
      closeDailyReportHistory();
    }
  });

  $(document).on("click.drhistory", "#drHistorySearch", function () {
    loadDailyReportHistory();
  });

  $(document).on("click.drhistory", "#drHistoryReset", function () {
    resetDailyReportHistoryFilters();
    loadDailyReportHistory();
  });

  $(document).on("change.drhistory", "#drHistorySort", function () {
    loadDailyReportHistory();
  });

  $(document).on("click.drhistory", "#drHistoryRetry", function () {
    loadDailyReportHistory();
  });

  $(document).on("click.drhistory", ".dr-history-item-toggle", function () {
    const item = $(this).closest(".dr-history-item");
    const expanded = item.hasClass("is-expanded");

    item.toggleClass("is-expanded", !expanded);
    $(this).attr("aria-expanded", expanded ? "false" : "true");
  });
}

function getHistoryEmployee() {
  const firstName = AppState.empDetails?.empFName || "";
  const lastName = AppState.empDetails?.empSName || "";
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    empNum: AppState.empDetails?.empNum || "",
    name: name || "Employee",
  };
}

function getMonthDateBounds(dateString) {
  const source = dateString || getTodayLocalDateString();
  const parts = source.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!year || !month) {
    const today = getTodayLocalDateString();
    return { from: today, to: today };
  }

  const lastDay = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, "0");

  return {
    from: `${year}-${monthStr}-01`,
    to: `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`,
  };
}

function getHistoryDefaultFilters() {
  const bounds = getMonthDateBounds(getTodayLocalDateString());

  return {
    dateFrom: bounds.from,
    dateTo: bounds.to,
    sort: "newest",
  };
}

function resetDailyReportHistoryFilters() {
  const defaults = getHistoryDefaultFilters();

  $("#drHistoryDateFrom").val(defaults.dateFrom);
  $("#drHistoryDateTo").val(defaults.dateTo);
  $("#drHistorySort").val(defaults.sort);
}

function areHistoryFiltersActive() {
  const defaults = getHistoryDefaultFilters();

  return (
    $("#drHistoryDateFrom").val() !== defaults.dateFrom ||
    $("#drHistoryDateTo").val() !== defaults.dateTo
  );
}

function openDailyReportHistory() {
  const employee = getHistoryEmployee();

  $("#drHistoryEmployeeName").text(employee.name);
  resetDailyReportHistoryFilters();
  $("#drHistoryModal").addClass("is-open").attr("aria-hidden", "false");
  loadDailyReportHistory();
}

function closeDailyReportHistory() {
  $("#drHistoryModal").removeClass("is-open").attr("aria-hidden", "true");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAvatarColor(seed) {
  const colors = [
    "#2563eb",
    "#db2777",
    "#059669",
    "#d97706",
    "#7c3aed",
    "#0891b2",
  ];
  const text = String(seed || "");
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

function renderHistoryIcon(size) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
      <path d="M12 7v5l4 2"></path>
    </svg>
  `;
}

function renderHistoryLoading() {
  $("#drHistoryCount").text("Loading history...");
  $("#drHistoryList").html(`
    <div class="dr-history-status">
      <div class="dr-history-spinner" aria-hidden="true"></div>
      <p>Loading history...</p>
    </div>
  `);
}

function renderHistoryError(message) {
  $("#drHistoryCount").text("Unable to load history");
  $("#drHistoryList").html(`
    <div class="dr-history-status dr-history-error">
      ${renderHistoryIcon(36)}
      <h4>Unable to load history</h4>
      <p>${escapeHtml(message || "Failed to load daily report history.")}</p>
      <button type="button" id="drHistoryRetry" class="dr-history-retry-btn">Retry</button>
    </div>
  `);
}

function renderHistoryEmpty() {
  const filtered = areHistoryFiltersActive();

  if (filtered) {
    $("#drHistoryList").html(`
      <div class="dr-history-status">
        ${renderHistoryIcon(40)}
        <h4>No matching history found</h4>
        <p>Try adjusting or clearing your filters.</p>
      </div>
    `);
    return;
  }

  $("#drHistoryList").html(`
    <div class="dr-history-status">
      ${renderHistoryIcon(40)}
      <h4>No history found</h4>
      <p>No changes have been recorded for this Daily Report yet.</p>
    </div>
  `);
}

function formatHistoryActionTitle(record) {
  const action = String(record.action || "").toLowerCase();

  if (action === "created") {
    return "Created daily report";
  }

  if (action === "updated") {
    return "Updated daily report";
  }

  if (action === "deleted") {
    return "Deleted daily report";
  }

  return String(record.actionLabel || "Daily report change").replace(
    /\s+[A-Za-z0-9 .'-]+'s daily report$/i,
    " daily report",
  );
}

function formatHistoryEventTime(timestamp) {
  return String(timestamp || "")
    .trim()
    .replace(/,\s*(\d{1,2}:\d{2}\s*[AP]M)$/i, " · $1");
}

function renderHistoryReason(record) {
  if (!record.isOverride || !record.overrideReason) {
    return "";
  }

  return `
      <div class="dr-history-reason">
        <p class="dr-history-reason-label">Reason for override</p>
        <p>${escapeHtml(record.overrideReason)}</p>
      </div>
    `;
}

function renderHistoryTable(headers, rowsHtml) {
  if (!rowsHtml) {
    return `<p class="dr-history-no-changes">No field-level changes were recorded for this event.</p>`;
  }

  const headerCells = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  return `
      <div class="dr-history-table-wrap">
        <table class="dr-history-table">
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
}

function renderHistorySection(title, content) {
  return `
      <div class="dr-history-section">
        <p class="dr-history-section-label">${escapeHtml(title)}</p>
        ${content}
      </div>
    `;
}

function renderHistoryChanges(record) {
  const reason = renderHistoryReason(record);

  if (record.action === "created") {
    const initialValues =
      record.initialValues && record.initialValues.length
        ? record.initialValues
        : (record.changes || []).map((change) => ({
            field: change.field,
            value: change.newValue,
          }));
    const rows = initialValues
      .map(
        (item) => `
        <tr>
          <td>${escapeHtml(item.field)}</td>
          <td>${escapeHtml(item.value)}</td>
        </tr>
      `,
      )
      .join("");

    return `${reason}${renderHistorySection(
      "Initial entry",
      renderHistoryTable(["Field", "Value"], rows),
    )}`;
  }

  const changes = record.changes || [];
  const rows = changes
    .map(
      (change) => `
        <tr>
          <td>${escapeHtml(change.field)}</td>
          <td>${escapeHtml(change.previousValue)}</td>
          <td>${escapeHtml(change.newValue)}</td>
        </tr>
      `,
    )
    .join("");

  return `${reason}${renderHistorySection(
    "Changes",
    renderHistoryTable(["Field", "Previous Value", "New Value"], rows),
  )}`;
}

function renderHistoryItem(record, index) {
  const expanded = index === 0;
  const badge = record.isOverride
    ? `<span class="dr-history-badge">Override</span>`
    : "";
  const actorLine = [record.actorName, record.actorRole]
    .filter(Boolean)
    .map((part) => escapeHtml(part))
    .join(" · ");
  const avatarColor = getAvatarColor(record.actorName || record.actorInitials);

  return `
    <article class="dr-history-item${expanded ? " is-expanded" : ""}">
      <div class="dr-history-node" aria-hidden="true"></div>
      <div class="dr-history-card">
        <button
          type="button"
          class="dr-history-item-toggle"
          aria-expanded="${expanded ? "true" : "false"}"
        >
          <span class="dr-history-avatar" style="background:${avatarColor}">
            ${escapeHtml(record.actorInitials || "DR")}
          </span>
          <span class="dr-history-item-main">
            <span class="dr-history-item-top">
              <span class="dr-history-action-row">
                <span class="dr-history-action">${escapeHtml(formatHistoryActionTitle(record))}</span>
                ${badge}
              </span>
              <span class="dr-history-event-time">${escapeHtml(formatHistoryEventTime(record.timestamp))}</span>
            </span>
            <span class="dr-history-actor-line">${actorLine}</span>
            <span class="dr-history-report-date">Report date: ${escapeHtml(record.reportDate)}</span>
          </span>
          <span class="dr-history-chevron" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </span>
        </button>
        <div class="dr-history-item-body">
          ${renderHistoryChanges(record)}
        </div>
      </div>
    </article>
  `;
}

function renderHistoryList(data) {
  const records = data.records || [];
  const total = Number(data.total || records.length || 0);

  $("#drHistoryCount").text(`${total} record(s) found`);

  if (!records.length) {
    renderHistoryEmpty();
    return;
  }

  const html = records
    .map((record, index) => renderHistoryItem(record, index))
    .join("");

  $("#drHistoryList").html(`<div class="dr-history-timeline">${html}</div>`);
}

function getFilteredMockDailyReportHistory() {
  const dateFrom = $("#drHistoryDateFrom").val() || "";
  const dateTo = $("#drHistoryDateTo").val() || "";
  const sort = ($("#drHistorySort").val() || "newest").toLowerCase();

  const records = mockDailyReportHistory
    .filter((record) => {
      const eventDate = String(record.occurredAt || "").slice(0, 10);

      if (dateFrom && eventDate < dateFrom) {
        return false;
      }

      if (dateTo && eventDate > dateTo) {
        return false;
      }

      return true;
    })
    .slice()
    .sort((left, right) => {
      const comparison = String(left.occurredAt).localeCompare(
        String(right.occurredAt),
      );
      return sort === "oldest" ? comparison : -comparison;
    });

  return {
    records,
    total: records.length,
  };
}

function loadDailyReportHistory() {
  const employee = getHistoryEmployee();

  if (!employee.empNum) {
    renderHistoryError("Employee information is not available.");
    return;
  }

  $("#drHistoryEmployeeName").text(employee.name);

  if (USE_MOCK_DAILY_REPORT_HISTORY) {
    renderHistoryList(getFilteredMockDailyReportHistory());
    return;
  }

  renderHistoryLoading();

  postJson(
    "api/get_history.php",
    {
      empNum: employee.empNum,
      dateFrom: $("#drHistoryDateFrom").val() || "",
      dateTo: $("#drHistoryDateTo").val() || "",
      sort: $("#drHistorySort").val() || "newest",
    },
    "Failed to load daily report history.",
  )
    .then((response) => {
      const data = response.data || {};
      renderHistoryList(data);
    })
    .catch((error) => {
      console.error(error);
      renderHistoryError(error);
    });
}
