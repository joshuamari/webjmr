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
        }
      },async:false
    });
  }
);

var isloadedWebJMR = isloadedWebJMR||"test";
if (isloadedWebJMR!="load"){

}
isloadedWebJMR="load";
