//#region MONTH PICKER UI
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

    const $monthInput = $(config.inputSelector);
    $monthInput.val("").removeClass("active");
    $monthInput.closest(".approval-month-wrap").removeClass("active");

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

//#region STATUS FILTER UI
function initStatusFilterUI() {
  $(document).on("change", "#requestStatusSel", function () {
    toggleStatusActive($(this));
    filterMyRequestsSubmitted();
  });

  $(document).on("change", "#requestForMeStatusSel", function () {
    toggleStatusActive($(this));
    filterRequestsForMe();
  });

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

  toggleStatusActive($("#requestStatusSel"));
  toggleStatusActive($("#requestForMeStatusSel"));
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

//#region TARGET EMPLOYEE UI
function initTargetEmployeeFieldUI() {
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
  const empDetails = RequestPageState.auth.empDetails;
  const empNum = empDetails.empNum || "";
  const fullName = getEmployeeFullName(empDetails);

  const $readonlyInput = $("#requestEmployeeReadonly");

  if ($readonlyInput.length) {
    $readonlyInput.val(`${fullName}${empNum ? ` (EMP-${empNum})` : ""}`);
  }

  // keep hidden because select-based flow is now used for both roles
  $("#requestEmployeeReadonlyWrap").addClass("hidden");
}

function toggleTargetEmployeeActive($select) {
  if (!$select.length) return;

  const $wrap = $select.closest(".approval-select-wrap");
  const $rightIcon = $wrap.find(".bx-chevron-down, .bx-x").last();

  if ($select.val()) {
    $wrap.addClass("active has-clear");
    $rightIcon
      .removeClass("bx-chevron-down pointer-events-none")
      .addClass("bx-x")
      .attr("data-clear-target", "1");
  } else {
    $wrap.removeClass("active has-clear");
    $rightIcon
      .removeClass("bx-x")
      .addClass("bx-chevron-down pointer-events-none")
      .removeAttr("data-clear-target");
  }
}
//#endregion

//#region TABLE UI
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

function renderTargetGroupOptions() {
  const $groupSel = $("#targetGroupSel");
  if (!$groupSel.length) return;

  const groups = RequestPageState.form.groups || [];
  const defaultGroup = RequestPageState.form.defaultGroup || "";

  $groupSel.empty();
  $groupSel.append(`<option value="">Select group</option>`);

  groups.forEach(function (group) {
    $groupSel.append(`
      <option value="${escapeHtml(group.value)}">
        ${escapeHtml(group.label)}
      </option>
    `);
  });

  if (defaultGroup) {
    $groupSel.val(defaultGroup);
  }

  const hasOverride = hasOverridePermission(RequestPageState.auth.empDetails);

  if (hasOverride) {
    $groupSel.prop("disabled", false);
    $("#targetGroupWrap").removeClass("hidden");
  } else {
    $groupSel.prop("disabled", true);
    $("#targetGroupWrap").removeClass("hidden");
  }
}

function renderTargetEmployeeOptions(groupId) {
  const $employeeSel = $("#targetEmployeeSel");
  if (!$employeeSel.length) return;

  const employeesByGroup = RequestPageState.form.employeesByGroup || {};
  const employees = employeesByGroup[groupId] || [];
  const defaultEmployeeId = RequestPageState.form.defaultEmployeeId || "";

  $employeeSel.empty();
  $employeeSel.append(`<option value="">Select employee</option>`);

  employees.forEach(function (employee) {
    $employeeSel.append(`
      <option
        value="${escapeHtml(employee.value)}"
        data-name="${escapeHtml(employee.label)}"
      >
        ${escapeHtml(employee.label)}
      </option>
    `);
  });

  if (defaultEmployeeId && employees.some((emp) => String(emp.value) === String(defaultEmployeeId))) {
    $employeeSel.val(defaultEmployeeId);
  } else if (employees.length === 1) {
    $employeeSel.val(employees[0].value);
  }

  const hasOverride = hasOverridePermission(RequestPageState.auth.empDetails);

  if (hasOverride) {
    $employeeSel.prop("disabled", false);
    $("#targetEmployeeWrap").removeClass("hidden");
    $("#requestEmployeeReadonlyWrap").addClass("hidden");
  } else {
    $employeeSel.prop("disabled", true);
    $("#targetEmployeeWrap").removeClass("hidden");
    $("#requestEmployeeReadonlyWrap").addClass("hidden");
  }

  toggleTargetEmployeeActive($employeeSel);
}

function setupRequestFormSelectors() {
  renderTargetGroupOptions();
  toggleTargetGroupActive($("#targetGroupSel"));

  const selectedGroup =
    $("#targetGroupSel").val() || RequestPageState.form.defaultGroup || "";

  renderTargetEmployeeOptions(selectedGroup);
}
function initTargetGroupFieldUI() {
  $(document).on("change", "#targetGroupSel", function () {
    toggleTargetGroupActive($(this));
  });

  $(document).on(
    "click",
    ".approval-select-wrap i[data-clear-group='1']",
    function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $wrap = $(this).closest(".approval-select-wrap");
      const $select = $wrap.find("select");

      $select.val("");
      toggleTargetGroupActive($select);

      renderTargetEmployeeOptions("");
    },
  );
}

function toggleTargetGroupActive($select) {
  if (!$select.length) return;

  const $wrap = $select.closest(".approval-select-wrap");
  const $rightIcon = $wrap.find(".bx-chevron-down, .bx-x").last();

  if ($select.val()) {
    $wrap.addClass("active has-clear");
    $rightIcon
      .removeClass("bx-chevron-down pointer-events-none")
      .addClass("bx-x")
      .attr("data-clear-group", "1");
  } else {
    $wrap.removeClass("active has-clear");
    $rightIcon
      .removeClass("bx-x")
      .addClass("bx-chevron-down pointer-events-none")
      .removeAttr("data-clear-group");
  }
}

function applyRequestMonthLimit() {
  const $monthInput = $("#requestCreateMonthSel");
  if (!$monthInput.length) return;

  $monthInput.attr("max", getPreviousMonthValue());
}