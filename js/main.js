//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
empDetails = [];
//#endregion
checkLogin();
//$region BINDS
$(document).ready(function () {
  //page Initialize Event
  $("#eid").val(empDetails["empNum"]);
  $("#ename").val(empDetails["empFName"] + " " + empDetails["empSName"]);
  $(".hello-user").text(empDetails["empFName"]);
  $(".cs-loader").fadeOut(1000);
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  //check if user is logged in
  $.ajaxSetup({ async: false });
  $.ajax({
    url: "Includes/checkLogin.php",
    success: function (data) {
      //ajax to check if user is logged in
      // console.log(data);
      empDetails = $.parseJSON(data);
      if (Object.keys(empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
      }
    },
  });
  $.ajaxSetup({ async: true });
}
//#endregion
