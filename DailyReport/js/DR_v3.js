//#region GLOBALS
const AppState = {
  empDetails: {},
  editID: "",
  regCount: 0,
  otCount: 0,
  lvCount: 0,

  defaults: [],
  leaveID: null,
  otherID: null,
  mngID: null,
  kiaID: null,
  solProjID: null,
  trainProjID: null,
  noMoreInputItems: [],
  oneBUTrainerID: null,

  kdtwAccess: [],
  managementPositions: [],
  devs: [],
};
let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const rootFolder = `//${document.location.hostname}`;
//#endregion

//#region API CALLS
function getMyGroups() {
  $("#idGroup").html(`<option value="" hidden>Select Group</option>`);

  return postJson(
    "api/get_my_groups.php",
    {
      empNum: AppState.empDetails.empNum,
    },
    "Failed to load groups.",
  )
    .then((response) => {
      let groups = response.data || [];
      const groupSelect = $("#idGroup");

      groupSelect.html(
        `<option selected hidden value="0" grp-id="0">Select Group</option>`,
      );

      if (groups.length > 1) {
        groups = groups.sort(function (a, b) {
          const first = a.abbreviation.toUpperCase();
          const second = b.abbreviation.toUpperCase();
          return first < second ? -1 : first > second ? 1 : 0;
        });
      }

      $.each(groups, function (_index, item) {
        const option = $("<option>")
          .attr("value", item.id)
          .text(item.abbreviation)
          .attr("grp-id", item.id);

        groupSelect.append(option);
      });

      return groups;
    })
    .catch((error) => {
      console.error(error);
      alert(error);
      return [];
    });
}
function getDispatchLoc() {
  return postJson(
    "api/get_dispatch_loc.php",
    {},
    "Failed to load dispatch locations.",
  ).then((response) => {
    const locations = response.data || [];
    fillDispatchLocations(locations);
    return locations;
  });
}
function getTOW(projID) {
  $("#idTOW").prop("selectedIndex", 0);
  $("#idChecking").prop("selectedIndex", 0);
  $("#forChecking").hide();

  if (!projID) {
    resetTOWOptions();
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_tow.php",
    { projID },
    "An unspecified error occurred while fetching Types of Work.",
  ).then((response) => {
    const tows = response.data || [];
    fillTOWOptions(tows);
    return tows;
  });
}
function fetchProjects({ searchProj = "" } = {}) {
  const empGroup = $("#idGroup").val();

  if (!empGroup) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_projects.php",
    {
      empGroup: empGroup,
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      searchProj: searchProj,
    },
    "An unspecified error occurred while fetching Projects.",
  ).then((response) => response.data || []);
}
function getItems(projID) {
  $("#itemOptions").empty();
  $("#idItem").html(`<option value="" hidden>Select Item of Works</option>`);
  $("#labell").remove();

  if (!projID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_items.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
    },
    "An unspecified error occurred while fetching Items.",
  ).then((response) => {
    const items = response.data || [];
    sequenceValidation();
    return items;
  });
}
function getItemSearch(projID) {
  $("#itemOptions").empty();

  if (!projID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_items.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
      searchIOW: $("#searchitem").val(),
    },
    "An unspecified error occurred while fetching Items Search.",
  ).then((response) => response.data || []);
}
function getJobs(projID, itemID) {
  $("#jrdOptions").empty();
  $("#idJRD").html(
    `<option value="" hidden>Select Job Request Description</option>`,
  );

  if (!projID || !itemID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_jobs.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
      itemID: itemID,
    },
    "An unspecified error occurred while fetching Jobs.",
  ).then((response) => {
    const jobs = response.data || [];
    sequenceValidation();

    if (projID == AppState.mngID || projID == AppState.kiaID) {
      $($("#idJRD").children()[1]).prop("selected", true).change();
    }

    return jobs;
  });
}
function getJRDSearch(projID, itemID) {
  $("#jrdOptions").empty();

  if (!projID || !itemID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_jobs.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
      itemID: itemID,
      searchjrd: $("#searchjrd").val(),
    },
    "An unspecified error occurred while fetching Jobs Search.",
  ).then((response) => response.data || []);
}
function isWorkDay(location) {
  const selDate = $("#idDRDate").val();
  const selLoc = location || "KDT";

  return postJson(
    "api/check_workday.php",
    {
      selDate: selDate,
      selLoc: selLoc,
    },
    "An unspecified error occurred while checking work day.",
  ).then((response) => {
    return Boolean(response.data?.isWorkday);
  });
}
function getTOWDesc(typesOfWorkID) {
  if (!typesOfWorkID || typesOfWorkID == 0) {
    $("#towDesc").html("-");
    return Promise.resolve("-");
  }

  return postJson(
    "api/get_tow_desc.php",
    { towID: typesOfWorkID },
    "An unspecified error occurred while fetching Type of Work description.",
  ).then((response) => {
    const description = response.data?.description || "-";
    $("#towDesc").html(description);
    return description;
  });
}
function getCheckers() {
  const grpNum = $("#idGroup").val();
  const projID = $("#idProject option:selected").attr("proj-id");

  if (!grpNum) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_checkers.php",
    {
      grpNum: grpNum,
      empNum: AppState.empDetails.empNum,
      projID: projID || "",
    },
    "An unspecified error occurred while fetching checkers.",
  ).then((response) => response.data || []);
}
function postJson(url, data, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: url,
      data: data,
      dataType: "json",
      success: function (response) {
        if (response && response.success === false) {
          reject(response.message || fallbackMessage);
          return;
        }

        resolve(response);
      },
      error: function (xhr, status, error) {
        let message = fallbackMessage;

        try {
          const responseJson = JSON.parse(xhr.responseText);
          message =
            responseJson.message ||
            responseJson.error ||
            responseJson.data?.message ||
            fallbackMessage;
        } catch (e) {
          if (xhr.responseText) {
            message = `${fallbackMessage}\n\n${xhr.responseText}`;
          } else if (error) {
            message = `${fallbackMessage}\n\n${error}`;
          }
        }

        console.error("POST JSON ERROR:", {
          url,
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
        });

        reject(message);
      },
    });
  });
}
function postFormData(url, formData, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      contentType: false,
      cache: false,
      processData: false,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(getAjaxErrorMessage(xhr, fallbackMessage));
      },
    });
  });
}
function getAjaxErrorMessage(xhr, fallbackMessage) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  }

  if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }

  return fallbackMessage;
}
function getStartupConfig() {
  return postJson(
    "api/get_startup_config.php",
    {},
    "Failed to load startup config.",
  );
}
function fetchEntryDetails(primaryID) {
  return postJson(
    "api/get_data_edit.php",
    { primaryID },
    "Failed to load entry.",
  );
}
//#endregion

//#region LOCK
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

  let prevMonth = phNow.month - 1;
  let prevYear = phNow.year;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  return selected.year === prevYear && selected.month === prevMonth;
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

  let message = `
    This Daily Report is outside the current editable month.
    You may still view the details, but changes are disabled.
  `;

  if (isPrevMonth && !canAccessPreviousMonth) {
    message = `
      Previous-month editing is currently disabled for your account.
      You may still view the details, but changes are disabled.
    `;
  }

  if (isPrevMonth && canAccessPreviousMonth) {
    message = `
      Previous-month access is currently active for your account.
      You may edit entries for the selected previous-month date.
    `;
  }

  $("#lockingMessage").html(message);
}
//#endregion

//#region CALENDAR FUNCTIONS
function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;
  let mhColor = "";

  $(".date").html(months[month] + " " + year);

  let days = "";

  for (let x = day; x > 0; x--) {
    const newDate = new Date(year, month - 1, prevDays - x + 1);
    if (newDate.getDay() == 0) {
      days += `<div class="day prev-date weekend ${mhColor}">${prevDays - x + 1}</div>`;
    } else {
      days += `<div class="day prev-date ${mhColor}">${prevDays - x + 1}</div>`;
    }
  }

  for (let i = 1; i <= lastDate; i++) {
    if (
      i == new Date().getDate() &&
      year == new Date().getFullYear() &&
      month == new Date().getMonth()
    ) {
      const newDate = new Date(year, month, i);
      if (newDate.getDay() == 0) {
        days += `<div class='day today active weekend ${mhColor}'>${i}</div>`;
        activeDay = i;
        getActiveDay(i);
      } else {
        days += `<div class='day today active ${mhColor}'>${i}</div>`;
        activeDay = i;
        getActiveDay(i);
      }
    } else {
      const newDate = new Date(year, month, i);
      if (newDate.getDay() == 0 || newDate.getDay() == 6) {
        days += `<div class="day weekend ${mhColor}">${i}</div>`;
      } else {
        days += `<div class="day ${mhColor}">${i}</div>`;
      }
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    const newDate = new Date(year, month + 1, j);
    if (newDate.getDay() != 6) {
      days += `<div class="day next-date ${mhColor}">${j}</div>`;
    } else {
      days += `<div class="day next-date weekend ${mhColor}">${j}</div>`;
    }
  }

  $(".days").html(days);
  addListener();
  addColors(formatDate(1 + " " + months[month] + " " + year));
}

function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

function gotoMonth() {
  const dateArr = $("#gotomonth").val().split("-");
  if (dateArr.length == 2) {
    if (dateArr[1] > 0 && dateArr[1] < 13 && dateArr[0].length == 4) {
      month = dateArr[1] - 1;
      year = dateArr[0];
      initCalendar();
      return;
    }
  }
}

function gotoday() {
  const todayy = new Date();
  month = todayy.getMonth();
  year = todayy.getFullYear();
  initCalendar();
}

function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  $(".event-day").html(dayName);
  $(".event-date").html(date + " " + months[month] + " " + year);
  getDayta(formatDate(date + " " + months[month] + " " + year));
}

function formatDate(rawDate) {
  const d = new Date(rawDate);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function addListener() {
  const days = document.querySelectorAll(".day");

  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      activeDay = Number(e.target.innerHTML);

      days.forEach((day) => {
        day.classList.remove("active");
      });

      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

async function getDayta(rawDate) {
  $("#pHoursTable").empty();

  try {
    const [projHours, mhData] = await Promise.all([
      getDayData(rawDate),
      getMhDayData(rawDate),
    ]);

    if (projHours.length > 0) {
      projHours.forEach(fillDayta);
    } else {
      $("#pHoursTable").html(
        "<tr><td colspan='2' class='text-center'>No entries found</td></tr>",
      );
    }

    $("#msvReg").html(Number(mhData.reg || 0).toFixed(2));
    $("#msvOt").html(Number(mhData.ot || 0).toFixed(2));
    $("#msvLv").html(Number(mhData.lv || 0).toFixed(2));
    $("#msvAms").html(Number(mhData.ams || 0).toFixed(2));
  } catch (error) {
    console.error("Failed to load day data:", error);
    $("#pHoursTable").html(
      "<tr><td colspan='2' class='text-center'>Failed to load entries</td></tr>",
    );

    $("#msvReg").html("0.00");
    $("#msvOt").html("0.00");
    $("#msvLv").html("0.00");
    $("#msvAms").html("0.00");
  }
}
function getDayData(getDate) {
  return postJson(
    "api/get_day_data.php",
    {
      getDate: getDate,
      empNum: AppState.empDetails.empNum,
    },
    "Failed to load day data.",
  ).then((response) => response.data || []);
}

function getMhDayData(getDate) {
  return postJson(
    "api/get_mh_dayta.php",
    {
      getDate: getDate,
      empNum: AppState.empDetails.empNum,
    },
    "Failed to load manhour day data.",
  ).then((response) => response.data || { reg: 0, ot: 0, lv: 0, ams: 0 });
}
function fillDayta(projectData) {
  const projectName = projectData.projectName || "";
  const projectHours = Number(projectData.projectHours || 0).toFixed(2);
  const projectDeleted = Number(projectData.projectDeleted || 0);

  const deletedLabel =
    projectDeleted === 1 ? "<strong>(Deleted)</strong> " : "";

  $("#pHoursTable").append(`
    <tr>
      <td>${deletedLabel}${projectName}</td>
      <td>${projectHours}</td>
    </tr>
  `);
}

async function addColors(currentMonth) {
  try {
    const response = await postJson(
      "api/get_date_colors.php",
      {
        curMonth: currentMonth,
        empNum: AppState.empDetails.empNum,
      },
      "Failed to load calendar colors.",
    );

    const greenDates = response.data?.greenDates || [];
    const redDates = response.data?.redDates || [];
    const holidates = response.data?.monthHolidays || [];

    greenDates.forEach((dateString) => {
      applyDayClassByDate(currentMonth, dateString, "green", "red");
    });

    redDates.forEach((dateString) => {
      applyDayClassByDate(currentMonth, dateString, "red", "green");
    });

    holidates.forEach((holidayEntry) => {
      const [holidayDate, holidayName] = holidayEntry.split("||");
      applyHolidayByDate(currentMonth, holidayDate, holidayName);
    });
  } catch (error) {
    console.error("Failed to add calendar colors:", error);
  }
}

function applyDayClassByDate(
  currentMonth,
  dateString,
  addClassName,
  removeClassName,
) {
  const parts = dateString.split("-");
  const month = Number(parts[1]);
  const day = parseInt(parts[2], 10);
  const currentMonthDate = new Date(currentMonth);
  const visibleMonth = currentMonthDate.getMonth() + 1;

  if (month > visibleMonth) {
    $(`.day.next-date:contains(${day})`)
      .addClass(addClassName)
      .removeClass(removeClassName);
    return;
  }

  if (month < visibleMonth) {
    $(`.day.prev-date:contains(${day})`)
      .addClass(addClassName)
      .removeClass(removeClassName);
    return;
  }

  $(".day")
    .not(".next-date")
    .not(".prev-date")
    .filter(function () {
      return $(this).text() === `${day}`;
    })
    .addClass(addClassName)
    .removeClass(removeClassName);
}

function applyHolidayByDate(currentMonth, holidayDate, holidayName) {
  const parts = holidayDate.split("-");
  const month = Number(parts[1]);
  const day = parseInt(parts[2], 10);
  const currentMonthDate = new Date(currentMonth);
  const visibleMonth = currentMonthDate.getMonth() + 1;

  if (month > visibleMonth) {
    $(`.day.next-date:contains(${day})`)
      .addClass("holiday")
      .prop("title", holidayName);
    return;
  }

  if (month < visibleMonth) {
    $(`.day.prev-date:contains(${day})`)
      .addClass("holiday")
      .prop("title", holidayName);
    return;
  }

  $(".day")
    .not(".next-date")
    .not(".prev-date")
    .filter(function () {
      return $(this).text() === `${day}`;
    })
    .addClass("holiday")
    .prop("title", holidayName);
}
//#endregion

//#region UI
function fillProj(projects) {
  $.each(projects, function (_, project) {
    const optionListItem = `
      <li proj-id="${project.projID}">${project.projName}${project.groupAppend}</li>
    `;

    const selectOption = `
      <option hidden proj-id="${project.projID}">${project.projName}${project.groupAppend}</option>
    `;

    $("#projOptions").append(optionListItem);
    $("#idProject").append(selectOption);
  });
}
function fillItem(items) {
  $.each(items, function (_, item) {
    const optionListItem = `
      <li item-id="${item.itemID}">${item.itemName}</li>
    `;

    const selectOption = `
      <option hidden item-id="${item.itemID}">${item.itemName}</option>
    `;

    $("#itemOptions").append(optionListItem);
    $("#idItem").append(selectOption);
  });
}
function fillJobs(jobs) {
  $.each(jobs, function (_, job) {
    const optionListItem = `
      <li job-id="${job.jobID}">${job.jobName}</li>
    `;

    const selectOption = `
      <option hidden job-id="${job.jobID}">${job.jobName}</option>
    `;

    $("#jrdOptions").append(optionListItem);
    $("#idJRD").append(selectOption);
  });
}
function fillCheckers(checks) {
  const checkSelect = $("#idChecking");

  checkSelect.html(
    `<option selected hidden value="0" chk-id="0">Select Employee</option>`,
  );

  $.each(checks, function (_, item) {
    const option = $("<option>")
      .attr("value", item.id)
      .text(item.name)
      .attr("chk-id", item.id);

    checkSelect.append(option);
  });
}
function ifSmallScreen() {
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass("close")) {
      $(".menu-two").addClass("d-none");
    } else {
      $(".menu-two").removeClass("d-none");
    }
    return;
  }

  $(".menu-two").addClass("d-none");
}
function refreshDailyReportView() {
  getEntries();
  initCalendar();
  getPlans();
}
function fillTOWOptions(tows) {
  const towSelect = $("#idTOW");

  towSelect.html(`<option value="" selected hidden>Select...</option>`);

  tows.forEach((tow) => {
    const label = `${tow.code} - ${tow.name}`;

    towSelect.append(`
      <option value="${label}" tow-id="${tow.id}">
        ${label}
      </option>
    `);
  });
}
function resetTOWOptions() {
  $("#idTOW").html(`<option value="" selected hidden>Select...</option>`);
}
function fillDispatchLocations(locations) {
  const locationSelect = $("#idLocation");

  locationSelect.html(
    `<option value="" hidden selected>Select Location</option>`,
  );

  locations.forEach((location) => {
    locationSelect.append(`
      <option value="${location.name}" loc-id="${location.id}">
        ${location.name}
      </option>
    `);
  });
}

function fillTrainingGroups(groups) {
  const groupSelect = $("#trGroup");

  groupSelect.html(`
    <option value="" hidden selected>Select Group to Train</option>
  `);

  groups.forEach((group) => {
    groupSelect.append(`
      <option value="${group.name}">${group.name}</option>
    `);
  });
}
//#endregion

//#region FORM
function sequenceValidation() {
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);

  if ($("#idItem").prop("selectedIndex") > 0) {
    $("#idJRD").prop("disabled", false);
  }

  if ($("#idProject").prop("selectedIndex") > 0) {
    $("#idItem").prop("disabled", false);
  }

  if ($("#idGroup").prop("selectedIndex") > 0) {
    $("#idProject").prop("disabled", false);
  }
}

function resetEntry() {
  clearFormFieldValues();
  resetModeButtons();
  resetFormState();
}

function resetOnGrpChange() {
  resetDependentSelectionsAfterGroupChange();
}

function setAddMode() {
  $("#idAdd").text("Add");
  $("#idReset").text("Clear");
}

function setEditMode() {
  $("#idAdd").text("Save Changes");
  $("#idReset").text("Cancel");
}

function disableTimeInput(projID) {
  $("#getHour").prop("disabled", false);
  $("#getMin").prop("disabled", false);

  if (projID == AppState.leaveID) {
    $("#getHour").prop("disabled", true);
    $("#getMin").prop("disabled", true);
  }
}

function isDrawing() {
  isEngineering();
  hasJRD();
  hasTOW();
}

function isEngineering() {
  const projID = $($("#idProject").find("option:selected")).attr("proj-id");
  const selGroup = $("#idGroup").val();

  const isDrawingEnabled =
    !AppState.defaults.includes(Number(projID)) &&
    ![10, 16].includes(Number(selGroup)) &&
    Boolean(projID);

  if (isDrawingEnabled) {
    $("#id2DDiv").removeClass("d-none");
    $("#idRevDiv").removeClass("d-none");
  } else {
    $("#id2DDiv").addClass("d-none");
    $("#idRevDiv").addClass("d-none");
  }
}

function hasJRD() {
  const projID = $($("#idProject").find("option:selected")).attr("proj-id");
  const shouldShowJRD =
    projID != AppState.leaveID && projID != AppState.otherID;

  if (shouldShowJRD) {
    $("#idJRDDiv").removeClass("d-none");
  } else {
    $("#idJRDDiv").addClass("d-none");
  }
}

function hasTOW() {
  const projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id"),
  );

  const shouldShowTOW =
    (!AppState.defaults.includes(projID) && projID) ||
    projID == AppState.leaveID;

  if (shouldShowTOW) {
    $("#idTowDiv").removeClass("d-none");
    $("#idTowDescDiv").removeClass("d-none");
  } else {
    $("#idTowDiv").addClass("d-none");
    $("#idTowDescDiv").addClass("d-none");
  }
}

function MHValidation() {
  const projID = $("#idProject option:selected").attr("proj-id");
  const selLoc = $("#idLocation").val() || "KDT";

  if (projID != AppState.leaveID) {
    $("#idMH").prop("disabled", false);

    return isWorkDay(selLoc).then((workDay) => {
      if (!workDay) {
        $("#idMH").val("Overtime");
        $("#idMH").prop("disabled", true);
        return;
      }

      if (selLoc == "WFH") {
        $("#idMH").val("Regular");
        $("#idMH").prop("disabled", true);
        return;
      }

      $("#idMH").prop("disabled", false);
    });
  }

  $("#idMH").prop("disabled", true);
  $("#idMH").val("");

  return isWorkDay(selLoc).then((workDay) => {
    if (!workDay) {
      alert("Leave disabled on holidays/weekends");
      $("#idProject").val("").change();
    }
  });
}

function disableInputs(projID, itemID) {
  $("#getHour").prop("disabled", true);
  $("#getMin").prop("disabled", true);
  $("#idMH").prop("disabled", true);
  $("#idRemarks").prop("disabled", true);
  $("#idAdd").prop("disabled", true);

  if (projID != AppState.leaveID) {
    if (!AppState.noMoreInputItems.includes(Number(itemID))) {
      $("#idRemarks").prop("disabled", false);
      $("#idAdd").prop("disabled", false);
      $("#getHour").prop("disabled", false);
      $("#getMin").prop("disabled", false);
      $("#idMH").prop("disabled", false);
    }
  } else {
    $("#idRemarks").prop("disabled", false);
    $("#idAdd").prop("disabled", false);
  }
}

function trainingGroup(itemID) {
  $(".trgrp").remove();

  if (Number(itemID) !== Number(AppState.oneBUTrainerID)) {
    return Promise.resolve([]);
  }

  $(".iow").after(`
    <div class="col-12 my-2 trgrp">
      <label for="trGroup" class="form-label">Group of Trainees</label>
      <div class="input-group">
        <select class="form-select" id="trGroup" required>
          <option value="" selected hidden>Select Group to Train</option>
        </select>
      </div>
      <span class="col-12 mt-1 alert-danger text-danger" id="p12" role="alert"></span>
    </div>
  `);

  return getTRGroups().catch((error) => {
    console.error(error);
    return [];
  });
}

function getTRGroups() {
  return postJson(
    "api/get_groups.php",
    {},
    "Failed to load training groups.",
  ).then((response) => {
    const groups = response.data || [];
    fillTrainingGroups(groups);
    return groups;
  });
}

function getLabel(itemOfWorkID) {
  return postJson(
    "api/get_label.php",
    {
      itemID: itemOfWorkID,
    },
    "Failed to load item label.",
  )
    .then((response) => {
      const label = response.data?.label || "";

      $("#labell").remove();

      if (!label.trim()) {
        return "";
      }

      $("#p5").after(`
        <span class="col-12 alert-primary text-primary" id="labell" role="alert">${label}</span>
      `);

      return label;
    })
    .catch((error) => {
      console.error(error);
      return "";
    });
}

function addEntries(addMode) {
  if (evaluateMonthLock()) {
    alert("Editing is locked for dates outside the current month.");
    return;
  }

  let tutri = $('input[name="radio"]:checked').val() || "";
  const grp = $("#idGroup").val();
  const date = $("#idDRDate").val();
  const loc = $("#idLocation option:selected").attr("loc-id");
  const proj = Number($("#idProject option:selected").attr("proj-id") || 0);
  const item = Number($("#idItem option:selected").attr("item-id") || 0);
  const trgrp = $("#trGroup option:selected").val() || "";
  const jobreq = $("#idJRD option:selected").attr("job-id") || "";
  const tow = Number($("#idTOW option:selected").attr("tow-id") || 0);

  const rawHour = $("#getHour").val();
  const rawMin = $("#getMin").val();

  const hour = Number(rawHour || 0) * 60;
  const mins = Number(rawMin || 0);
  const getDuration = String(hour + mins);

  const remarks = $("#idRemarks").val();
  const checker = $("#idChecking option:selected").attr("chk-id") || "";
  const mgaKulang = [];

  let revision = 0;
  let mhtype = $("#idMH option:selected").attr("mhid");

  if ($("#id2DDiv").hasClass("d-none")) {
    tutri = "";
  }

  if (!grp) {
    $("#p1").text("Please select group");
    $("#idGroup").addClass("border border-danger bg-err");
    mgaKulang.push("GROUP");
  }

  if (!date) {
    $("#p2").text("Please select date");
    $("#idDRDate").addClass("border border-danger bg-err");
    mgaKulang.push("DATE");
  }

  if (!loc) {
    $("#p3").text("Please select location");
    $("#idLocation").addClass("border border-danger bg-err");
    mgaKulang.push("LOCATION");
  }

  if (!proj) {
    $("#p4").text("Please select project");
    $("#idProject").addClass("border border-danger bg-err");
    mgaKulang.push("PROJECT");
  }

  if (!item) {
    $("#p5").text("Please select item of works");
    $("#idItem").addClass("border border-danger bg-err");
    mgaKulang.push("ITEM");
  }

  if (!jobreq && proj !== AppState.leaveID && proj !== AppState.otherID) {
    $("#p6").text("Please select job request description");
    $("#idJRD").addClass("border border-danger bg-err");
    mgaKulang.push("JRD");
  }

  revision =
    $("#idRev").is(":checked") && !$("#idRevDiv").hasClass("d-none") ? 1 : 0;

  if (
    !tow &&
    (!AppState.defaults.includes(proj) || proj === AppState.leaveID)
  ) {
    $("#p11").text(
      proj === AppState.leaveID
        ? "Please select day type"
        : "Please select type of work",
    );
    $("#idTOW").addClass("border border-danger bg-err");
    mgaKulang.push("TOW");
  }

  if (tow === 3 && !checker) {
    $("#p8").text("Please select member");
    $("#idChecking").addClass("border border-danger bg-err");
    mgaKulang.push("CHECKER");
  }

  if (rawHour === "" && rawMin === "") {
    $("#p9").text("Please input valid time");
    $("#getHour").addClass("border border-danger bg-err");
    $("#getMin").addClass("border border-danger bg-err");
    mgaKulang.push("ORAS");
  }

  if (hour > 1200 || hour < 0) {
    $("#p9").text("Please input valid time");
    $("#getHour").addClass("border border-danger bg-err");
    mgaKulang.push("ORAS");
  }

  if (mins > 59 || mins < 0) {
    $("#p9").text("Please input valid time");
    $("#getMin").addClass("border border-danger bg-err");
    mgaKulang.push("ORAS");
  }

  if (!mhtype && proj !== AppState.leaveID) {
    $("#p10").text("Please select manhour type");
    $("#idMH").addClass("border border-danger bg-err");
    mgaKulang.push("MHTYPE");
  }

  if (proj === AppState.leaveID) {
    mhtype = 2;
  }

  if (item === Number(AppState.oneBUTrainerID) && !trgrp) {
    $("#p12").text("Please select group to train");
    $("#trGroup").addClass("border border-danger bg-err");
    mgaKulang.push("TRGROUP");
  }

  if (mgaKulang.length > 0) {
    console.log(mgaKulang);
    return;
  }

  const fd = new FormData();
  fd.append("getTwoThree", tutri);
  fd.append("grpNum", grp);
  fd.append("getDate", date);
  fd.append("getLocation", loc);
  fd.append("getProject", proj);
  fd.append("getItem", item);
  fd.append("getTrGrp", trgrp);
  fd.append("getDescription", jobreq);
  fd.append("getType", tow);
  fd.append("getRev", revision);
  fd.append("getDuration", getDuration);
  fd.append("getMHType", mhtype);
  fd.append("getRemarks", remarks);
  fd.append("getChecking", checker);
  fd.append("addType", addMode);
  fd.append("empNum", AppState.empDetails.empNum);

  postFormData("api/add_entries.php", fd, "Failed to save entry.")
    .then(() => {
      resetEntry();
      setAddMode();
      isDrawing();
      refreshDailyReportView();
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
}
function clearFormFieldValues() {
  $(
    "#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#trGroup",
  )
    .val("")
    .change();

  $("#one").click();
  $("#idRev").prop("checked", false);
}

function clearValidationMessages() {
  $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8,#p9,#p10,#p11,#p12").text("");
}

function clearValidationStyles() {
  $(
    "#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup",
  ).removeClass("border border-danger bg-err");
}

function hideConditionalSections() {
  $(".checker").addClass("d-none");
  $("#id2DDiv").addClass("d-none");
  $("#idRevDiv").addClass("d-none");
  $(".trgrp").remove();
  $("#labell").remove();
}

function resetModeButtons() {
  setAddMode();
}

function resetProjectItemJobSelectors() {
  $("#idProject,#idItem,#idJRD,#idTOW,#trGroup").val("").change();
}

function resetFormState() {
  clearValidationMessages();
  clearValidationStyles();
  hideConditionalSections();
  sequenceValidation();
}

function resetDependentSelectionsAfterGroupChange() {
  resetProjectItemJobSelectors();
  clearValidationMessages();
  clearValidationStyles();
  hideConditionalSections();
  $("#idRev").prop("checked", false);
  sequenceValidation();
}
//#endregion

//#region ENTRIES
function addRow(entry) {
  const pId = entry.entryId;
  const loc = entry.locationName || "";
  const group = entry.groupName || "";
  const project = entry.projectName || "";
  const item = entry.itemName || "";
  const desc = entry.jobName || "";
  const hour = Number(entry.durationMinutes || 0);
  const mht = String(entry.mhType ?? 0);
  const rmrks = entry.remarks || "";
  const isDeleted = Number(entry.projectDeleted || 0) === 1;
  const tow = entry.towName || "-";

  const deletedLabel = isDeleted ? `<strong>(Deleted)</strong>` : ``;
  const mhTypes = ["Regular", "OT", "Leave"];

  switch (mht) {
    case "0":
      AppState.regCount += hour;
      break;
    case "1":
      AppState.otCount += hour;
      break;
    case "2":
      AppState.lvCount += hour;
      break;
    default:
      console.error("Unknown manhour type:", mht);
      return;
  }

  const rowHtml = `
    <tr data-entry-id="${pId}" data-mh="${mht}" title="${rmrks}">
      <td>${loc}</td>
      <td>${group}</td>
      <td>${deletedLabel}${project}</td>
      <td>${item}</td>
      <td>${desc}</td>
      <td>${tow}</td>
      <td>${(hour / 60).toFixed(2)}</td>
      <td>${mhTypes[Number(mht)] || "-"}</td>
      <td>
        <button class="btn btn-primary action selectBut" title="Duplicate Items">
          <i class="text-light bx bx-duplicate"></i>
        </button>
        <button class="btn btn-warning action edit" title="Edit" edit-entry>
          <i class="fa fa-pencil"></i>
        </button>
        <button class="btn btn-danger action delBut" title="Delete">
          <i class="text-light fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `;

  $("#drEntries").append(rowHtml);
}

function getEntries() {
  AppState.regCount = 0;
  AppState.otCount = 0;
  AppState.lvCount = 0;

  $("#drEntries").empty();

  postJson(
    "api/get_entries.php",
    {
      curDay: $("#idDRDate").val(),
      empNum: AppState.empDetails.empNum,
    },
    "Failed to load entries.",
  )
    .then((response) => {
      const entries = response.data || [];

      if (entries.length > 0) {
        entries.forEach(addRow);
      } else {
        $("#drEntries").append(`
          <tr>
            <td colspan="9" class="text-center py-5">
              <h3>No Entries Found</h3>
            </td>
          </tr>
        `);
      }

      getMHCount();
    })
    .catch((error) => {
      console.error(error);
      $("#drEntries").append(`
        <tr>
          <td colspan="9" class="text-center py-5">
            <h3>Failed to load entries</h3>
          </td>
        </tr>
      `);
    });
}

async function getMHCount() {
  const reg = AppState.regCount / 60;
  const ot = AppState.otCount / 60;
  const lv = AppState.lvCount / 60;

  let loc = "KDT";

  $("#drEntries")
    .children("tr")
    .each(function () {
      const firstCellText = $(this).children().eq(0).text();
      if (firstCellText) {
        loc = firstCellText;
      }
    });

  $("#regCount").text(reg.toFixed(2));
  $("#otCount").text(ot.toFixed(2));
  $("#lvCount").text(lv.toFixed(2));

  $("#cardReg").removeClass("new");
  $("#cardOt").removeClass("new");
  $("#cardLv").removeClass("new");

  if (loc == "WFH") {
    if (ot > 0) {
      $("#cardOt").addClass("new");
    }

    if (lv > 0) {
      $("#cardLv").addClass("new");
    }

    return;
  }

  try {
    const workDay = await isWorkDay(loc);

    if (workDay) {
      if (ot > 0 && (reg < 8 || lv > 0)) {
        $("#cardOt").addClass("new");
      }

      if (lv == 4 && reg < 4) {
        $("#cardLv").addClass("new");
      }

      if (reg > 8 || (reg > 0 && reg + lv < 8)) {
        $("#cardReg").addClass("new");
      }

      return;
    }

    if (reg > 0) {
      $("#cardReg").addClass("new");
    }

    if (lv > 0) {
      $("#cardLv").addClass("new");
    }
  } catch (error) {
    console.error("Failed to evaluate MH count workday status:", error);
  }
}

function deleteEntry(entryId) {
  if (evaluateMonthLock()) {
    alert("Deleting is locked for dates outside the current month.");
    return;
  }

  postJson("api/delete_entry.php", { trID: entryId }, "Failed to delete entry.")
    .then(() => {
      refreshDailyReportView();
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
}

function populateBaseFields(entryData) {
  $(`#idLocation option[loc-id="${entryData.locationId}"]`)
    .prop("selected", true)
    .change();

  $("#idGroup").val(entryData.groupId);
  $("#idRemarks").val(entryData.remarks);
}

async function populateProjectSection(entryData) {
  const projects = await fetchProjects();

  resetProjectOptions();
  fillProj(projects);
  sequenceValidation();

  $(`#idProject option[proj-id="${entryData.projectId}"]`).prop(
    "selected",
    true,
  );

  isDrawing();
}

async function populateItemAndJobSection(entryData) {
  const [items, checks] = await Promise.all([
    getItems(entryData.projectId),
    getCheckers(),
    Promise.resolve(getTOW(entryData.projectId)),
  ]);

  fillItem(items);
  fillCheckers(checks);

  $(`#idItem option[item-id="${entryData.itemId}"]`).prop("selected", true);

  const jobs = await getJobs(entryData.projectId, entryData.itemId);
  fillJobs(jobs);

  $(`#idJRD option[job-id="${entryData.jobId}"]`).prop("selected", true);

  if (
    Number(entryData.itemId) === Number(AppState.oneBUTrainerID) &&
    entryData.trainingGroupId
  ) {
    trainingGroup(entryData.itemId);
    $("#trGroup").val(entryData.trainingGroupId);
  }

  $(`#idTOW option[tow-id="${entryData.towId}"]`)
    .prop("selected", true)
    .change();

  getTOWDesc(entryData.towId);

  if (entryData.checkerId != null && entryData.checkerId !== "") {
    $(`#idChecking option[chk-id="${entryData.checkerId}"]`)
      .prop("selected", true)
      .change();
  }
}

async function populateRemainingFields(entryData) {
  const durationMinutes = Number(entryData.durationMinutes || 0);

  $("#getHour").val(Math.floor(durationMinutes / 60));
  $("#getMin").val(durationMinutes % 60);

  disableTimeInput(entryData.projectId);
  await MHValidation();

  $(`#idMH option[mhid="${entryData.mhTypeId}"]`)
    .prop("selected", true)
    .change();

  if (entryData.twoThreeId != null && entryData.twoThreeId !== "") {
    $(`#${entryData.twoThreeId}`).click();
  }

  if (Number(entryData.isRevision) === 1) {
    $("#idRev").click();
  }
}

async function loadEntryToForm(response) {
  const entryData = response.data;

  populateBaseFields(entryData);
  await populateProjectSection(entryData);
  await populateItemAndJobSection(entryData);
  await populateRemainingFields(entryData);
}

function editEntry(currentObject) {
  if (evaluateMonthLock()) {
    alert("Editing is locked for dates outside the current month.");
    return;
  }

  setEditMode();
  $("#idLocation").val("");
  $(".trgrp").remove();

  AppState.editID = $(currentObject).closest("tr").data("entry-id");

  fetchEntryDetails(AppState.editID)
    .then(loadEntryToForm)
    .catch((error) => {
      console.error("Failed to load entry for edit:", error);
      alert("Failed to load entry.");
    });
}

function selectEntry(currentObject) {
  if (evaluateMonthLock()) {
    alert("Duplicating entries is locked for dates outside the current month.");
    return;
  }

  const selectID = $(currentObject).closest("tr").data("entry-id");

  fetchEntryDetails(selectID)
    .then(loadEntryToForm)
    .then(() => {
      setAddMode();
    })
    .catch((error) => {
      console.error("Failed to load entry for duplicate:", error);
      alert("Failed to load entry.");
    });
}

function copyEntries() {
  if (evaluateMonthLock()) {
    alert("Copy is disabled for dates outside the current month.");
    return;
  }

  const getDate = $("#idDRDate").val();
  const copyDate = $("#idCopyDate").val();

  postJson(
    "api/copy_entries.php",
    {
      empNum: AppState.empDetails.empNum,
      getDate: getDate,
      copyDate: copyDate,
    },
    "Failed to copy entries.",
  )
    .then(() => {
      resetEntry();
      refreshDailyReportView();
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
}

function saveFunction() {
  addEntries(AppState.editID);
}

function cancelEditFunction() {
  setAddMode();
  resetEntry();
}
//#endregion

//#region PLANNING
function bindPlanningEvents() {
  $(document).on("click", ".planEntries", handlePlanEntryClick);
  $(document).on("click", ".planned .header", handlePlanningHeaderClick);
}
function handlePlanEntryClick() {
  $("#drPlanning").modal("show");

  const planID = $(this).attr("plan-id");
  getDeets(planID);
}
function handlePlanningHeaderClick() {
  $(".planned").toggleClass("open");

  if ($(".planned").hasClass("open")) {
    $(".right-cont .table-container").css("height", "calc(100% - 500px)");
    $(".planned .header small").html(
      `<i class="bx bx-info-circle"></i>Please click each
row to see more details about the item.`,
    );
  } else {
    $(".right-cont .table-container").css("height", "calc(100% - 248px)");
    $(".planned .header")
      .find("small")
      .html(
        `<i class="bx bx-info-circle"></i>Please click here to toggle this collapsible element.`,
      );
  }
}
function getPlans() {
  const selectedDate = $("#idDRDate").val();
  const emptyState = `<tr><td colspan="6" class="text-center">No Entries Found</td></tr>`;

  $("#plannedItems").empty();

  postJson(
    "api/get_plans.php",
    {
      getEmployee: AppState.empDetails.empNum,
      selDate: selectedDate,
    },
    "Failed to load plans.",
  )
    .then((response) => {
      const plans = response.data || [];

      if (plans.length === 0) {
        $("#plannedItems").html(emptyState);
        return;
      }

      plans.forEach(fillPlans);
    })
    .catch((error) => {
      console.error(error);
      $("#plannedItems").html(
        `<tr><td colspan="6" class="text-center">Failed to load plans</td></tr>`,
      );
    });
}
function fillPlans(plan) {
  const row = `
    <tr class="planEntries" plan-id="${plan.planID}">
      <td>${plan.projName || ""}</td>
      <td>${plan.projItem || ""}</td>
      <td>${plan.projJob || ""}</td>
      <td>${Number(plan.projMH || 0).toFixed(2)}</td>
      <td>${Number(plan.usedHours || 0).toFixed(2)}</td>
    </tr>
  `;

  $("#plannedItems").append(row);
}
function getDeets(planID) {
  return postJson(
    "api/get_deets.php",
    {
      planID: planID,
      empID: AppState.empDetails.empNum,
    },
    "Failed to load planning details.",
  )
    .then((response) => {
      const details = response.data || [];
      details.forEach(fillEditPlan);
      return details;
    })
    .catch((error) => {
      console.error(error);
      alert(error);
      return [];
    });
}
function fillEditPlan(details) {
  if (!details) return;

  const projStatus = details.projStatus || "";
  const statusBadge =
    projStatus.length > 0
      ? `<span class="badge text-bg-success fs-5">${projStatus}</span>`
      : `<span class="badge text-bg-warning fs-5">Ongoing</span>`;

  $("#projectPlan").val(details.projName || "");
  $("#itemPlan").val(details.projItem || "");
  $("#jrdPlan").val(details.projJob || "");
  $("#sDatePlan").val(details.projStart || "");
  $("#eDatePlan").val(details.projEnd || "");
  $("#mhPlan").val(Number(details.hoursRemaining || 0).toFixed(2));
  $("#statusPlan").html(statusBadge);
  $("#plannerPlan").val(details.planner || "");
  $("#plannerDatePlan").val(details.plannedDate || "");
  $("#modifiedPlan").val(details.plannedModified || "");
}
function planAccess() {
  return postJson(
    "api/plan_access.php",
    {
      empNum: AppState.empDetails.empNum,
    },
    "Failed to check planning access.",
  )
    .then((response) => {
      const hasAccess = Boolean(response.data?.hasAccess);

      if (!hasAccess) {
        return false;
      }

      const navItem = `
        <li>
          <div class="iocn-link">
            <a class="row-cols-12" href="../Planning/">
              <i class="bx bx-book-bookmark"></i>
              <span class="link_name col-9">Planning</span>
            </a>
          </div>
          <ul class="sub-menu">
            <li><a class="link_name" href="../Planning/">Planning</a></li>
          </ul>
        </li>
      `;

      $("#drLink").after(navItem);
      return true;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
}
//#endregion

//#region EVENT FORMS
function bindFormEvents() {
  $(document).on("change", "#idTOW", handleTowChange);
  $(document).on("change", "#idGroup", handleGroupChange);
  $(document).on("change", "#idProject", handleProjectChange);
  $(document).on("change", "#idItem", handleItemChange);
  $(document).on("change", "#idLocation", handleLocationChange);
  $(document).on("change", "#idMH", handleMhChange);
  $(document).on("change", "#idJRD", handleJrdChange);
  $(document).on("change", "#trGroup", handleTrainingGroupChange);

  $(document).on("click", "#idAdd", handleAddClick);
  $(document).on("click", "#idReset", handleResetClick);
  $(document).on("click", "#idCopy", handleCopyClick);
  $(document).on("click", "#refBtn", handleRefreshClick);
  $(document).on("click", ".delBut", handleDeleteClick);
  $(document).on("click", "button[edit-entry]", handleEditClick);
  $(document).on("click", ".selectBut", handleSelectClick);
  $(document).on("click", "#back2Project", handleBackToProjectClick);
  $(document).on(
    "click",
    "#drInstruction .btn-close",
    handleDrInstructionClose,
  );
}
function handleTowChange() {
  const towVal = $("#idTOW option:selected").attr("tow-id");

  if (this.value == "Chk - Checker") {
    $(".checker").removeClass("d-none");
  } else {
    $(".checker").addClass("d-none");
  }

  $("#idChecking").prop("selectedIndex", 0);

  if (towVal == 10 || towVal == 11) {
    $("#getHour").val("4");
  }

  if (towVal == 12) {
    $("#getHour").val("8");
  }

  getTOWDesc(towVal);
  $("#p11").text("");
  $(this).removeClass("border-danger");
}

function handleGroupChange() {
  resetOnGrpChange();

  fetchProjects().then((projects) => {
    resetProjectOptions();
    fillProj(projects);
    sequenceValidation();
  });

  $("#p1").text("");
  $("#idGroup").removeClass("border-danger");
  $(".iow").removeClass("active");
}

function handleProjectChange() {
  const projID = $("#idProject option:selected").attr("proj-id");

  $("#idJRD").val("");
  $("#idItem").val(null).change();

  if ($("#idItem").val() == null || $("#idItem").val() == "") {
    $("#idItem")
      .empty()
      .append(
        `<option selected hidden disabled value="">Select Item of Works</option>`,
      );
  }

  Promise.all([getItems(projID), getTOW(projID), getCheckers()])
    .then(([items, _towHtml, checks]) => {
      fillItem(items);
      fillCheckers(checks);

      isDrawing();
      disableTimeInput(projID);
      MHValidation().catch((error) => {
        console.error(error);
        alert(error);
      });

      $(".iow").removeClass("active");
      $(".trgrp").remove();

      $("#p4").text("");
      $("#idProject").removeClass("border-danger");

      if (projID == AppState.leaveID) {
        $("#itemlbl").html("Leave Type");
        $("#lbltow").html("Day Type");
      } else {
        $("#itemlbl").html("Item of Works");
        $("#lbltow").html("Type of Work");
      }
    })
    .catch((error) => {
      console.error("Failed during project change:", error);
      alert(error);
    });
}

async function handleItemChange() {
  const projID = $("#idProject option:selected").attr("proj-id");
  const itemID = Number($("#idItem option:selected").attr("item-id"));

  $(".trgrp").remove();
  $("#labell").remove();

  if (!projID || !itemID) {
    return;
  }

  getLabel(itemID);
  disableInputs(projID, itemID);
  if (AppState.noMoreInputItems.includes(itemID)) {
    $("#drInstruction").modal("show");
  }

  await trainingGroup(itemID);

  getJobs(projID, itemID).then((jobs) => {
    fillJobs(jobs);
  });

  $("#p5").text("");
  $("#idItem").removeClass("border-danger");
}

function handleLocationChange() {
  MHValidation().catch((error) => {
    console.error(error);
    alert(error);
  });

  $("#p3").text("");
  $("#idLocation").removeClass("border-danger");
}

function handleMhChange() {
  $("#p10").text("");
  $("#idMH").removeClass("border-danger");
}

function handleJrdChange() {
  $("#p6").text("");
  $("#idJRD").removeClass("border-danger");
}

function handleTrainingGroupChange() {
  $("#p12").text("");
  $("#trGroup").removeClass("border border-danger bg-err");
}

function handleAddClick() {
  switch ($("#idAdd").text().trim()) {
    case "Add":
      addEntries(0);
      break;
    case "Save Changes":
      saveFunction();
      break;
  }
}

function handleResetClick() {
  if ($("#idReset").text().trim() == "Clear") {
    resetEntry();
  } else {
    cancelEditFunction();
  }
}

function handleCopyClick() {
  if (!confirm("Confirm copy entries")) {
    return;
  }

  copyEntries();
}

function handleRefreshClick() {
  getEntries();
}

function handleDeleteClick() {
  const entryId = $(this).closest("tr").data("entry-id");

  if (!entryId) {
    console.error("Missing entry id for delete.");
    return;
  }

  if (!confirm("Delete this entry?")) {
    return;
  }

  deleteEntry(entryId);
}

function handleEditClick() {
  editEntry(this);
}

function handleSelectClick() {
  setAddMode();
  selectEntry(this);
}

function handleBackToProjectClick() {
  $("#drInstruction").modal("hide");
  $("#idItem").val(null).change();
}

function handleDrInstructionClose() {
  $("#back2Project").click();
}
//#endregion

//#region EVENT CALENDAR
function bindCalendarEvents() {
  $(document).on("change", "#idDRDate", handleDateChange);
  $(document).on("click", ".prev", handlePrevMonthClick);
  $(document).on("click", ".next", handleNextMonthClick);
  $(document).on("change", "#gotomonth", handleGotoMonthChange);
  $(document).on("click", ".today-btn", handleTodayClick);
  $(document).on("click", ".day", handleDayClick);
  $(document).on("click", "#btnGoCurrentMonth", handleGoCurrentMonthClick);
}
function handleDateChange() {
  const isLocked = evaluateMonthLock();

  getEntries();
  getPlans();

if (!isLocked) {
  MHValidation().catch((error) => {
    console.error(error);
    alert(error);
  });
  sequenceValidation();
}
}

function handlePrevMonthClick() {
  prevMonth();
  $("#gotomonth").val("");
}

function handleNextMonthClick() {
  nextMonth();
  $("#gotomonth").val("");
}

function handleGotoMonthChange() {
  gotoMonth();
}

function handleTodayClick() {
  gotoday();
  $("#gotomonth").val("");
}

function handleDayClick() {
  $(".day").each(function () {
    $(this).removeClass("active");
  });

  $(this).addClass("active");
  const dayText = $(this).text();
  getActiveDay(dayText);
}

function handleGoCurrentMonthClick() {
  const todayString = getTodayLocalDateString();
  $("#idDRDate").val(todayString).trigger("change");
}
//#endregion

//#region EVENT DROPDOWN
function bindDropdownEvents() {
  $(document).on("click", "#idProject", handleProjectDropdownClick);
  $(document).on("click", "#idItem", handleItemDropdownClick);
  $(document).on("click", "#idJRD", handleJrdDropdownClick);

  $(document).on("click", "#projOptions li", handleProjectOptionClick);
  $(document).on("click", "#itemOptions li", handleItemOptionClick);
  $(document).on("click", "#jrdOptions li", handleJrdOptionClick);

  $(document).on("click", "body", handleBodyClick);
}
function handleProjectDropdownClick(event) {
  event.stopPropagation();
  $(".proj").toggleClass("active");
  $(".jord").removeClass("active");
  $(".iow").removeClass("active");
  $(this).blur();
}

function handleItemDropdownClick(event) {
  event.stopPropagation();
  $(".iow").toggleClass("active");
  $(".proj").removeClass("active");
  $(".jord").removeClass("active");
  $(this).blur();
}

function handleJrdDropdownClick(event) {
  event.stopPropagation();
  $(".jord").toggleClass("active");
  $(".iow").removeClass("active");
  $(".proj").removeClass("active");
  $(this).blur();
}

function handleProjectOptionClick() {
  $(".proj").removeClass("active");

  const projID = $(this).attr("proj-id");
  $(`#idProject option[proj-id="${projID}"]`).prop("selected", true).change();
}

function handleItemOptionClick() {
  $(".iow").removeClass("active");

  const itemID = $(this).attr("item-id");
  $(`#idItem option[item-id="${itemID}"]`).prop("selected", true).change();
}

function handleJrdOptionClick() {
  $(".jord").removeClass("active");

  const jrdID = $(this).attr("job-id");
  $(`#idJRD option[job-id="${jrdID}"]`).prop("selected", true).change();
}

function handleBodyClick(event) {
  if (
    !$(".proj .content").is(event.target) &&
    $(".proj .content").has(event.target).length === 0
  ) {
    $(".proj").removeClass("active");
  }

  if (
    !$(".iow .content").is(event.target) &&
    $(".iow .content").has(event.target).length === 0
  ) {
    $(".iow").removeClass("active");
  }

  if (
    !$(".jord .content").is(event.target) &&
    $(".jord .content").has(event.target).length === 0
  ) {
    $(".jord").removeClass("active");
  }
}
//#endregion

//#region EVENT SEARCH
function bindSearchEvents() {
  $(document).on("keyup search", "#searchproj", handleProjectSearch);
  $(document).on("keyup search", "#searchitem", handleItemSearch);
  $(document).on("keyup search", "#searchjrd", handleJrdSearch);
}
function handleProjectSearch() {
  fetchProjects({ searchProj: $("#searchproj").val() }).then((projects) => {
    resetProjectOptions();
    fillProj(projects);
  });
}

function handleItemSearch() {
  const projID = $("#idProject option:selected").attr("proj-id");

  getItemSearch(projID).then((items) => {
    fillItem(items);
  });
}

function handleJrdSearch() {
  const itemID = $("#idItem option:selected").attr("item-id");
  const projID = $("#idProject option:selected").attr("proj-id");

  getJRDSearch(projID, itemID).then((jobs) => {
    fillJobs(jobs);
  });
}
//#endregion

//#region EVENT UTILITIES
function bindUtilityEvents() {
  $(document).on("click", ".pindot", handleCalendarPanelToggle);
  $(document).on(
    "click",
    "#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup",
    clearInputErrorState,
  );
  $(document).on("click", "#btnRequestAccess", handleRequestAccessClick);
}
function handleCalendarPanelToggle() {
  $(".ms").toggleClass("open");

  if ($(".ms").hasClass("open")) {
    $(".ms-lbl p").html(
      `<i class='bx bx-x' style='color:#fff; font-size:40px;'></i>`,
    );
  } else {
    $(".ms-lbl p").html(
      `Calendar <i class='bx bx-right-arrow-alt d-flex align-items-center text-light' style="font-size: 20px;"></i>`,
    );
  }
}

function clearInputErrorState() {
  $(this).removeClass("bg-err");
}

function handleRequestAccessClick() {
  const selectedDate = $("#idDRDate").val();
  const monthLabel = getMonthYearLabel(selectedDate);

  alert(`Requesting 1-day access for ${monthLabel}`);
}
function resetProjectOptions() {
  $("#projOptions").empty();
  $("#idProject").html(`<option value="" hidden>Select Project</option>`);
}
//#endregion

//#region MAIN
function bindPageEvents() {
  bindFormEvents();
  bindCalendarEvents();
  bindDropdownEvents();
  bindSearchEvents();
  bindPlanningEvents();
  bindUtilityEvents();
}
//#endregion

//#region APP
$(document).ready(function () {
  initializeApp();
});

function initializeApp() {
  loadSession();
}

function loadSession() {
  $.ajax({
    url: "api/session.php",
    dataType: "json",
    success: async function (data) {
      AppState.empDetails = data;
      console.log("session:", AppState.empDetails);

      if (!data.isLoggedIn) {
        window.location.href = rootFolder + "/KDTPortalLogin";
        return;
      }

      try {
        await loadInitialData();
        startPage();
      } catch (error) {
        console.error("Startup config load failed:", error);
        alert("Failed to load startup configuration.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Session load failed");
      console.error("status:", status);
      console.error("error:", error);
      console.error("response:", xhr.responseText);

      window.location.href = rootFolder + "/KDTPortalLogin";
    },
  });
}

async function loadInitialData() {
  const response = await getStartupConfig();
  const config = response.data;

  AppState.defaults = config.defaults || [];
  AppState.leaveID = config.leaveID || null;
  AppState.otherID = config.otherID || null;
  AppState.mngID = config.mngID || null;
  AppState.kiaID = config.kiaID || null;
  AppState.noMoreInputItems = config.noMoreInputItems || [];
  AppState.oneBUTrainerID = config.oneBUTrainerID || null;

  AppState.solProjID = config.solProjID || null;
  AppState.trainProjID = config.trainProjID || null;
  AppState.kdtwAccess = config.kdtwAccess || [];
  AppState.managementPositions = config.managementPositions || [];
  AppState.devs = config.devs || [];
}

function startPage() {
  bindPageEvents();
  $(".hello-user").text(AppState.empDetails.empFName || "");

  ifSmallScreen();
  initializeDate();
  getMyGroups();
  getDispatchLoc();
  getTOW();
  getEntries();
  sequenceValidation();
  initCalendar();
  getPlans();
  planAccess();

  $(".cs-loader").fadeOut(1000);

  if (AppState.empDetails.hasOverride) {
    $(".override-btn").show();
  } else {
    $(".override-btn").hide();
  }

  updateLockedMonthLabel();
  evaluateMonthLock();
}

function initializeDate() {
  $("#idDRDate").val(getTodayLocalDateString());
}
//#endregion
