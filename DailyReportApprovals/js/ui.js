//#region LOADER
function showLoader() {
  $(".cs-loader").stop(true, true).show();
}

function hideLoader() {
  $(".cs-loader").fadeOut(300);
}
//#endregion

//#region MODALS
function openModal(selector) {
  $(selector).removeClass("hidden").addClass("flex");
}

function closeModal(selector) {
  $(selector).removeClass("flex").addClass("hidden");
}

function closeAllModals() {
  closeModal("#pendingRequestModal");
  closeModal("#actionedRequestModal");
}
//#endregion

//#region EMPTY STATE
function renderEmptyRow(colspan, message) {
  return `
    <tr class="approval-empty-row">
      <td colspan="${colspan}" class="px-4 py-10 text-center text-sm text-slate-400">
        ${escapeHtml(message || "No requests found.")}
      </td>
    </tr>
  `;
}
//#endregion

//#region MONTH PICKER UI
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
    const parts = value.split("-");
    const year = parts[0];
    const month = parts[1];

    if (year && month) {
      const monthDate = new Date(year, parseInt(month, 10) - 1, 1);
      const monthName = monthDate.toLocaleString("en-US", { month: "long" });

      $monthInput.addClass("active");
      $trigger.addClass("active");
      $wrap.addClass("active");
      display = `${monthName} ${year}`;
      iconHtml = `<i class="bx bx-x text-[18px] shrink-0 month-arrow" id="${config.removeId}"></i>`;
    }
  }

  $trigger.html(`
    <i class="bx bx-calendar shrink-0 month-icon opacity-75"></i>
    <span id="${config.labelSelector.replace("#", "")}" class="whitespace-nowrap text-[13px] month-text">${escapeHtml(display)}</span>
    ${iconHtml}
  `);

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
//#endregion