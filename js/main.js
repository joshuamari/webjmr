//#region GLOBALS
switch (document.location.hostname) //get Root Folder
{
    case 'kdt-ph':
        rootFolder = '//kdt-ph/';
        break;
    case 'localhost':
        rootFolder = '//localhost/';
        break;
    default:
        rootFolder = '//kdt-ph/';
        break;
}
empDetails=[];
//#endregion
checkLogin();
//$region BINDS
$(document).ready(function () {//page Initialize Event
    $("#eid").val(empDetails["empNum"]);
    $("#ename").val(empDetails["empFName"] + " " + empDetails["empSName"]);
    $(".hello-user").text(empDetails["empFName"]);
    $('.cs-loader').fadeOut(1000);
  }
);
//#endregion

//#region FUNCTIONS
// function checkTestAccess(){//check if has access to testing
//   $.post("ajax/checkTestAccess.php",
//   {
//     empNum:empDetails['empNum']
//   },
//     function (data) {
//       var access=data.trim();
//       if(access=='0'){
//         alert('Access denied')
//         window.location.href = rootFolder + "/welcome";
//       }
//     }
//   );
// }
function checkLogin(){//check if user is logged in
  $.ajaxSetup({async: false});
    $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
      empDetails=$.parseJSON(data);
      if(Object.keys(empDetails).length<1){
        window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
      }
    }});
  $.ajaxSetup({async: true});
}
//#endregion
