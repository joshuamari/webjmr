function hideOvertimeButton() {
  if (
    AppState.empDetails.empGroup === "SYS" ||
    AppState.empDetails.empGroup === "MNG" ||
    AppState.empDetails.empGroup === "PIP" ||
    AppState.empDetails.empGroup === "IT"
  ) {
    $("#overtimeLink").show();
    $('#idMH option[mhid="1"]').remove();
  }
}
