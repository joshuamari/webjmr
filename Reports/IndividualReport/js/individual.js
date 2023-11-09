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
checkLoc();

const { jsPDF } = globalThis.jspdf;
//#region BINDS
$(document).ready(function () {
  $(document).on("click", "#save", function () {
    saveToPDF();
  });
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
$(document).on("click", "#descriptionList", function () {
  $(this).toggleClass("open");
});
$(document).on("click", ".list-items .item", function () {
  $(this).toggleClass("checked");
  countCheck();
});
$(document).on("change", "#idGroup", function () {
  var group = $(this).val();
  if (group == "MPM") {
    $(".token").removeClass("d-none");
  } else {
    $(".token").addClass("d-none");
  }
});
$(document).on("change", "#idLoc", function () {
  checkLoc();
});

//#endregion

//#region FUNCTIONS
function countCheck() {
  var checked = $(".checked");
  var btnText = $(".text-btn");

  if (checked && checked.length != 0) {
    btnText.text(`${checked.length} Selected`);
  } else {
    btnText.text("Select Description");
  }
}
function saveToPDF() {
  html2canvas($("#toPrint")[0]).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.0);
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      displayMode: "fullwidth",
      userUnit: 1,
    });
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save("Monthly_Individual_Report.pdf");
  });
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
function checkLoc() {
  var loc = $("#idLoc").val();
  if (loc == 1) {
    $(".checker, .approver").removeClass("d-none");
    $(".signature")
      .addClass("justify-content-between")
      .removeClass("justify-content-around");
  } else {
    $(".checker, .approver").addClass("d-none");
    $(".signature")
      .removeClass("justify-content-between")
      .addClass("justify-content-around");
  }
}
//#endregion
