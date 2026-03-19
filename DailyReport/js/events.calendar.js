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
