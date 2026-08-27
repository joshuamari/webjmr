function hideOvertimeButton() {
  if (
    AppState.empDetails.empGroup === "SYS" ||
    AppState.empDetails.empGroup === "MNG"
  ) {
    $("#overtimeLink").show();
    $('#idMH option[mhid="1"]').remove();
  }
}
