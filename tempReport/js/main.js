
//#region GLOBALS
switch (document.location.hostname) {
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
var empDetails = [];
$.ajaxSetup({ async: false });
$.ajax({
  url: "Includes/checkLogin.php", success: function (data) { //ajax to check if user is logged in
    empDetails = $.parseJSON(data);

    if (empDetails.length < 1) {
      window.location.href = rootFolder + '/KDTPortalLogin'; //if result is 0, redirect to log in page
    }
    jmcAccess();
  }
});
$.ajaxSetup({ async: true });
//#endregion

//#region BINDS
$(document).ready(function () {
  $.ajaxSetup({ async: false });
  getMyGroups();
  var dateToday = new Date();
  $('#monthSel').val(`${dateToday.getFullYear()}-${(dateToday.getMonth() + 1).toString().padStart(2, '0')}`)
  showInputs();
  $.ajaxSetup({ async: true });
});
$(document).on('keyup', '#searchMain', function () {
  showInputs();
})
$(document).on('change', '#BUSel', function () {
  showInputs();
})
$(document).on('change', '#monthSel', function () {
  showInputs();
})
$(document).on('click', '#resetB', function () {
  $('#searchMain').val('');
  $('#BUSel').val('');
  $('#monthSel').val('');
  showInputs();
})

//#endregion

//#region FUNCTIONS
function jmcAccess() {//check if user has access to jmc
  $.post("ajax/jmcAccess.php",
    {
      empNum: empDetails['empNum']
    },
    function (data) {
      if (data.trim() == 0) {
        alert('Access denied');
        window.location.href = rootFolder + '/KDTPortalLogin';
      }
    }
  );
}
function showInputs() {
  $('#mainBod').empty()
  var lDeets=[];
  var search = $('#searchMain').val();
  var empGroup = $('#BUSel').val();
  var ymSel = $('#monthSel').val();
  $.post("ajax/showInputs.php",
    {
      search: search,
      empGroup: empGroup,
      ymSel: ymSel
    },
    function (data) {
      lDeets=$.parseJSON(data);
      lDeets.map(lVal);
    }
  );
}
function lVal(iVal) {

  var splitVal = iVal.split('||');

  $('#mainBod').append(`

<tr>
  <td>${($('#mainBod').children().length) + 1}</td>
  <td>${splitVal[0]}</td>
  <td>${splitVal[1]}</td>
  <td>${splitVal[2]}</td>
  <td>${splitVal[3]}</td>
  <td>${splitVal[4]}</td>
  <td>${splitVal[5]}</td>
  <td>${splitVal[6]}</td>
  <td>${splitVal[7]}</td>
  <td>${splitVal[8]}</td>
  <td>${splitVal[9]}</td>
  <td>${splitVal[10]}</td>
  <td>${splitVal[11]}</td>
</tr>

  `)

}
function getMyGroups() {//get group selection
  $.post("ajax/getMyGroup.php",
    {
      empNum: empDetails['empNum'],
    },
    function (data) {
      $('#BUSel').html(data);
    }
  );
}

//#endregion