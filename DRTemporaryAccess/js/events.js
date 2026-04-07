//#region REQUEST FORM EVENTS
function bindRequestFormEvents() {
  $(document).on("click", "#submitRequestBtn", async function () {
    const $submitBtn = $(this);
    const empDetails = RequestPageState.auth.empDetails;
    const isLeader = hasOverridePermission(empDetails);

    let targetEmployeeId = "";

    const $targetSel = $("#targetEmployeeSel");
    targetEmployeeId = ($targetSel.val() || "").toString().trim();

    if (!targetEmployeeId && !isLeader) {
      targetEmployeeId = empDetails.empNum || "";
    }

    const requestMonth = ($("#requestCreateMonthSel").val() || "")
      .toString()
      .trim();

    if (!targetEmployeeId) {
      alert("Please select an employee.");
      return;
    }

    if (!requestMonth) {
      alert("Please select a requested month.");
      return;
    }

    const maxAllowedMonth = getPreviousMonthValue();
    if (requestMonth > maxAllowedMonth) {
      alert("Requested month must be before the current month.");
      return;
    }

    const requestReason = ($("#requestCreateReason").val() || "").trim();
    if (!requestReason) {
      alert("Please provide a reason for the temporary access request.");
      return;
    }

    const payload = {
      employee_number: targetEmployeeId,
      requested_month: requestMonth,
      request_reason: requestReason,
    };
    showLoader();
    $submitBtn.prop("disabled", true);

    try {
      const result = await createTemporaryAccessRequest(payload);
      const request = result?.request || result;

      if (!request || !request.requestId) {
        throw new Error("Created request data is invalid.");
      }

      RequestPageState.data.submittedRequests.unshift(request);

      const myEmpNum = String(empDetails.empNum || "");
      if (String(request.targetEmployeeId || "") === myEmpNum) {
        RequestPageState.data.requestsForMe.unshift(request);
      }

      RequestPageState.pagination.submitted.currentPage = 1;
      RequestPageState.pagination.forMe.currentPage = 1;

      if (isLeader && $("#targetGroupSel").length) {
        const defaultGroup = RequestPageState.form.defaultGroup || "";
        $("#targetGroupSel").val(defaultGroup);
        toggleTargetGroupActive($("#targetGroupSel"));
        renderTargetEmployeeOptions(defaultGroup);
      } else if ($("#targetEmployeeSel").length) {
        const currentGroup =
          $("#targetGroupSel").val() ||
          RequestPageState.form.defaultGroup ||
          "";
        renderTargetEmployeeOptions(currentGroup);
      }

      $("#requestCreateReason").val("");

      $("#requestCreateMonthSel").val("");
      updateMonthDisplay({
        inputSelector: "#requestCreateMonthSel",
        triggerSelector: ".requestCreateMonthCont",
        labelSelector: "#requestCreateMonthLabel",
        removeId: "removeRequestCreateMonth",
        defaultLabel: "Requested Month",
        onChange: function () {},
      });

      renderPage();

      if (result.emailSent === false) {
        await hideLoader();
        alert(
          "Temporary access request submitted, but email notification was not sent.",
        );
      } else {
        await hideLoader();
        alert("Temporary access request submitted.");
      }
    } catch (error) {
      await hideLoader();
      const message =
        error?.responseJSON?.message ||
        error?.message ||
        "Failed to submit temporary access request.";

      alert(message);
      console.error("REQUEST SUBMIT FAILED:", error);
    } finally {
      $submitBtn.prop("disabled", false);
      await hideLoader();
    }
  });
}
//#endregion

//#region SUBMITTED FILTER EVENTS
function bindSubmittedFilterEvents() {
  $(document).on("input", ".my-request-search", function () {
    RequestPageState.pagination.submitted.currentPage = 1;
    renderPage();
  });
}

function filterMyRequestsSubmitted() {
  RequestPageState.pagination.submitted.currentPage = 1;
  renderPage();
}
//#endregion

//#region FOR ME FILTER EVENTS
function bindForMeFilterEvents() {
  $(document).on("input", ".my-request-for-me-search", function () {
    RequestPageState.pagination.forMe.currentPage = 1;
    renderPage();
  });
}

function filterRequestsForMe() {
  RequestPageState.pagination.forMe.currentPage = 1;
  renderPage();
}
//#endregion

//#region PAGINATION EVENTS
function bindSubmittedPaginationEvents() {
  $(document).on("click", "#myRequestPrevPage", function () {
    if (RequestPageState.pagination.submitted.currentPage > 1) {
      RequestPageState.pagination.submitted.currentPage--;
      renderPage();
    }
  });

  $(document).on("click", "#myRequestNextPage", function () {
    const rowsPerPage = RequestPageState.pagination.submitted.rowsPerPage;
    const totalRows = getFilteredSubmittedRequests().length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    if (RequestPageState.pagination.submitted.currentPage < totalPages) {
      RequestPageState.pagination.submitted.currentPage++;
      renderPage();
    }
  });
}

function bindForMePaginationEvents() {
  $(document).on("click", "#myRequestForMePrevPage", function () {
    if (RequestPageState.pagination.forMe.currentPage > 1) {
      RequestPageState.pagination.forMe.currentPage--;
      renderPage();
    }
  });

  $(document).on("click", "#myRequestForMeNextPage", function () {
    const rowsPerPage = RequestPageState.pagination.forMe.rowsPerPage;
    const totalRows = getFilteredRequestsForMe().length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    if (RequestPageState.pagination.forMe.currentPage < totalPages) {
      RequestPageState.pagination.forMe.currentPage++;
      renderPage();
    }
  });
}
//#endregion

//#region MODAL EVENTS
function bindRequestModalEvents() {
  $(document).on("click", ".my-request-row", function () {
    const $row = $(this);
    RequestPageState.ui.activeModalRequestId = $row.data("request-id") || null;
    renderRequestDetailsModal($row);
  });

  $(document).on("click", ".modal-close", function () {
    const target = $(this).data("close");
    $(target).removeClass("flex").addClass("hidden");
    RequestPageState.ui.activeModalRequestId = null;
  });

  $(document).on("click", "#requestDetailsModal", function (e) {
    if (e.target === this) {
      $(this).removeClass("flex").addClass("hidden");
      RequestPageState.ui.activeModalRequestId = null;
    }
  });
}
//#endregion

function bindRequestGroupEvents() {
  $(document).on("change", "#targetGroupSel", function () {
    const selectedGroup = $(this).val() || "";
    renderTargetEmployeeOptions(selectedGroup);
  });
}

//#region PAGE EVENTS
function bindPageEvents() {
  bindRequestFormEvents();
  bindRequestGroupEvents();
  bindSubmittedFilterEvents();
  bindForMeFilterEvents();
  bindSubmittedPaginationEvents();
  bindForMePaginationEvents();
  bindRequestModalEvents();
}
//#endregion
