//#region ROW BUILDERS
function buildSubmittedRequestRow(request) {
  return `
    <tr
      class="my-request-row submitted-request-row cursor-pointer"
      data-source-table="submitted"
      data-request-id="${escapeHtml(request.requestId)}"
      data-target-employee="${escapeHtml(request.targetEmployeeName || "")}"
      data-target-empid="${escapeHtml(request.targetEmployeeId || "")}"
      data-requested-on="${escapeHtml(request.requestedOn || "")}"
      data-requested-month="${escapeHtml(request.requestedMonthLabel || "")}"
      data-month-value="${escapeHtml(request.requestedMonth || "")}"
      data-status="${escapeHtml(request.status || "")}"
      data-status-label="${escapeHtml(request.statusLabel || "")}"
      data-action-taken-on="${escapeHtml(request.actionTakenOn || "")}"
      data-action-taken-by="${escapeHtml(request.actionTakenBy || "")}"
      data-valid-until="${escapeHtml(request.validUntil || "")}"
      data-requested-by="${escapeHtml(request.requestedByName || "")}"
    >
      <td class="border-b border-slate-200 px-4 py-5 text-slate-700 font-medium">
        ${escapeHtml(request.requestId)}
      </td>
      <td class="border-b border-slate-200 px-4 py-5">
        <div class="font-medium text-slate-800">${escapeHtml(request.targetEmployeeName || "—")}</div>
        <div class="text-xs text-slate-400">EMP-${escapeHtml(request.targetEmployeeId || "—")}</div>
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
        ${escapeHtml(request.requestedOn || "—")}
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
        ${escapeHtml(request.requestedMonthLabel || "—")}
      </td>
      <td class="border-b border-slate-200 px-4 py-5">
        <span class="status ${escapeHtml(request.status || "")}">${escapeHtml(request.statusLabel || "—")}</span>
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-400">
        ${request.validUntil ? escapeHtml(request.validUntil) : "—"}
      </td>
    </tr>
  `;
}

function buildForMeRequestRow(request) {
  return `
    <tr
      class="my-request-row for-me-request-row cursor-pointer"
      data-source-table="for-me"
      data-request-id="${escapeHtml(request.requestId)}"
      data-target-employee="${escapeHtml(request.targetEmployeeName || "")}"
      data-target-empid="${escapeHtml(request.targetEmployeeId || "")}"
      data-requested-on="${escapeHtml(request.requestedOn || "")}"
      data-requested-month="${escapeHtml(request.requestedMonthLabel || "")}"
      data-month-value="${escapeHtml(request.requestedMonth || "")}"
      data-status="${escapeHtml(request.status || "")}"
      data-status-label="${escapeHtml(request.statusLabel || "")}"
      data-action-taken-on="${escapeHtml(request.actionTakenOn || "")}"
      data-action-taken-by="${escapeHtml(request.actionTakenBy || "")}"
      data-valid-until="${escapeHtml(request.validUntil || "")}"
      data-requested-by="${escapeHtml(request.requestedByName || "")}"
    >
      <td class="border-b border-slate-200 px-4 py-5 text-slate-700 font-medium">
        ${escapeHtml(request.requestId)}
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
        ${escapeHtml(request.targetEmployeeName || "—")}
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
        ${escapeHtml(request.requestedOn || "—")}
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
        ${escapeHtml(request.requestedMonthLabel || "—")}
      </td>
      <td class="border-b border-slate-200 px-4 py-5">
        <span class="status ${escapeHtml(request.status || "")}">${escapeHtml(request.statusLabel || "—")}</span>
      </td>
      <td class="border-b border-slate-200 px-4 py-5 text-slate-400">
        ${request.validUntil ? escapeHtml(request.validUntil) : "—"}
      </td>
    </tr>
  `;
}
//#endregion

//#region DATA HELPERS
function getAllUniqueRequests() {
  const map = new Map();

  [...RequestPageState.data.submittedRequests, ...RequestPageState.data.requestsForMe].forEach(
    function (request) {
      const requestId = String(request.requestId || "");
      if (!requestId) return;
      map.set(requestId, request);
    },
  );

  return Array.from(map.values());
}
//#endregion

//#region FILTERED DATA
function getFilteredSubmittedRequests() {
  const searchValue = ($(".my-request-search").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const monthValue = ($("#requestMonthSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const statusValue = ($("#requestStatusSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  return RequestPageState.data.submittedRequests.filter(function (request) {
    const rowText = [
      request.requestId,
      request.targetEmployeeName,
      request.targetEmployeeId,
      request.requestedOn,
      request.requestedMonthLabel,
      request.status,
      request.validUntil,
      request.requestedByName,
    ]
      .join(" ")
      .toLowerCase();

    const rowMonth = (request.requestedMonth || "").toLowerCase().trim();
    const rowStatus = (request.status || "").toLowerCase().trim();

    const searchMatch = !searchValue || rowText.includes(searchValue);
    const monthMatch = !monthValue || rowMonth === monthValue;
    const statusMatch = !statusValue || rowStatus === statusValue;

    return searchMatch && monthMatch && statusMatch;
  });
}

function getFilteredRequestsForMe() {
  const searchValue = ($(".my-request-for-me-search").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const monthValue = ($("#requestForMeMonthSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const statusValue = ($("#requestForMeStatusSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  return RequestPageState.data.requestsForMe.filter(function (request) {
    const rowText = [
      request.requestId,
      request.targetEmployeeName,
      request.targetEmployeeId,
      request.requestedOn,
      request.requestedMonthLabel,
      request.status,
      request.validUntil,
      request.requestedByName,
    ]
      .join(" ")
      .toLowerCase();

    const rowMonth = (request.requestedMonth || "").toLowerCase().trim();
    const rowStatus = (request.status || "").toLowerCase().trim();

    const searchMatch = !searchValue || rowText.includes(searchValue);
    const monthMatch = !monthValue || rowMonth === monthValue;
    const statusMatch = !statusValue || rowStatus === statusValue;

    return searchMatch && monthMatch && statusMatch;
  });
}
//#endregion

//#region SUMMARY / ACTIVE PANEL
function renderSummaryCards() {
  const requests = getAllUniqueRequests();

  let pending = 0;
  let approved = 0;
  let denied = 0;
  let expiringToday = 0;

  requests.forEach(function (request) {
    const status = ((request.status || "") + "").toLowerCase();

    if (status === "pending") pending++;
    if (status === "approved") approved++;
    if (status === "denied") denied++;
    if (status === "expiring_today") expiringToday++;
  });

  $("#cardPending").text(pending);
  $("#cardApproved").text(approved);
  $("#cardDenied").text(denied);
  $("#cardActive").text(expiringToday);
}

function renderActivePanel() {
  const $panel = $("#activeAccessPanel");
  const $body = $("#activeAccessBody");

  if (!$panel.length || !$body.length) return;

const activeRequests = getAllUniqueRequests().filter(function (request) {
  const status = ((request.status || "") + "").toLowerCase();
  return status === "approved" || status === "expiring_today";
});

  $body.empty();

  if (!activeRequests.length) {
    $panel.addClass("hidden");
    return;
  }

  $panel.removeClass("hidden");

  activeRequests.forEach(function (request) {
    $body.append(`
      <tr>
        <td class="px-4 py-3 border-b border-slate-200">
          <div class="font-medium text-slate-800">${escapeHtml(request.targetEmployeeName || "—")}</div>
          ${
            request.requestedByName
              ? `<div class="text-xs text-slate-400">Requested by ${escapeHtml(request.requestedByName)}</div>`
              : ""
          }
        </td>
        <td class="px-4 py-3 border-b border-slate-200 text-slate-600">
          ${escapeHtml(request.requestedMonthLabel || "—")}
        </td>
        <td class="px-4 py-3 border-b border-slate-200 text-slate-600">
          ${escapeHtml(request.validUntil || "—")}
        </td>
      </tr>
    `);
  });
}
//#endregion

//#region PAGINATION META
function renderSubmittedPaginationMeta(totalRows, totalPages, currentPage, rowsPerPage) {
  const shouldShowPagination = totalRows > rowsPerPage;

  if (totalRows === 0) {
    $("#myRequestPaginationWrap").addClass("hidden").removeClass("flex");
    $("#myRequestPaginationStart").text(0);
    $("#myRequestPaginationEnd").text(0);
    $("#myRequestPaginationTotal").text(0);
    $("#myRequestPageIndicator").text("Page 1");
    $("#myRequestPrevPage").prop("disabled", true);
    $("#myRequestNextPage").prop("disabled", true);
    return;
  }

  if (!shouldShowPagination) {
    $("#myRequestPaginationWrap").addClass("hidden").removeClass("flex");
    $("#myRequestPaginationStart").text(1);
    $("#myRequestPaginationEnd").text(totalRows);
    $("#myRequestPaginationTotal").text(totalRows);
    $("#myRequestPageIndicator").text("Page 1");
    $("#myRequestPrevPage").prop("disabled", true);
    $("#myRequestNextPage").prop("disabled", true);
    return;
  }

  const visibleStart = (currentPage - 1) * rowsPerPage + 1;
  const visibleEnd = Math.min(currentPage * rowsPerPage, totalRows);

  $("#myRequestPaginationWrap").removeClass("hidden").addClass("flex");
  $("#myRequestPaginationStart").text(visibleStart);
  $("#myRequestPaginationEnd").text(visibleEnd);
  $("#myRequestPaginationTotal").text(totalRows);
  $("#myRequestPageIndicator").text(`Page ${currentPage} of ${totalPages}`);
  $("#myRequestPrevPage").prop("disabled", currentPage === 1);
  $("#myRequestNextPage").prop("disabled", currentPage === totalPages);
}

function renderForMePaginationMeta(totalRows, totalPages, currentPage, rowsPerPage) {
  const shouldShowPagination = totalRows > rowsPerPage;

  if (totalRows === 0) {
    $("#myRequestForMePaginationWrap").addClass("hidden").removeClass("flex");
    $("#myRequestForMePaginationStart").text(0);
    $("#myRequestForMePaginationEnd").text(0);
    $("#myRequestForMePaginationTotal").text(0);
    $("#myRequestForMePageIndicator").text("Page 1");
    $("#myRequestForMePrevPage").prop("disabled", true);
    $("#myRequestForMeNextPage").prop("disabled", true);
    return;
  }

  if (!shouldShowPagination) {
    $("#myRequestForMePaginationWrap").addClass("hidden").removeClass("flex");
    $("#myRequestForMePaginationStart").text(1);
    $("#myRequestForMePaginationEnd").text(totalRows);
    $("#myRequestForMePaginationTotal").text(totalRows);
    $("#myRequestForMePageIndicator").text("Page 1");
    $("#myRequestForMePrevPage").prop("disabled", true);
    $("#myRequestForMeNextPage").prop("disabled", true);
    return;
  }

  const visibleStart = (currentPage - 1) * rowsPerPage + 1;
  const visibleEnd = Math.min(currentPage * rowsPerPage, totalRows);

  $("#myRequestForMePaginationWrap").removeClass("hidden").addClass("flex");
  $("#myRequestForMePaginationStart").text(visibleStart);
  $("#myRequestForMePaginationEnd").text(visibleEnd);
  $("#myRequestForMePaginationTotal").text(totalRows);
  $("#myRequestForMePageIndicator").text(`Page ${currentPage} of ${totalPages}`);
  $("#myRequestForMePrevPage").prop("disabled", currentPage === 1);
  $("#myRequestForMeNextPage").prop("disabled", currentPage === totalPages);
}
//#endregion

//#region TABLE RENDER
function renderSubmittedTable() {
  const $tbody = $("#myRequestTableBody");
  if (!$tbody.length) return;

  const rowsPerPage = RequestPageState.pagination.submitted.rowsPerPage;
  const filtered = getFilteredSubmittedRequests();

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  if (RequestPageState.pagination.submitted.currentPage > totalPages) {
    RequestPageState.pagination.submitted.currentPage = totalPages;
  }

  const currentPage = RequestPageState.pagination.submitted.currentPage;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pagedRows = filtered.slice(startIndex, startIndex + rowsPerPage);

  $tbody.empty();

  if (!pagedRows.length) {
    toggleEmptyState("#myRequestTableBody", true, 6);
  } else {
    pagedRows.forEach(function (request) {
      $tbody.append(buildSubmittedRequestRow(request));
    });
  }

  renderSubmittedPaginationMeta(totalRows, totalPages, currentPage, rowsPerPage);
}

function renderForMeTable() {
  const $tbody = $("#myRequestForMeTableBody");
  if (!$tbody.length) return;

  const rowsPerPage = RequestPageState.pagination.forMe.rowsPerPage;
  const filtered = getFilteredRequestsForMe();

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  if (RequestPageState.pagination.forMe.currentPage > totalPages) {
    RequestPageState.pagination.forMe.currentPage = totalPages;
  }

  const currentPage = RequestPageState.pagination.forMe.currentPage;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pagedRows = filtered.slice(startIndex, startIndex + rowsPerPage);

  $tbody.empty();

  if (!pagedRows.length) {
    toggleEmptyState("#myRequestForMeTableBody", true, 6);
  } else {
    pagedRows.forEach(function (request) {
      $tbody.append(buildForMeRequestRow(request));
    });
  }

  renderForMePaginationMeta(totalRows, totalPages, currentPage, rowsPerPage);
}
//#endregion

//#region MODAL RENDER
function renderRequestDetailsModal($row) {
  const empDetails = RequestPageState.auth.empDetails;
  const status = (($row.data("status") || "") + "").toLowerCase();
  const statusLabel = $row.data("status-label") || "—";
  const validUntil = $row.data("valid-until") || "—";
  const targetEmployee = $row.data("target-employee") || "—";
  const targetEmpId = $row.data("target-empid") || "—";
  const requestedBy = $row.data("requested-by") || getEmployeeFullName(empDetails);

  $("#requestDetailsId").text($row.data("request-id") || "—");

  if ($("#requestDetailsTargetEmployee").length) {
    $("#requestDetailsTargetEmployee").text(
      `${targetEmployee} (EMP-${targetEmpId})`,
    );
  }

  if ($("#requestDetailsTargetEmployeeBody").length) {
    $("#requestDetailsTargetEmployeeBody").text(
      `${targetEmployee} (EMP-${targetEmpId})`,
    );
  }

  if ($("#requestDetailsRequestedBy").length) {
    $("#requestDetailsRequestedBy").text(requestedBy);
  }

  $("#requestDetailsRequestedOn").text($row.data("requested-on") || "—");
  $("#requestDetailsRequestedMonth").text($row.data("requested-month") || "—");
  $("#requestDetailsStatus").text(statusLabel);
  $("#requestDetailsActionTakenOn").text($row.data("action-taken-on") || "—");
  $("#requestDetailsActionTakenBy").text($row.data("action-taken-by") || "—");
  $("#requestDetailsValidUntil").text(validUntil || "—");

  const $chip = $("#requestDetailsChip");
  $chip
    .removeClass(
      "modal-chip-success modal-chip-danger modal-chip-neutral modal-chip-pending modal-chip-warning",
    )
    .text(statusLabel);

if (status === "approved" || status === "expiring_today") {
  $chip.addClass("modal-chip-success");
} else if (status === "pending") {
    $chip.addClass("modal-chip-pending");
  } else if (status === "denied" || status === "expired") {
    $chip.addClass("modal-chip-danger");
  } else {
    $chip.addClass("modal-chip-neutral");
  }

  const $validityWrap = $("#requestValidityWrap");
  $validityWrap.removeClass(
    "request-validity-active request-validity-expired request-validity-expiring",
  );

  if (status === "denied" || status === "pending") {
    $validityWrap.hide();
    $("#requestDetailsValidUntil").text("—");
  } else {
    $validityWrap.css("display", "flex");

if (status === "expired") {
  $validityWrap.addClass("request-validity-expired");
} else if (status === "approved" || status === "expiring_today") {
  $validityWrap.addClass("request-validity-active");
}
  }

  $("#requestDetailsModal").removeClass("hidden").addClass("flex");
}
//#endregion