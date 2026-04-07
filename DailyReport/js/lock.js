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

  if (isCurrentMonth(dateString)) {
    return true;
  }

  if (isPreviousMonth(dateString)) {
    return !!AppState.empDetails.canAccessPreviousMonth;
  }

  return false;
}

function updateLockingMessage() {
  const selectedDate = $("#idDRDate").val();
  const isPrevMonth = isPreviousMonth(selectedDate);
  const canAccessPreviousMonth = !!AppState.empDetails.canAccessPreviousMonth;
  const canRequestAccess = !!AppState.empDetails.hasOverride;

  let message = `
    This Daily Report is outside the current editable month.
    You may still view the details, but changes are disabled.
  `;

  if (isPrevMonth && !canAccessPreviousMonth) {
    if (canRequestAccess) {
      message = `
        Previous-month editing is currently disabled for your account.
        You may still view the details, but changes are disabled.
      `;
    } else {
      message = `
        Previous-month editing is currently disabled for your account.
        You cannot request access. Please coordinate with your group leader.
      `;
    }
  }

  if (isPrevMonth && canAccessPreviousMonth) {
    message = `
      Previous-month access is currently active for your account.
      You may edit entries for the selected previous-month date.
    `;
  }

  $("#lockingMessage").html(message);
}
