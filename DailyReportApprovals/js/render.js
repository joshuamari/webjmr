//#region PAGE RENDER
function renderPage() {
  renderHelloUser();
  renderSummaryCards();
  renderGroupFilters();
  renderPendingTable();
  renderActionedTable();
  renderActionedPagination();
}
//#endregion

//#region HEADER / NAV RENDER
function renderHelloUser() {
  $(".hello-user").text(DRApprovalsState.auth.empDetails.empFName || "User");
}
//#endregion

//#region SUMMARY RENDER
function renderSummaryCards() {
  $("#summaryPendingCount").text(DRApprovalsState.summary.pendingCount);
  $("#summaryApprovedToday").text(DRApprovalsState.summary.approvedToday);
  $("#summaryDeniedToday").text(DRApprovalsState.summary.deniedToday);
  $("#summaryExpiringToday").text(DRApprovalsState.summary.expiringToday);
}
//#endregion

//#region TABLE RENDER
function renderPendingTable() {
  const requests = getFilteredPendingRequests();
  const $tbody = $("#pendingApprovalTableBody");

  if (!requests.length) {
    $tbody.html(renderEmptyRow(4, "No requests found."));
    return;
  }

  const html = requests
    .map(function (request) {
      return `
        <tr
          class="bg-white pending-row cursor-pointer"
          data-request-id="${escapeHtml(request.requestId)}"
        >
          <td class="border-b border-slate-200 px-4 py-5 align-top">
            <div class="font-medium text-slate-800">${escapeHtml(request.employeeName)}</div>
            <div class="text-xs text-slate-400">EMP-${escapeHtml(request.employeeId)}</div>
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
            ${escapeHtml(request.requestedOn)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
            ${escapeHtml(request.requestedMonthLabel)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5">
            <span class="status pending">Pending</span>
          </td>
        </tr>
      `;
    })
    .join("");

  $tbody.html(html);
}

function renderActionedTable() {
  const requests = getPaginatedActionedRequests();
  const $tbody = $("#actionedApprovalTableBody");

  if (!requests.length) {
    $tbody.html(renderEmptyRow(4, "No requests found."));
    return;
  }

  const html = requests
    .map(function (request) {
      return `
        <tr
          class="bg-white actioned-row cursor-pointer"
          data-request-id="${escapeHtml(request.requestId)}"
        >
          <td class="border-b border-slate-200 px-4 py-5 align-top">
            <div class="font-medium text-slate-800">${escapeHtml(request.employeeName)}</div>
            <div class="text-xs text-slate-400">EMP-${escapeHtml(request.employeeId)}</div>
          </td>
          <td class="border-b border-slate-200 px-4 py-5">
            <span>${escapeHtml(request.requestedOn)}</span>
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
            ${escapeHtml(request.requestedMonthLabel)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5 ${!request.expiringOn ? "text-slate-400" : ""}">
            ${
              request.status === "approved"
                ? `<span class="status accepted">${escapeHtml(request.expiringOn || "—")}</span>`
                : request.status === "expired" || request.status === "denied"
                  ? `<span class="status cancelled">${escapeHtml(request.expiringOn || "—")}</span>`
                  : escapeHtml(request.expiringOn || "—")
            }
          </td>
        </tr>
      `;
    })
    .join("");

  $tbody.html(html);
}

function renderActionedPagination() {
  const filtered = getFilteredActionedRequests();
  const totalRows = filtered.length;
  const rowsPerPage = DRApprovalsState.pagination.actioned.rowsPerPage;
  const currentPage = DRApprovalsState.pagination.actioned.currentPage;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const startIndex = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalRows);

  $("#actionedPaginationStart").text(startIndex);
  $("#actionedPaginationEnd").text(endIndex);
  $("#actionedPaginationTotal").text(totalRows);
  $("#actionedPageIndicator").text(`Page ${currentPage} of ${totalPages}`);

  $("#actionedPrevPage").prop("disabled", currentPage === 1);
  $("#actionedNextPage").prop(
    "disabled",
    currentPage === totalPages || totalRows === 0,
  );
}
//#endregion

//#region MODAL RENDER
function renderPendingModal() {
  const request = findPendingRequestById(DRApprovalsState.ui.pendingModalRequestId);
  if (!request) return;

  $("#pendingModalEmployee").text(request.employeeName || "—");
  $("#pendingModalEmpId").text(`EMP-${request.employeeId || "—"}`);
  $("#pendingModalGroup").text(formatGroupLabel(request.group));
  $("#pendingModalRequestedOn").text(request.requestedOn || "—");
  $("#pendingModalRequestedMonth").text(request.requestedMonthLabel || "—");

  $("#pendingModalRequestedBy").text(request.requestedByName || "—"); // ✅ ADD THIS

  $("#pendingAcceptBtn").attr("data-request-id", request.requestId || "");
  $("#pendingDenyBtn").attr("data-request-id", request.requestId || "");
}

function renderActionedModal() {
  const request = findActionedRequestById(
    DRApprovalsState.ui.actionedModalRequestId,
  );
  if (!request) return;

  const status = normalizeText(request.status) || "—";
  const expiringOn = request.expiringOn || "—";

  $("#actionedModalEmployee").text(request.employeeName || "—");
  $("#actionedModalEmpId").text(`EMP-${request.employeeId || "—"}`);
  $("#actionedModalGroup").text(formatGroupLabel(request.group));
  $("#actionedModalRequestedOn").text(request.requestedOn || "—");
  $("#actionedModalRequestedMonth").text(request.requestedMonthLabel || "—");
  $("#actionedModalStatus").text(capitalize(status));
  $("#actionedModalActionTakenOn").text(request.actionTakenOn || "—");
  $("#actionedModalActionTakenBy").text(request.actionTakenBy || "—");
  $("#actionedModalRequestedBy").text(request.requestedByName || "—");
  $("#actionedModalExpiresOn").text(request.expiringOn || "—");

  const $chip = $("#actionedModalStatusChip");
  $chip
    .removeClass(
      "modal-chip-success modal-chip-danger modal-chip-neutral modal-chip-pending",
    )
    .text(capitalize(status));

  if (status === "approved") {
    $chip.addClass("modal-chip-success");
  } else if (status === "denied" || status === "expired") {
    $chip.addClass("modal-chip-danger");
  } else {
    $chip.addClass("modal-chip-neutral");
  }

  const $expiryWrap = $("#expiryTopWrap");
  const $expiry = $("#actionedModalExpiringOnTop");

  $expiryWrap.removeClass("expiry-active expiry-expired");
  $expiry.removeClass("expiry-active expiry-expired");

  if (status === "denied") {
    $expiryWrap.hide();
    $expiry.text("—");
  } else {
    $expiryWrap.css("display", "");
    $expiry.text(expiringOn || "—");

    if (status === "expired") {
      $expiryWrap.addClass("expiry-expired");
    } else if (status === "approved") {
      $expiryWrap.addClass("expiry-active");
    }
  }
}
//#endregion

function renderGroupFilters() {
  const groups = DRApprovalsState.options?.groups || [];

  const optionsHtml = [
    `<option value="">All Groups</option>`,
    ...groups.map(function (group) {
      return `<option value="${escapeHtml(group.value)}">${escapeHtml(group.label)}</option>`;
    }),
  ].join("");

  const pendingValue = DRApprovalsState.filters.pending.group || "";
  const actionedValue = DRApprovalsState.filters.actioned.group || "";

  $("#pendingGroupSel").html(optionsHtml).val(pendingValue);
  $("#actionedGroupSel").html(optionsHtml).val(actionedValue);

  toggleGroupActive($("#pendingGroupSel"));
  toggleGroupActive($("#actionedGroupSel"));
}