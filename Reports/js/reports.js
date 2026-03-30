//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var _empDetails = [];
//#endregion
checkLogin();
//#region BINDS
$(document).ready(function () {
  $.ajaxSetup({ async: false });
  $(".hello-user").text(_empDetails["empFName"]);
  planAccess();
  $.ajaxSetup({ async: true });
  //#region sidebarshits
  let arrow = document.querySelectorAll(".arrow");

  for (var i = 0; i < arrow.length; i++) {
    arrow[i].addEventListener("click", (e) => {
      let arrowParent = e.target.parentElement.parentElement; //selecting main parent of arrow
      arrowParent.classList.toggle("showMenu");
    });
  }
  let ey = document.querySelectorAll(".ey");

  for (var i = 0; i < ey.length; i++) {
    ey[i].addEventListener("click", (e) => {
      let aey = e.target.parentElement.parentElement.parentElement; //selecting main parent of arrow
      aey.classList.toggle("showMenu");
    });
  }

  let sidebar = document.querySelector(".sidebar");
  let sidebarBtn = document.querySelector(".menu-one");
  let sidebarBtn2 = document.querySelector(".menu-two");
  // console.log(sidebarBtn);
  sidebarBtn.addEventListener("click", () => {
    $(".sidebar").toggleClass("close");
    // console.log("pinindot")
  });
  sidebarBtn2.addEventListener("click", () => {
    $(".sidebar").addClass("close");
  });
  //#endregion
  ifSmallScreen();

  $(".cs-loader").fadeOut(1000);
});

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
function planAccess() {
  $.post(
    "ajax/plan_access.php",
    {
      empNum: _empDetails["empNum"],
    },
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
//#endregion
function ifSmallScreen() {
  //responsive
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass(".close")) {
      $(".menu-two").addClass("d-none");
    } else {
      $(".menu-two").removeClass("d-none");
    }
  } else {
    $(".menu-two").addClass("d-none");
  }
}
