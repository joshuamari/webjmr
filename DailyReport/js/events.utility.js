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

  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }

  window.location.href = `${rootFolder}/webJMR/DRTemporaryAccess/`;
}
function resetProjectOptions() {
  $("#projOptions").empty();
  $("#idProject").html(`<option value="" hidden>Select Project</option>`);
}
