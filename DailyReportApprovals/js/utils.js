//#region TEXT / FORMAT HELPERS
function capitalize(value) {
  if (!value || value === "—") return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeText(value) {
  return (value || "").toString().toLowerCase().trim();
}

function escapeHtml(value) {
  return (value || "").toString().replace(/[&<>"']/g, function (char) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}

function getRequestSearchBlob(request) {
  return normalizeText([
    request.requestId,
    request.employeeName,
    request.employeeId,
    request.group,
    request.requestedOn,
    request.requestedMonthLabel,
    request.status,
    request.actionTakenOn,
    request.actionTakenBy,
    request.expiringOn,
  ].join(" "));
}

function formatGroupLabel(group) {
  return (group || "—").toString().toUpperCase();
}
//#endregion

//#region FILTER HELPERS
function matchesRequestFilters(request, filters) {
  const search = normalizeText(filters.search);
  const month = normalizeText(filters.month);
  const group = normalizeText(filters.group);

  const requestMonth = normalizeText(request.requestedMonthValue);
  const requestGroup = normalizeText(request.group);
  const requestBlob = getRequestSearchBlob(request);

  const searchMatch = !search || requestBlob.includes(search);
  const monthMatch = !month || requestMonth === month;
  const groupMatch = !group || requestGroup === group;

  return searchMatch && monthMatch && groupMatch;
}

function getFilteredPendingRequests() {
  return DRApprovalsState.data.pendingRequests.filter(function (request) {
    return matchesRequestFilters(request, DRApprovalsState.filters.pending);
  });
}

function getFilteredActionedRequests() {
  return DRApprovalsState.data.actionedRequests.filter(function (request) {
    return matchesRequestFilters(request, DRApprovalsState.filters.actioned);
  });
}

function getPaginatedActionedRequests() {
  const filtered = getFilteredActionedRequests();
  const currentPage = DRApprovalsState.pagination.actioned.currentPage;
  const rowsPerPage = DRApprovalsState.pagination.actioned.rowsPerPage;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  return filtered.slice(startIndex, endIndex);
}
//#endregion

//#region LOOKUP HELPERS
function findPendingRequestById(requestId) {
  return (
    DRApprovalsState.data.pendingRequests.find(function (request) {
      return request.requestId === requestId;
    }) || null
  );
}

function findActionedRequestById(requestId) {
  return (
    DRApprovalsState.data.actionedRequests.find(function (request) {
      return request.requestId === requestId;
    }) || null
  );
}
//#endregion

