function hideOvertimeButton() {
  if (
    AppState.empDetails.empGroup === "PIP" ||
    AppState.empDetails.empGroup === "SYS"
  ) {
    $("#overtimeLink").show();
    $('#idMH option[mhid="1"]').remove();
  }
}
