//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var empDetails = [];
let actionedCurrentPage = 1;
const actionedRowsPerPage = 10;
checkLogin();
//#endregion

$(document).ready(function () {
  $(".hello-user").text(empDetails["empFName"] || "User");
  ifSmallScreen();
  initSidebar();
  initMonthPickers();
  initGroupFilters();
  initRowModals();
  planAccess();

  setTimeout(function () {
    filterPendingTable();
    filterActionedTable();
    paginateActionedTable();
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
//#region PLAN ACCESS
function planAccess() {
  $.post(
    "ajax/plan_access.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var addString = "";
      var access = $.parseJSON(data);
      if (access) {
        addString += `<li>
        <div class="iocn-link">
          <a class="row-cols-12" href="../Planning/">
            <i class="bx bx-book-bookmark"></i>
            <span class="link_name col-9">Planning</span>
          </a>
        </div>
        <ul class="sub-menu">
          <li><a class="link_name" href="../Planning/">Planning</a></li>
        </ul>
      </li>`;
        // $("#navigationLinks").append(addString);
        $("#drLink").after(addString);
      }
    },
  );
}
//#endregion
//#region MONTH PICKERS
function initMonthPickers() {
  bindMonthPicker({
    inputSelector: "#pendingMonthSel",
    triggerSelector: ".pendingMonthCont",
    labelSelector: "#pendingMonthLabel",
    removeId: "removePendingMonth",
    defaultLabel: "Requested Month",
    onChange: filterPendingTable,
  });

  bindMonthPicker({
    inputSelector: "#actionedMonthSel",
    triggerSelector: ".actionedMonthCont",
    labelSelector: "#actionedMonthLabel",
    removeId: "removeActionedMonth",
    defaultLabel: "Requested Month",
    onChange: filterActionedTable,
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

  // force compact width based on actual content
  if (value) {
    $trigger.css({
      width: "auto",
      minWidth: "unset",
      display: "inline-flex",
    });
  } else {
    $trigger.css({
      width: "",
      minWidth: "",
      display: "inline-flex",
    });
  }
}

//#endregion

//#region GROUP FILTERS
function initGroupFilters() {
  $(document).on("change", "#pendingGroupSel", function () {
    toggleGroupActive($(this));
    filterPendingTable();
  });

  $(document).on("change", "#actionedGroupSel", function () {
    toggleGroupActive($(this));
    filterActionedTable();
  });

  toggleGroupActive($("#pendingGroupSel"));
  toggleGroupActive($("#actionedGroupSel"));
}

function toggleGroupActive($select) {
  const $wrap = $select.closest(".approval-select-wrap");
  const $rightIcon = $wrap.find(".bx-chevron-down, .bx-x").last();

  if ($select.val()) {
    $wrap.addClass("active");
    $rightIcon
      .removeClass("bx-chevron-down")
      .addClass("bx-x")
      .attr("data-clear-group", "1");
  } else {
    $wrap.removeClass("active");
    $rightIcon
      .removeClass("bx-x")
      .addClass("bx-chevron-down")
      .removeAttr("data-clear-group");
  }
}
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
//#endregion

//#region FILTER EVENTS
$(document).on("input", ".pending-search", function () {
  filterPendingTable();
});

$(document).on("input", ".actioned-search", function () {
  filterActionedTable();
});
//#endregion

//#region TABLE FILTERS
function filterPendingTable() {
  const searchValue = ($(".pending-search").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const monthValue = ($("#pendingMonthSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const groupValue = ($("#pendingGroupSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  let visibleCount = 0;

  $("#pendingApprovalTableBody tr")
    .not(".approval-empty-row")
    .each(function () {
      const $row = $(this);

      const rowGroup = ($row.data("group") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowMonth = ($row.data("month-value") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowText = $row.text().toLowerCase();

      const searchMatch = !searchValue || rowText.indexOf(searchValue) !== -1;
      const monthMatch = !monthValue || rowMonth === monthValue;
      const groupMatch = !groupValue || rowGroup === groupValue;

      if (searchMatch && monthMatch && groupMatch) {
        $row.attr("data-filter-match", "1").show();
        visibleCount++;
      } else {
        $row.attr("data-filter-match", "0").hide();
      }
    });

  toggleEmptyState("#pendingApprovalTableBody", visibleCount === 0, 4);
}

function filterActionedTable() {
  const searchValue = ($(".actioned-search").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const monthValue = ($("#actionedMonthSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  const groupValue = ($("#actionedGroupSel").val() || "")
    .toString()
    .toLowerCase()
    .trim();

  let visibleCount = 0;

  $("#actionedApprovalTableBody tr")
    .not(".approval-empty-row")
    .each(function () {
      const $row = $(this);

      const rowGroup = ($row.data("group") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowMonth = ($row.data("month-value") || "")
        .toString()
        .toLowerCase()
        .trim();

      const rowText = $row.text().toLowerCase();

      const searchMatch = !searchValue || rowText.indexOf(searchValue) !== -1;
      const monthMatch = !monthValue || rowMonth === monthValue;
      const groupMatch = !groupValue || rowGroup === groupValue;

      if (searchMatch && monthMatch && groupMatch) {
        $row.attr("data-filter-match", "1");
        visibleCount++;
      } else {
        $row.attr("data-filter-match", "0");
      }
    });

  toggleEmptyState("#actionedApprovalTableBody", visibleCount === 0, 4);
  resetActionedPagination();
}

function toggleEmptyState(tbodySelector, showEmpty, colspan) {
  const $tbody = $(tbodySelector);
  if (!$tbody.length) return;

  $tbody.find(".approval-empty-row").remove();

  if (showEmpty) {
    $tbody.append(`
      <tr class="approval-empty-row">
        <td colspan="${colspan}" class="px-4 py-10 text-center text-sm text-slate-400">
          No requests found.
        </td>
      </tr>
    `);
  }
}
//#endregion

//#region PAGINATION
$(document).on("click", "#actionedPrevPage", function () {
  if (actionedCurrentPage > 1) {
    actionedCurrentPage--;
    paginateActionedTable();
  }
});

$(document).on("click", "#actionedNextPage", function () {
  const matchedRows = $("#actionedApprovalTableBody tr")
    .not(".approval-empty-row")
    .filter(function () {
      return $(this).attr("data-filter-match") !== "0";
    }).length;

  const totalPages = Math.max(1, Math.ceil(matchedRows / actionedRowsPerPage));

  if (actionedCurrentPage < totalPages) {
    actionedCurrentPage++;
    paginateActionedTable();
  }
});

function paginateActionedTable() {
  const $allRows = $("#actionedApprovalTableBody tr").not(
    ".approval-empty-row",
  );

  const $matchedRows = $allRows.filter(function () {
    return $(this).attr("data-filter-match") !== "0";
  });

  const totalRows = $matchedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / actionedRowsPerPage));

  if (actionedCurrentPage > totalPages) {
    actionedCurrentPage = totalPages;
  }

  const startIndex = (actionedCurrentPage - 1) * actionedRowsPerPage;
  const endIndex = startIndex + actionedRowsPerPage;

  $allRows.hide();
  $matchedRows.slice(startIndex, endIndex).show();

  const visibleStart = totalRows === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(endIndex, totalRows);

  $("#actionedPaginationStart").text(visibleStart);
  $("#actionedPaginationEnd").text(visibleEnd);
  $("#actionedPaginationTotal").text(totalRows);
  $("#actionedPageIndicator").text(
    `Page ${actionedCurrentPage} of ${totalPages}`,
  );

  $("#actionedPrevPage").prop("disabled", actionedCurrentPage === 1);
  $("#actionedNextPage").prop(
    "disabled",
    actionedCurrentPage === totalPages || totalRows === 0,
  );
}

function resetActionedPagination() {
  actionedCurrentPage = 1;
  paginateActionedTable();
}
//#endregion

//#region MODALS
function initRowModals() {
  $(document).on("click", ".pending-row", function () {
    const $row = $(this);

    $("#pendingModalEmployee").text($row.data("employee") || "—");
    $("#pendingModalEmpId").text(`EMP-${$row.data("empid") || "—"}`);
    $("#pendingModalGroup").text(
      ($row.data("group") || "—").toString().toUpperCase(),
    );
    $("#pendingModalRequestedOn").text($row.data("requested-on") || "—");
    $("#pendingModalRequestedMonth").text($row.data("requested-month") || "—");

    $("#pendingAcceptBtn").attr(
      "data-request-id",
      $row.data("request-id") || "",
    );
    $("#pendingDenyBtn").attr("data-request-id", $row.data("request-id") || "");

    $("#pendingRequestModal").removeClass("hidden").addClass("flex");
  });

  $(document).on("click", ".actioned-row", function () {
    const $row = $(this);
    const status = (
      ($row.data("status") || "—").toString() || "—"
    ).toLowerCase();
    const expiringOn = $row.data("expiring-on") || "—";

    $("#actionedModalEmployee").text($row.data("employee") || "—");
    $("#actionedModalEmpId").text(`EMP-${$row.data("empid") || "—"}`);
    $("#actionedModalGroup").text(
      ($row.data("group") || "—").toString().toUpperCase(),
    );
    $("#actionedModalRequestedOn").text($row.data("requested-on") || "—");
    $("#actionedModalRequestedMonth").text($row.data("requested-month") || "—");
    $("#actionedModalStatus").text(capitalize(status));
    $("#actionedModalActionTakenOn").text($row.data("action-taken-on") || "—");
    $("#actionedModalActionTakenBy").text($row.data("action-taken-by") || "—");

    const $chip = $("#actionedModalStatusChip");
    $chip
      .removeClass(
        "modal-chip-success modal-chip-danger modal-chip-neutral modal-chip-pending",
      )
      .text(capitalize(status));

    if (status === "active") {
      $chip.addClass("modal-chip-success");
    } else if (status === "cancelled" || status === "expired") {
      $chip.addClass("modal-chip-danger");
    } else {
      $chip.addClass("modal-chip-neutral");
    }

    const $expiry = $("#actionedModalExpiringOnTop");
    const $wrap = $("#expiryTopWrap");

    // RESET EVERYTHING FIRST (non-negotiable)
    $wrap.removeClass("expiry-active expiry-expired");
    $expiry.removeClass("expiry-active expiry-expired");

    if (status === "cancelled" || status === "rejected") {
      $wrap.hide();
      $expiry.text("—");
    } else {
      $wrap.css("display", "");
      $expiry.text(expiringOn || "—");

      if (status === "expired") {
        $wrap.addClass("expiry-expired");
      } else if (status === "active") {
        $wrap.addClass("expiry-active");
      }
    }

    $("#actionedRequestModal").removeClass("hidden").addClass("flex");
  });

  $(document).on("click", ".modal-close", function () {
    const target = $(this).data("close");
    $(target).removeClass("flex").addClass("hidden");
  });

  $(document).on(
    "click",
    "#pendingRequestModal, #actionedRequestModal",
    function (e) {
      if (e.target === this) {
        $(this).removeClass("flex").addClass("hidden");
      }
    },
  );

  $(document).on("click", "#pendingAcceptBtn", function () {
    const requestId = $(this).attr("data-request-id");

    if (
      !confirm(
        "Approve this request? This grants 1-day access to the user's own Daily Report only.",
      )
    ) {
      return;
    }

    console.log("ACCEPT REQUEST:", requestId);
    $("#pendingRequestModal").removeClass("flex").addClass("hidden");
  });

  $(document).on("click", "#pendingDenyBtn", function () {
    const requestId = $(this).attr("data-request-id");

    if (!confirm("Deny this request?")) {
      return;
    }

    console.log("DENY REQUEST:", requestId);
    $("#pendingRequestModal").removeClass("flex").addClass("hidden");
  });
}

function capitalize(value) {
  if (!value || value === "—") return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
//#endregion
