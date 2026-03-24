//#region BIND ALL EVENTS
function bindEvents() {
  bindFilterEvents();
  bindMonthPickerEvents();
  bindGroupFilterEvents();
  bindPaginationEvents();
  bindModalEvents();
}
//#endregion

//#region FILTER EVENTS
function bindFilterEvents() {
  $(document).on("input", ".pending-search", function () {
    DRApprovalsState.filters.pending.search = $(this).val() || "";
    renderPendingTable();
  });

  $(document).on("input", ".actioned-search", function () {
    DRApprovalsState.filters.actioned.search = $(this).val() || "";
    resetActionedPagination();
    renderActionedTable();
    renderActionedPagination();
  });
}
//#endregion

//#region MONTH PICKER EVENTS
function bindMonthPickerEvents() {
  bindMonthPicker({
    inputSelector: "#pendingMonthSel",
    triggerSelector: ".pendingMonthCont",
    labelSelector: "#pendingMonthLabel",
    removeId: "removePendingMonth",
    defaultLabel: "Requested Month",
    stateKey: "pending",
    onChange: function () {
      renderPendingTable();
    },
  });

  bindMonthPicker({
    inputSelector: "#actionedMonthSel",
    triggerSelector: ".actionedMonthCont",
    labelSelector: "#actionedMonthLabel",
    removeId: "removeActionedMonth",
    defaultLabel: "Requested Month",
    stateKey: "actioned",
    onChange: function () {
      resetActionedPagination();
      renderActionedTable();
      renderActionedPagination();
    },
  });
}

function bindMonthPicker(config) {
  const $input = $(config.inputSelector);
  if (!$input.length) return;

  $(document).on("click", config.triggerSelector, function (e) {
    if ($(e.target).attr("id") === config.removeId) return;
    openMonthPicker(config.inputSelector);
  });

  $(document).on("keydown", config.triggerSelector, function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMonthPicker(config.inputSelector);
    }
  });

  $(document).on("change input", config.inputSelector, function () {
    const value = $(this).val() || "";
    DRApprovalsState.filters[config.stateKey].month = value;
    updateMonthDisplay(config);
    config.onChange();
  });

  $(document).on("click", `#${config.removeId}`, function (e) {
    e.preventDefault();
    e.stopPropagation();

    $(config.inputSelector).val("").removeClass("active");
    DRApprovalsState.filters[config.stateKey].month = "";
    updateMonthDisplay(config);
    config.onChange();
  });

  updateMonthDisplay(config);
}
//#endregion

//#region GROUP FILTER EVENTS
function bindGroupFilterEvents() {
  $(document).on("change", "#pendingGroupSel", function () {
    DRApprovalsState.filters.pending.group = $(this).val() || "";
    toggleGroupActive($(this));
    renderPendingTable();
  });

  $(document).on("change", "#actionedGroupSel", function () {
    DRApprovalsState.filters.actioned.group = $(this).val() || "";
    toggleGroupActive($(this));
    resetActionedPagination();
    renderActionedTable();
    renderActionedPagination();
  });

  $(document).on(
    "click",
    ".approval-select-wrap i[data-clear-group='1']",
    function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $wrap = $(this).closest(".approval-select-wrap");
      const $select = $wrap.find("select");

      $select.val("").trigger("change");
    },
  );

  toggleGroupActive($("#pendingGroupSel"));
  toggleGroupActive($("#actionedGroupSel"));
}
//#endregion

//#region PAGINATION EVENTS
function bindPaginationEvents() {
  $(document).on("click", "#actionedPrevPage", function () {
    if (DRApprovalsState.pagination.actioned.currentPage > 1) {
      DRApprovalsState.pagination.actioned.currentPage--;
      renderActionedTable();
      renderActionedPagination();
    }
  });

  $(document).on("click", "#actionedNextPage", function () {
    const totalRows = getFilteredActionedRequests().length;
    const rowsPerPage = DRApprovalsState.pagination.actioned.rowsPerPage;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    if (DRApprovalsState.pagination.actioned.currentPage < totalPages) {
      DRApprovalsState.pagination.actioned.currentPage++;
      renderActionedTable();
      renderActionedPagination();
    }
  });
}

function resetActionedPagination() {
  DRApprovalsState.pagination.actioned.currentPage = 1;
}
//#endregion

//#region MODAL EVENTS
function bindModalEvents() {
  $(document).on("click", ".pending-row", function () {
    const requestId = $(this).attr("data-request-id") || "";
    DRApprovalsState.ui.pendingModalRequestId = requestId;
    renderPendingModal();
    openModal("#pendingRequestModal");
  });

  $(document).on("click", ".actioned-row", function () {
    const requestId = $(this).attr("data-request-id") || "";
    DRApprovalsState.ui.actionedModalRequestId = requestId;
    renderActionedModal();
    openModal("#actionedRequestModal");
  });

  $(document).on("click", ".modal-close", function () {
    const target = $(this).data("close");
    closeModal(target);
  });

  $(document).on(
    "click",
    "#pendingRequestModal, #actionedRequestModal",
    function (e) {
      if (e.target === this) {
        closeModal(`#${this.id}`);
      }
    },
  );

  $(document).on("click", "#pendingAcceptBtn", async function () {
    const requestId = $(this).attr("data-request-id");

    if (
      !confirm(
        "Approve this request? This grants 1-day access to the user's own Daily Report only.",
      )
    ) {
      return;
    }

    try {
      const response = await approveRequest(requestId);
      alert(response.message || "Request approved.");
      closeModal("#pendingRequestModal");
      await refreshApprovalData();
    } catch (error) {
      console.error("APPROVE FAILED:", error);
      alert(error || "Failed to approve request.");
    }
  });

  $(document).on("click", "#pendingDenyBtn", async function () {
    const requestId = $(this).attr("data-request-id");

    if (!confirm("Deny this request?")) {
      return;
    }

    try {
      const response = await denyRequest(requestId);
      alert(response.message || "Request denied.");
      closeModal("#pendingRequestModal");
      await refreshApprovalData();
    } catch (error) {
      console.error("DENY FAILED:", error);
      alert(error || "Failed to deny request.");
    }
  });
}
//#endregion