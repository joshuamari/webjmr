switch (document.location.hostname) //get Root Folder
{
    case 'kdt-ph':
        rootFolder = '//kdt-ph/update_test/';
        break;
    case 'localhost':
        rootFolder = '//localhost/';
        break;
    default:
        rootFolder = '//kdt-ph/update_test/';
        break;
}
$(document).ready(function () {

    $.ajax({
      url: "Includes/checkLogin.php",
      success: function (data) {
        //ajax to check if user is logged in
        empDetails = $.parseJSON(data);
  
        if (empDetails.length < 1) {
          window.location.href = rootFolder + "/welcome"; //if result is 0, redirect to log in page
        } else {
          $("#eid").val(empDetails["empNum"]);
          $("#ename").val(empDetails["empFName"] + " " + empDetails["empSName"]);
          $(".hello-user").text(empDetails["empFName"]);
  
          ifSmallScreen();
        }
      },async:false
    });
  }
);

var isloadedWebJMR = isloadedWebJMR||"test";
if (isloadedWebJMR!="load"){
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
  console.log("pinindot")
});
sidebarBtn2.addEventListener("click", () => {
  $(".sidebar").addClass("close");
});
}
isloadedWebJMR="load";

function ifSmallScreen(){
  if ($(window).width() < 426) {
    if ($(".sidebar").hasClass(".close")) {
      $(".menu-two").hide();
    } else {
      $(".menu-two").show();
    }
  } else {
    $(".menu-two").hide();
  }
}