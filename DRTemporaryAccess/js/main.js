//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var empDetails = [];

let myRequestCurrentPage = 1;
const myRequestRowsPerPage = 10;

let myRequestForMeCurrentPage = 1;
const myRequestForMeRowsPerPage = 10;

checkLogin();

// UI TEST MODE: set to true if you want to force leader UI locally
const FORCE_LEADER_UI = true;
//#endregion

$(document).ready(function () {
  applyUiTestMode();

  $(".hello-user").text(empDetails["empFName"] || "User");

  ifSmallScreen();
  initSidebar();
  initMonthPickers();
  initStatusFilter();
  initTargetEmployeeField();
  initRequestForm();
  initRequestRowModal();

  setTimeout(function () {
    updateMonthDisplay({
      inputSelector: "#requestMonthSel",
      triggerSelector: ".requestMonthCont",
      labelSelector: "#requestMonthLabel",
      removeId: "removeRequestMonth",
      defaultLabel: "Requested Month",
      onChange: filterMyRequestsSubmitted,
    });

    updateMonthDisplay({
      inputSelector: "#requestForMeMonthSel",
      triggerSelector: ".requestForMeMonthCont",
      labelSelector: "#requestForMeMonthLabel",
      removeId: "removeRequestForMeMonth",
      defaultLabel: "Requested Month",
      onChange: filterRequestsForMe,
    });

    updateMonthDisplay({
      inputSelector: "#requestCreateMonthSel",
      triggerSelector: ".requestCreateMonthCont",
      labelSelector: "#requestCreateMonthLabel",
      removeId: "removeRequestCreateMonth",
      defaultLabel: "Requested Month",
      onChange: function () {},
    });

    toggleStatusActive($("#requestStatusSel"));
    toggleStatusActive($("#requestForMeStatusSel"));
    toggleTargetEmployeeActive($("#targetEmployeeSel"));

    setupRequestEmployeeField();
    filterMyRequestsSubmitted();
    filterRequestsForMe();
    refreshSummaryCards();
    renderActivePanel();
  }, 50);

  $(".cs-loader").fadeOut(1000);
});

$(window).on("resize", function () {
  ifSmallScreen();
});

//#region AUTH
function checkLogin() {
  $.ajax({
    url: "ajax/check_login.php",
    success: function (data) {
      empDetails = $.parseJSON(data);
      if (Object.keys(empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin";
      }
    },
    async: false,
  });
}

function applyUiTestMode() {
  if (!FORCE_LEADER_UI) return;

  empDetails["isLeaderOverride"] = "1";
  empDetails["empNum"] = "1038";
  empDetails["empFName"] = "Joshua";
  empDetails["empLName"] = "Coquia";
  empDetails["empFullName"] = "Joshua Coquia";
}
//#endregion

//#region SIDEBAR
function initSidebar() {
  $(document).on("click", ".arrow", function (e) {
    const $arrowParent = $(e.target).closest(".iocn-link").parent();
    $arrowParent.toggleClass("showMenu");
  });

  $(document).on("click", ".ey", function (e) {
    const $parentLi = $(e.target).closest("li");
    $parentLi.toggleClass("showMenu");
  });

  $(document).on("click", ".menu-one", function () {
    $(".sidebar").toggleClass("close");
    ifSmallScreen();
  });

  $(document).on("click", ".menu-two", function () {
    $(".sidebar").addClass("close");
    ifSmallScreen();
  });
}

function ifSmallScreen() {
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass("close")) {
      $(".menu-two-wrap").addClass("hidden");
    } else {
      $(".menu-two-wrap").removeClass("hidden");
    }
  } else {
    $(".menu-two-wrap").addClass("hidden");
  }
}
//#endregion

//#region MONTH PICKER
function initMonthPickers() {
  bindMonthPicker({
    inputSelector: "#requestMonthSel",
    triggerSelector: ".requestMonthCont",
    labelSelector: "#requestMonthLabel",
    removeId: "removeRequestMonth",
    defaultLabel: "Requested Month",
    onChange: filterMyRequestsSubmitted,
  });

  bindMonthPicker({
    inputSelector: "#requestForMeMonthSel",
    triggerSelector: ".requestForMeMonthCont",
    labelSelector: "#requestForMeMonthLabel",
    removeId: "removeRequestForMeMonth",
    defaultLabel: "Requested Month",
    onChange: filterRequestsForMe,
  });

  bindMonthPicker({
    inputSelector: "#requestCreateMonthSel",
    triggerSelector: ".requestCreateMonthCont",
    labelSelector: "#requestCreateMonthLabel",
    removeId: "removeRequestCreateMonth",
    defaultLabel: "Requested Month",
    onChange: function () {},
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
    updateMonthDisplay(config);
    config.onChange();
  });

  $(document).on("click", `#${config.removeId}`, function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $input = $(config.inputSelector);
    $input.val("").removeClass("active");
    $input.closest(".approval-month-wrap").removeClass("active");
    updateMonthDisplay(config);
    config.onChange();
  });

  updateMonthDisplay(config);
}

function openMonthPicker(inputSelector) {
  const monthInput = document.querySelector(inputSelector);
  if (!monthInput) return;

  try {
    if (typeof monthInput.showPicker === "function") {
      monthInput.showPicker();
      return;
    }
  } catch (err) {}

  monthInput.focus();

  try {
    monthInput.click();
  } catch (err) {}
}

function updateMonthDisplay(config) {
  const $monthInput = $(config.inputSelector);
  const $trigger = $(config.triggerSelector);
  const $wrap = $trigger.closest(".approval-month-wrap");
  if (!$trigger.length) return;

  const value = $monthInput.val();

  let display = config.defaultLabel;
  let iconHtml = `<i class="bx bx-chevron-down text-[18px] shrink-0 month-arrow"></i>`;

  $monthInput.removeClass("active");
  $trigger.removeClass("active");
  $wrap.removeClass("active");

  if (value) {
    const [year, month] = value.split("-");
    const monthDate = new Date(year, parseInt(month, 10) - 1, 1);
    const monthName = monthDate.toLocaleString("en-US", { month: "long" });

    if (monthName && year) {
      $monthInput.addClass("active");
      $trigger.addClass("active");
      $wrap.addClass("active");
      display = `${monthName} ${year}`;
      iconHtml = `<i class="bx bx-x text-[18px] shrink-0 month-arrow" id="${config.removeId}"></i>`;
    }
  }

  $trigger.html(`
    <i class="bx bx-calendar shrink-0 month-icon opacity-75"></i>
    <span id="${config.labelSelector.replace("#", "")}" class="whitespace-nowrap text-[13px] month-text">${display}</span>
    ${iconHtml}
  `);

  $trigger.css({
    width: "fit-content",
    display: "inline-flex",
    minWidth: $trigger.hasClass("requestCreateMonthCont") ? "100%" : "unset",
  });
}
//#endregion

//#region STATUS FILTERS
function initStatusFilter() {
  $(document).on("change", "#requestStatusSel", function () {
    toggleStatusActive($(this));
    filterMyRequestsSubmitted();
  });

  $(document).on("change", "#requestForMeStatusSel", function () {
    toggleStatusActive($(this));
    filterRequestsForMe();
  });

  toggleStatusActive($("#requestStatusSel"));
  toggleStatusActive($("#requestForMeStatusSel"));

  $(document).on(
    "click",
    ".approval-select-wrap i[data-clear-status='1']",
    function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $wrap = $(this).closest(".approval-select-wrap");
      const $select = $wrap.find("select");

      $select.val("");
      toggleStatusActive($select);

      if ($select.attr("id") === "requestStatusSel") {
        filterMyRequestsSubmitted();
      } else if ($select.attr("id") === "requestForMeStatusSel") {
        filterRequestsForMe();
      }
    },
  );
}

function toggleStatusActive($select) {
  if (!$select.length) return;

  const $wrap = $select.closest(".approval-select-wrap");
  const $rightIcon = $wrap.find(".bx-chevron-down, .bx-x").last();

  if ($select.val()) {
    $wrap.addClass("active has-clear");
    $rightIcon
      .removeClass("bx-chevron-down")
      .addClass("bx-x")
      .attr("data-clear-status", "1");
  } else {
    $wrap.removeClass("active has-clear");
    $rightIcon
      .removeClass("bx-x")
      .addClass("bx-chevron-down")
      .removeAttr("data-clear-status");
  }
}
//#endregion

//#region TARGET EMPLOYEE FIELD
function initTargetEmployeeField() {
  $(document).on("change", "#targetEmployeeSel", function () {
    toggleTargetEmployeeActive($(this));
  });

  $(document).on(
    "click",
    ".approval-select-wrap i[data-clear-target='1']",
    function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $wrap = $(this).closest(".approval-select-wrap");
      const $select = $wrap.find("select");

      $select.val("");
      toggleTargetEmployeeActive($select);
    },
  );
}

function setupRequestEmployeeField() {
  const isLeader =
    String(
      empDetails["isLeaderOverride"] || empDetails["hasOverride"] || "0",
    ) === "1";

  const empNum = empDetails["empNum"] || "";
  const fullName =
    empDetails["empFullName"] ||
    [
      empDetails["empFName"] || "",
      empDetails["empMName"] || "",
      empDetails["empLName"] || "",
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ||
    "User";

  const $leaderWrap = $("#targetEmployeeWrap");
  const $leaderSelect = $("#targetEmployeeSel");
  const $readonlyWrap = $("#requestEmployeeReadonlyWrap");
  const $readonlyInput = $("#requestEmployeeReadonly");

  if ($readonlyInput.length) {
    $readonlyInput.val(`${fullName}${empNum ? ` (EMP-${empNum})` : ""}`);
  }

  if (isLeader && $leaderSelect.length) {
    if ($leaderWrap.length) $leaderWrap.removeClass("hidden");
    if ($readonlyWrap.length) $readonlyWrap.addClass("hidden");

    $leaderSelect.empty();
    $leaderSelect.append(`<option value="">Select employee</option>`);
    $leaderSelect.append(
      `<option value="1038" data-name="Joshua Coquia">Joshua Coquia</option>`,
    );
    $leaderSelect.append(
      `<option value="1042" data-name="Collene Keith">Collene Keith</option>`,
    );
    $leaderSelect.append(
      `<option value="1051" data-name="Dexmel Hernandez">Dexmel Hernandez</option>`,
    );
    $leaderSelect.append(
      `<option value="1060" data-name="Sample Member A">Sample Member A</option>`,
    );
    $leaderSelect.append(
      `<option value="1061" data-name="Sample Member B">Sample Member B</option>`,
    );
    $leaderSelect.append(
      `<option value="1062" data-name="Sample Member C">Sample Member C</option>`,
    );

    toggleTargetEmployeeActive($leaderSelect);
  } else {
    if ($leaderWrap.length) $leaderWrap.addClass("hidden");
    if ($readonlyWrap.length) $readonlyWrap.removeClass("hidden");
  }
}

function toggleTargetEmployeeActive($select) {
  if (!$select.length) return;

  const $wrap = $select.closest(".approval-select-wrap");
  const $rightIcon = $wrap.find(".bx-chevron-down, .bx-x").last();

  if ($select.val()) {
    $wrap.addClass("active has-clear");
    $rightIcon
      .removeClass("bx-chevron-down")
      .addClass("bx-x")
      .attr("data-clear-target", "1");
  } else {
    $wrap.removeClass("active has-clear");
    $rightIcon
      .removeClass("bx-x")
      .addClass("bx-chevron-down")
      .removeAttr("data-clear-target");
  }
}
//#endregion

//#region REQUEST FORM
function initRequestForm() {
  $(document).on("click", "#submitRequestBtn", function () {
    const isLeader =
      String(
        empDetails["isLeaderOverride"] || empDetails["hasOverride"] || "0",
      ) === "1";

    let targetEmployeeId = "";
    let targetEmployeeName = "";

    if (isLeader && $("#targetEmployeeSel").length) {
      const $targetSel = $("#targetEmployeeSel");
      targetEmployeeId = $targetSel.val();
      targetEmployeeName =
        $targetSel.find("option:selected").data("name") ||
        $targetSel.find("option:selected").text() ||
        "";
    } else {
      targetEmployeeId = empDetails["empNum"] || "";
      targetEmployeeName =
        empDetails["empFullName"] ||
        [
          empDetails["empFName"] || "",
          empDetails["empMName"] || "",
          empDetails["empLName"] || "",
        ]
          .join(" ")
          .replace(/\s+/g, " ")
          .trim() ||
        "User";
    }

    const requestMonth = $("#requestCreateMonthSel").val();

    if (!targetEmployeeId) {
      alert("Please select an employee.");
      return;
    }

    if (!requestMonth) {
      alert("Please select a requested month.");
      return;
    }

    const now = new Date();
    const requestId = `REQ-${Math.floor(Math.random() * 9000) + 1000}`;
    const formattedNow = formatDateTime(now);
    const requestedMonthLabel = formatMonthValue(requestMonth);
    const empIdLabel = `EMP-${targetEmployeeId}`;
    const submittedBy =
      empDetails["empFullName"] ||
      [
        empDetails["empFName"] || "",
        empDetails["empMName"] || "",
        empDetails["empLName"] || "",
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() ||
      "User";

    const submittedRowHtml = `
      <tr
        class="my-request-row submitted-request-row cursor-pointer"
        data-source-table="submitted"
        data-request-id="${escapeHtml(requestId)}"
        data-target-employee="${escapeHtml(targetEmployeeName)}"
        data-target-empid="${escapeHtml(targetEmployeeId)}"
        data-requested-on="${escapeHtml(formattedNow)}"
        data-requested-month="${escapeHtml(requestedMonthLabel)}"
        data-month-value="${escapeHtml(requestMonth)}"
        data-status="pending"
        data-action-taken-on=""
        data-action-taken-by=""
        data-valid-until=""
        data-requested-by="${escapeHtml(submittedBy)}"
      >
        <td class="border-b border-slate-200 px-4 py-5 text-slate-700 font-medium">
          ${escapeHtml(requestId)}
        </td>
        <td class="border-b border-slate-200 px-4 py-5">
          <div class="font-medium text-slate-800">${escapeHtml(targetEmployeeName)}</div>
          <div class="text-xs text-slate-400">${escapeHtml(empIdLabel)}</div>
        </td>
        <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
          ${escapeHtml(formattedNow)}
        </td>
        <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
          ${escapeHtml(requestedMonthLabel)}
        </td>
        <td class="border-b border-slate-200 px-4 py-5">
          <span class="status pending">Pending</span>
        </td>
        <td class="border-b border-slate-200 px-4 py-5 text-slate-400">
          —
        </td>
      </tr>
    `;

    $("#myRequestTableBody").prepend(submittedRowHtml);

    const myEmpNum = String(empDetails["empNum"] || "");
    if (
      String(targetEmployeeId) === myEmpNum &&
      $("#myRequestForMeTableBody").length
    ) {
      const forMeRowHtml = `
        <tr
          class="my-request-row for-me-request-row cursor-pointer"
          data-source-table="for-me"
          data-request-id="${escapeHtml(requestId)}"
          data-target-employee="${escapeHtml(targetEmployeeName)}"
          data-target-empid="${escapeHtml(targetEmployeeId)}"
          data-requested-on="${escapeHtml(formattedNow)}"
          data-requested-month="${escapeHtml(requestedMonthLabel)}"
          data-month-value="${escapeHtml(requestMonth)}"
          data-status="pending"
          data-action-taken-on=""
          data-action-taken-by=""
          data-valid-until=""
          data-requested-by="${escapeHtml(submittedBy)}"
        >
          <td class="border-b border-slate-200 px-4 py-5 text-slate-700 font-medium">
            ${escapeHtml(requestId)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
            ${escapeHtml(submittedBy)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
            ${escapeHtml(formattedNow)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-600">
            ${escapeHtml(requestedMonthLabel)}
          </td>
          <td class="border-b border-slate-200 px-4 py-5">
            <span class="status pending">Pending</span>
          </td>
          <td class="border-b border-slate-200 px-4 py-5 text-slate-400">
            —
          </td>
        </tr>
      `;

      $("#myRequestForMeTableBody").prepend(forMeRowHtml);
    }

    if (isLeader && $("#targetEmployeeSel").length) {
      $("#targetEmployeeSel").val("");
      toggleTargetEmployeeActive($("#targetEmployeeSel"));
    }

    $("#requestCreateMonthSel").val("");
    updateMonthDisplay({
      inputSelector: "#requestCreateMonthSel",
      triggerSelector: ".requestCreateMonthCont",
      labelSelector: "#requestCreateMonthLabel",
      removeId: "removeRequestCreateMonth",
      defaultLabel: "Requested Month",
      onChange: function () {},
    });

    refreshSummaryCards();
    filterMyRequestsSubmitted();
    filterRequestsForMe();
    renderActivePanel();

    alert("Temporary access request submitted.");
  });
}

function formatMonthValue(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  const monthDate = new Date(year, parseInt(month, 10) - 1, 1);
  const monthName = monthDate.toLocaleString("en-US", { month: "long" });
  return `${monthName} ${year}`;
}

function formatDateTime(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = String(hours).padStart(2, "0");

  return `${year}-${month}-${day} ${hourStr}:${minutes} ${ampm}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
//#endregion

//#region FILTERS - SUBMITTED
$(document).on("input", ".my-request-search", function () {
  filterMyRequestsSubmitted();
});

function filterMyRequestsSubmitted() {
  if (!$("#myRequestTableBody").length) return;

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

  let visibleCount = 0;

  $("#myRequestTableBody tr")
    .not(".request-empty-row")
    .each(function () {
      const $row = $(this);

      const rowMonth = ($row.data("month-value") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowStatus = ($row.data("status") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowText = $row.text().toLowerCase();

      const searchMatch = !searchValue || rowText.indexOf(searchValue) !== -1;
      const monthMatch = !monthValue || rowMonth === monthValue;
      const statusMatch =
        !statusValue ||
        rowStatus === statusValue ||
        (statusValue === "approved" && rowStatus === "active");

      if (searchMatch && monthMatch && statusMatch) {
        $row.attr("data-filter-match", "1");
        visibleCount++;
      } else {
        $row.attr("data-filter-match", "0");
      }
    });

  toggleEmptyState("#myRequestTableBody", visibleCount === 0, 6);
  resetMyRequestPagination();
}
//#endregion

//#region FILTERS - FOR ME
$(document).on("input", ".my-request-for-me-search", function () {
  filterRequestsForMe();
});

function filterRequestsForMe() {
  if (!$("#myRequestForMeTableBody").length) return;

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

  let visibleCount = 0;

  $("#myRequestForMeTableBody tr")
    .not(".request-empty-row")
    .each(function () {
      const $row = $(this);

      const rowMonth = ($row.data("month-value") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowStatus = ($row.data("status") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowText = $row.text().toLowerCase();

      const searchMatch = !searchValue || rowText.indexOf(searchValue) !== -1;
      const monthMatch = !monthValue || rowMonth === monthValue;
      const statusMatch =
        !statusValue ||
        rowStatus === statusValue ||
        (statusValue === "approved" && rowStatus === "active");

      if (searchMatch && monthMatch && statusMatch) {
        $row.attr("data-filter-match", "1");
        visibleCount++;
      } else {
        $row.attr("data-filter-match", "0");
      }
    });

  toggleEmptyState("#myRequestForMeTableBody", visibleCount === 0, 6);
  resetMyRequestForMePagination();
}

function toggleEmptyState(tbodySelector, showEmpty, colspan) {
  const $tbody = $(tbodySelector);
  if (!$tbody.length) return;

  $tbody.find(".request-empty-row").remove();

  if (showEmpty) {
    $tbody.append(`
      <tr class="request-empty-row">
        <td colspan="${colspan}" class="px-4 py-10 text-center text-sm text-slate-400">
          No requests found.
        </td>
      </tr>
    `);
  }
}
//#endregion

//#region PAGINATION - SUBMITTED
$(document).on("click", "#myRequestPrevPage", function () {
  if (myRequestCurrentPage > 1) {
    myRequestCurrentPage--;
    paginateMyRequestsSubmitted();
  }
});

$(document).on("click", "#myRequestNextPage", function () {
  const matchedRows = $("#myRequestTableBody tr")
    .not(".request-empty-row")
    .filter(function () {
      return $(this).attr("data-filter-match") !== "0";
    }).length;

  const totalPages = Math.max(1, Math.ceil(matchedRows / myRequestRowsPerPage));

  if (myRequestCurrentPage < totalPages) {
    myRequestCurrentPage++;
    paginateMyRequestsSubmitted();
  }
});

function paginateMyRequestsSubmitted() {
  if (!$("#myRequestTableBody").length) return;

  const $allRows = $("#myRequestTableBody tr").not(".request-empty-row");

  const $matchedRows = $allRows.filter(function () {
    return $(this).attr("data-filter-match") !== "0";
  });

  const totalRows = $matchedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / myRequestRowsPerPage));
  const shouldShowPagination = totalRows > myRequestRowsPerPage;

  if (myRequestCurrentPage > totalPages) {
    myRequestCurrentPage = totalPages;
  }

  if (totalRows === 0) {
    $allRows.hide();
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
    $allRows.hide();
    $matchedRows.show();

    $("#myRequestPaginationWrap").addClass("hidden").removeClass("flex");
    $("#myRequestPaginationStart").text(1);
    $("#myRequestPaginationEnd").text(totalRows);
    $("#myRequestPaginationTotal").text(totalRows);
    $("#myRequestPageIndicator").text("Page 1");
    $("#myRequestPrevPage").prop("disabled", true);
    $("#myRequestNextPage").prop("disabled", true);
    return;
  }

  const startIndex = (myRequestCurrentPage - 1) * myRequestRowsPerPage;
  const endIndex = startIndex + myRequestRowsPerPage;

  $allRows.hide();
  $matchedRows.slice(startIndex, endIndex).show();

  const visibleStart = startIndex + 1;
  const visibleEnd = Math.min(endIndex, totalRows);

  $("#myRequestPaginationWrap").removeClass("hidden").addClass("flex");
  $("#myRequestPaginationStart").text(visibleStart);
  $("#myRequestPaginationEnd").text(visibleEnd);
  $("#myRequestPaginationTotal").text(totalRows);
  $("#myRequestPageIndicator").text(
    `Page ${myRequestCurrentPage} of ${totalPages}`,
  );

  $("#myRequestPrevPage").prop("disabled", myRequestCurrentPage === 1);
  $("#myRequestNextPage").prop("disabled", myRequestCurrentPage === totalPages);
}

function resetMyRequestPagination() {
  myRequestCurrentPage = 1;
  paginateMyRequestsSubmitted();
}
//#endregion

//#region PAGINATION - FOR ME
$(document).on("click", "#myRequestForMePrevPage", function () {
  if (myRequestForMeCurrentPage > 1) {
    myRequestForMeCurrentPage--;
    paginateRequestsForMe();
  }
});

$(document).on("click", "#myRequestForMeNextPage", function () {
  const matchedRows = $("#myRequestForMeTableBody tr")
    .not(".request-empty-row")
    .filter(function () {
      return $(this).attr("data-filter-match") !== "0";
    }).length;

  const totalPages = Math.max(
    1,
    Math.ceil(matchedRows / myRequestForMeRowsPerPage),
  );

  if (myRequestForMeCurrentPage < totalPages) {
    myRequestForMeCurrentPage++;
    paginateRequestsForMe();
  }
});

function paginateRequestsForMe() {
  if (!$("#myRequestForMeTableBody").length) return;

  const $allRows = $("#myRequestForMeTableBody tr").not(".request-empty-row");

  const $matchedRows = $allRows.filter(function () {
    return $(this).attr("data-filter-match") !== "0";
  });

  const totalRows = $matchedRows.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / myRequestForMeRowsPerPage),
  );
  const shouldShowPagination = totalRows > myRequestForMeRowsPerPage;

  if (myRequestForMeCurrentPage > totalPages) {
    myRequestForMeCurrentPage = totalPages;
  }

  if (totalRows === 0) {
    $allRows.hide();
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
    $allRows.hide();
    $matchedRows.show();

    $("#myRequestForMePaginationWrap").addClass("hidden").removeClass("flex");
    $("#myRequestForMePaginationStart").text(1);
    $("#myRequestForMePaginationEnd").text(totalRows);
    $("#myRequestForMePaginationTotal").text(totalRows);
    $("#myRequestForMePageIndicator").text("Page 1");
    $("#myRequestForMePrevPage").prop("disabled", true);
    $("#myRequestForMeNextPage").prop("disabled", true);
    return;
  }

  const startIndex =
    (myRequestForMeCurrentPage - 1) * myRequestForMeRowsPerPage;
  const endIndex = startIndex + myRequestForMeRowsPerPage;

  $allRows.hide();
  $matchedRows.slice(startIndex, endIndex).show();

  const visibleStart = startIndex + 1;
  const visibleEnd = Math.min(endIndex, totalRows);

  $("#myRequestForMePaginationWrap").removeClass("hidden").addClass("flex");
  $("#myRequestForMePaginationStart").text(visibleStart);
  $("#myRequestForMePaginationEnd").text(visibleEnd);
  $("#myRequestForMePaginationTotal").text(totalRows);
  $("#myRequestForMePageIndicator").text(
    `Page ${myRequestForMeCurrentPage} of ${totalPages}`,
  );

  $("#myRequestForMePrevPage").prop(
    "disabled",
    myRequestForMeCurrentPage === 1,
  );
  $("#myRequestForMeNextPage").prop(
    "disabled",
    myRequestForMeCurrentPage === totalPages,
  );
}

function resetMyRequestForMePagination() {
  myRequestForMeCurrentPage = 1;
  paginateRequestsForMe();
}
//#endregion

//#region SUMMARY / ACTIVE PANEL
function refreshSummaryCards() {
  const $rows = $("tr.my-request-row").not(".request-empty-row");

  let pending = 0;
  let approved = 0;
  let denied = 0;
  let active = 0;

  $rows.each(function () {
    const status = (($(this).data("status") || "") + "").toLowerCase();

    if (status === "pending") pending++;
    if (status === "approved") approved++;
    if (status === "denied") denied++;
    if (status === "active") active++;
  });

  $("#cardPending").text(pending);
  $("#cardApproved").text(approved + active);
  $("#cardDenied").text(denied);
  $("#cardActive").text(active);
}

function renderActivePanel() {
  const $panel = $("#activeAccessPanel");
  const $body = $("#activeAccessBody");

  if (!$panel.length || !$body.length) return;

  const activeRows = $("tr.my-request-row")
    .not(".request-empty-row")
    .filter(function () {
      return (($(this).data("status") || "") + "").toLowerCase() === "active";
    });

  $body.empty();

  if (!activeRows.length) {
    $panel.addClass("request-banner-hidden");
    return;
  }

  $panel.removeClass("request-banner-hidden");

  activeRows.each(function () {
    const $row = $(this);
    const targetEmployee = $row.data("target-employee") || "—";
    const requestedMonth = $row.data("requested-month") || "—";
    const validUntil = $row.data("valid-until") || "—";
    const requestedBy = $row.data("requested-by") || "";

    $body.append(`
      <tr>
        <td class="px-4 py-3 border-b border-slate-200">
          <div class="font-medium text-slate-800">${escapeHtml(targetEmployee)}</div>
          ${
            requestedBy
              ? `<div class="text-xs text-slate-400">Requested by ${escapeHtml(requestedBy)}</div>`
              : ""
          }
        </td>
        <td class="px-4 py-3 border-b border-slate-200 text-slate-600">
          ${escapeHtml(requestedMonth)}
        </td>
        <td class="px-4 py-3 border-b border-slate-200 text-slate-600">
          ${escapeHtml(validUntil)}
        </td>
      </tr>
    `);
  });
}
//#endregion

//#region MODAL
function initRequestRowModal() {
  $(document).on("click", ".my-request-row", function () {
    const $row = $(this);
    const status = (($row.data("status") || "") + "").toLowerCase();
    const validUntil = $row.data("valid-until") || "—";
    const targetEmployee = $row.data("target-employee") || "—";
    const targetEmpId = $row.data("target-empid") || "—";
    const requestedBy =
      $row.data("requested-by") ||
      empDetails["empFullName"] ||
      [
        empDetails["empFName"] || "",
        empDetails["empMName"] || "",
        empDetails["empLName"] || "",
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() ||
      "User";

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
    $("#requestDetailsRequestedMonth").text(
      $row.data("requested-month") || "—",
    );
    $("#requestDetailsStatus").text(capitalize(status));
    $("#requestDetailsActionTakenOn").text($row.data("action-taken-on") || "—");
    $("#requestDetailsActionTakenBy").text($row.data("action-taken-by") || "—");
    $("#requestDetailsValidUntil").text(validUntil || "—");

    const $chip = $("#requestDetailsChip");
    $chip
      .removeClass(
        "modal-chip-success modal-chip-danger modal-chip-neutral modal-chip-pending",
      )
      .text(capitalize(status));

    if (status === "active" || status === "approved") {
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
      "request-validity-active request-validity-expired",
    );

    if (status === "denied" || status === "pending") {
      $validityWrap.hide();
      $("#requestDetailsValidUntil").text("—");
    } else {
      $validityWrap.css("display", "flex");

      if (status === "expired") {
        $validityWrap.addClass("request-validity-expired");
      } else if (status === "active" || status === "approved") {
        $validityWrap.addClass("request-validity-active");
      }
    }

    $("#requestDetailsModal").removeClass("hidden").addClass("flex");
  });

  $(document).on("click", ".modal-close", function () {
    const target = $(this).data("close");
    $(target).removeClass("flex").addClass("hidden");
  });

  $(document).on("click", "#requestDetailsModal", function (e) {
    if (e.target === this) {
      $(this).removeClass("flex").addClass("hidden");
    }
  });
}

function capitalize(value) {
  if (!value || value === "—") return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
//#endregion
