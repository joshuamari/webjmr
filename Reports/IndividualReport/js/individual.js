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
const { jsPDF } = globalThis.jspdf;
//#region BINDS
$(document).ready(function () {
  // This code will execute after jsPDF is loaded
  // if (typeof jspdf !== "undefined") {
  $(document).on("click", "#save", function () {
    saveToPDF();
  });
  //   var test = new jsPDF();
  // } else {
  //   // Handle the case where jsPDF is not defined
  //   console.log("jsPDF is not loaded.");
  // }
  // var test = new jsPDF();
});

$(document).on("click", "#btnPrint", function () {
  html2canvas($("#toPrint")[0]).then((canvas) => {
    var printWindow = window.open("", "", "width=900, height=600");
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
function saveToPDF() {
  html2canvas($("#toPrint")[0]).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.0);
    var doc = new jsPDF({
      orientation: "portrait", // 'portrait' or 'landscape'
      unit: "mm", // 'mm', 'cm', 'in', or 'px'
      format: "a4", // Page size: 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'letter', etc.
    });
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save("Monthly_Individual_Report.pdf");
  });

  // doc.html($("#toPrint")[0], {
  //   callback: function (doc) {
  //     doc.save("Monthly_Individual_Report.pdf");
  //   },
  //   x: 0,
  //   y: 0,
  // });
}
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
