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
