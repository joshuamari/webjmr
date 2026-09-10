const rootFolder = `//${document.location.hostname}`;
var _empDetails = [];

checkLogin();

$(document).ready(function () {
  $(".hello-user").text(_empDetails["empFName"] || "User");
  planAccess();
  bindSidebar();
  ifSmallScreen();
  $(".cs-loader").fadeOut(1000);
});

$(window).on("resize", function () {
  ifSmallScreen();
});

function checkLogin() {
  $.ajaxSetup({ async: false });
  $.ajax({
    url: "../Includes/checkLogin.php",
    success: function (data) {
      _empDetails = $.parseJSON(data);
      if (Object.keys(_empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin";
      }
    },
  });
  $.ajaxSetup({ async: true });
}

function planAccess() {
  if (!_empDetails || !_empDetails.empNum) return;
  $.post(
    "../Reports/ajax/plan_access.php",
    { empNum: _empDetails.empNum },
    function (data) {
      var access = $.parseJSON(data);
      if (access && access.hasPlanning) {
        $("#planningLink").show();
      } else {
        $("#planningLink").hide();
      }
      if (access && access.hasDRApprovals) {
        $("#drapprovals").show();
      } else {
        $("#drapprovals").hide();
      }
    }
  );
}

function bindSidebar() {
  $(".menu-one").on("click", function () {
    $(".sidebar").toggleClass("close");
    ifSmallScreen();
  });
  $(".menu-two").on("click", function () {
    $(".sidebar").addClass("close");
    ifSmallScreen();
  });
}

function ifSmallScreen() {
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass("close")) {
      $(".menu-two").addClass("d-none");
    } else {
      $(".menu-two").removeClass("d-none");
    }
  } else {
    $(".menu-two").addClass("d-none");
  }
}
