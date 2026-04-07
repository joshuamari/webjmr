function getTodayLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthYearLabel(dateString) {
  if (!dateString) return "Selected Month";

  const selectedDate = new Date(dateString + "T00:00:00");
  return selectedDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getYearMonth(dateString) {
  if (!dateString || typeof dateString !== "string" || dateString.length < 7) {
    return "";
  }

  return dateString.slice(0, 7);
}

function setLockedState(isLocked) {
  const lockTargets = [
    "#idGroup",
    "#idLocation",
    "#idProject",
    "#idItem",
    "#idJRD",
    "#idTOW",
    "#idChecking",
    "#getHour",
    "#getMin",
    "#idMH",
    "#idRemarks",
    "#idAdd",
    "#idReset",
    "#idCopyDate",
    "#idCopy",
    "#searchproj",
    "#searchitem",
    "#searchjrd",
    "#idRev",
    "#towDesc",
    "#trGroup",
  ];

  if (isLocked) {
    $("#lockingOverlay").removeClass("hidden");

    lockTargets.forEach((selector) => {
      $(selector).prop("disabled", true);
    });

    $("#idCopyDate").val("");

    $("#drEntries")
      .find(".selectBut, .edit, .delBut, button[edit-entry]")
      .prop("disabled", true)
      .addClass("disabled");
  } else {
    $("#lockingOverlay").addClass("hidden");

    lockTargets.forEach((selector) => {
      $(selector).prop("disabled", false);
    });

    $("#drEntries")
      .find(".selectBut, .edit, .delBut, button[edit-entry]")
      .prop("disabled", false)
      .removeClass("disabled");

    sequenceValidation();
    MHValidation().catch((error) => {
      console.error("MHValidation failed in setLockedState:", error);
    });

    const projID = $($("#idProject").find("option:selected")).attr("proj-id");
    const itemID = $($("#idItem").find("option:selected")).attr("item-id");

    if (projID) {
      disableTimeInput(projID);
    }

    if (projID && itemID) {
      disableInputs(projID, itemID);
    }
  }
}

function updateLockedMonthLabel() {
  const selectedDate = $("#idDRDate").val();
  $("#lockedMonthLabel").text(getMonthYearLabel(selectedDate));
}

function evaluateMonthLock() {
  const selectedDate = $("#idDRDate").val();

  updateLockedMonthLabel();
  updateLockingMessage();

  if (!selectedDate) {
    setLockedState(true);
    return true;
  }

  const locked = !canEditSelectedDate(selectedDate);
  setLockedState(locked);

  return locked;
}

function getPHNowParts() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value;

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function parseYMDLocal(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
}

function isCurrentMonth(dateString) {
  const selected = parseYMDLocal(dateString);
  if (!selected) return false;

  const phNow = getPHNowParts();

  return selected.year === phNow.year && selected.month === phNow.month;
}

function isPreviousMonth(dateString) {
  const selected = parseYMDLocal(dateString);
  if (!selected) return false;

  const phNow = getPHNowParts();

  if (selected.year < phNow.year) return true;

  if (selected.year === phNow.year && selected.month < phNow.month) {
    return true;
  }

  return false;
}

function canEditSelectedDate(dateString) {
  if (!dateString) return false;

  const canAccessAllMonths = !!AppState.empDetails.canAccessAllMonths;
  const canAccessPreviousMonth = !!AppState.empDetails.canAccessPreviousMonth;
  const accessibleRequestedMonth =
    AppState.empDetails.accessibleRequestedMonth || "";

  if (isCurrentMonth(dateString)) {
    return true;
  }

  if (!isPreviousMonth(dateString)) {
    return false;
  }

  if (canAccessAllMonths) {
    return true;
  }

  if (!canAccessPreviousMonth) {
    return false;
  }

  return getYearMonth(dateString) === accessibleRequestedMonth;
}

function updateLockingMessage() {
  const selectedDate = $("#idDRDate").val();
  const selectedYearMonth = getYearMonth(selectedDate);

  const isPastMonth = isPreviousMonth(selectedDate);
  const canRequestAccess = !!AppState.empDetails.hasOverride;
  const canAccessAllMonths = !!AppState.empDetails.canAccessAllMonths;
  const canAccessPreviousMonth = !!AppState.empDetails.canAccessPreviousMonth;
  const accessibleRequestedMonth =
    AppState.empDetails.accessibleRequestedMonth || "";

  let message = `
    This Daily Report is outside the current editable month.
    You may still view the details, but changes are disabled.
  `;

  if (isPastMonth && canAccessAllMonths) {
    message = `
      Past-month access is currently active for your account.
      You may edit entries for the selected date.
    `;
  } else if (isPastMonth && canAccessPreviousMonth) {
    if (
      accessibleRequestedMonth &&
      selectedYearMonth === accessibleRequestedMonth
    ) {
      message = `
        Temporary access is currently active for your account.
        You may edit entries for ${getMonthYearLabel(selectedDate)} only.
      `;
    } else {
      if (canRequestAccess) {
        message = `
          Your temporary access does not cover ${getMonthYearLabel(selectedDate)}.
          You may still view the details, but changes are disabled.
        `;
      } else {
        message = `
          Your temporary access does not cover ${getMonthYearLabel(selectedDate)}.
          You cannot request access. Please coordinate with your group leader.
        `;
      }
    }
  } else if (isPastMonth && !canAccessPreviousMonth) {
    if (canRequestAccess) {
      message = `
        Past-month editing is currently disabled for your account.
        You may still view the details, but changes are disabled.
      `;
    } else {
      message = `
        Past-month editing is currently disabled for your account.
        You cannot request access. Please coordinate with your group leader.
      `;
    }
  }

  $("#lockingMessage").html(message);
}