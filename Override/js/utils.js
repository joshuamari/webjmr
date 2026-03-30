function formatName(emp) {
  let names = [];
  const splitName = String(emp || "").split(", ");
  if (splitName.length < 2) return emp || "";

  const splitFName = splitName[1].split(" ");

  $.each(splitName, function (_, name) {
    let lower = name.toLowerCase();
    let capital = lower.charAt(0).toUpperCase() + lower.slice(1);
    names.push(capital);
  });

  names[1] = splitFName.join(" ");
  return names.join(", ");
}

function getDefaults() {
  var defaultsArray = [];
  $.ajax({
    url: "php/get_defaults.php",
    dataType: "json",
    success: function (data) {
      defaultsArray = data.result || [];
    },
    async: false,
  });
  return defaultsArray;
}

function isWorkDay(location) {
  var isWorkDay = false;
  var selDate = $("#idDRDate").val();
  var selLoc = location;

  if (selLoc == null) {
    selLoc = "KDT";
  }

  $.ajaxSetup({ async: false });
  $.post(
    "php/check_workday.php",
    {
      selDate: selDate,
      selLoc: selLoc,
    },
    function (data) {
      isWorkDay = $.parseJSON(data);
    },
  );
  $.ajaxSetup({ async: true });

  return isWorkDay;
}

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

async function canEditSelectedDate(yearMonth) {
  if (!yearMonth) return true;

  const employeeNumber = $($("#idEmployee").find("option:selected")).attr("emp-id");

  if (!employeeNumber || employeeNumber == 0) {
    return true;
  }

  try {
    const response = await getEditStatus(yearMonth, employeeNumber);
    return response?.canEdit === true;
  } catch (error) {
    console.error("canEditSelectedDate failed:", error);
    return true;
  }
}
