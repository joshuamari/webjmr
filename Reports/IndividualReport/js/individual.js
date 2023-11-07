//#region GLOBALS
switch (document.location.hostname) {
  case "kdt-ph":
    rootFolder = "//kdt-ph/";
    break;
  case "localhost":
    rootFolder = "//localhost/";
    break;
  default:
    rootFolder = "//kdt-ph/";
    break;
}
var _empDetails = [];

//#endregion
checkLogin();
checkSign();
//#region BINDS
$(document).ready(function () {});
$(document).on("click", "#btnPrint", function () {
  html2canvas($("#toPrint")[0]).then((canvas) => {
    var printWindow = window.open("", "", "width=1800, height=1200");
    printWindow.document.open();
    printWindow.document.write(
      "<html><head><title>Monthly Individual Report</title></head><body>"
    );
    printWindow.document.write(
      "<img src='" + canvas.toDataURL("image/png") + "' />"
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Wait for the image to load before calling print()
    var image = printWindow.document.querySelector("img");
    image.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  });
});

//#endregion

//#region FUNCTIONS

function checkLogin() {
  $.ajaxSetup({ async: false });
  $.ajax({
    url: "Includes/check_login.php",
    success: function (data) {
      //ajax to check if user is logged in
      _empDetails = $.parseJSON(data);

      if (Object.keys(_empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
      }
    },
  });
  $.ajaxSetup({ async: true });
}
function checkSign() {
  var element = $(".signature").children();
  if (element.length > 2) {
    $(".signature").css("justify-content", "space-between");
  } else {
    $(".signature").css("justify-content", "space-around");
  }
}
//#endregion
