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
//#endregion

$.ajaxSetup({ async: false });
$.ajax({
  url: "Includes/checkLogin.php", success: function (data) { //ajax to check if user is logged in
    empDetails = $.parseJSON(data);

    if (empDetails.length < 1) {
      window.location.href = rootFolder + '/KDTPortalLogin'; //if result is 0, redirect to log in page
    }
    // jmcAccess();
  }
});
$.ajaxSetup({ async: true });


$(document).ready(function () {
  $.getJSON("js/planning.json",
    function (data) {
      console.log(data)
    }
  );

  const getToday = new Date();
  $('#weekSel').val(getWeekNo(getToday));
  // $('#monthSel').val(`${getToday.getFullYear()}-${(parseInt(getToday.getMonth()) + 1).toString().padStart(2, '0')}`);
  // createTable($('#monthSel').val());
  createTable($('#weekSel').val());

});

function getWeekNo(currentDate) {
  var startDate = new Date(currentDate.getFullYear(), 0, 1);
  var days = Math.floor((currentDate - startDate) /
    (24 * 60 * 60 * 1000));
  var weekNumber = Math.ceil(days / 7);
  return `${currentDate.getFullYear()}-W${weekNumber}`;
}

Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
  mm.toString().padStart(2, '0'),
  dd.toString().padStart(2, '0')
  ].join('_');
};

//Month Val
// function createTable(monthVal) {
//   $($('#name').nextAll()).empty();
//   var addhtml = "";

//   var firstDay = new Date(monthVal.split('-')[0], parseInt(monthVal.split('-')[1]) - 1, 1);
//   var lastDay = new Date(monthVal.split('-')[0], monthVal.split('-')[1], 0);

//   //complete TH
//   if (firstDay.getDay() > 0) {
//     for (let x = firstDay.getDay(); x >= 0; x--) {
//       var newDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), -Math.abs(x));
//       addhtml += `<th>${newDate.yyyymmdd()}</th>`;
//     }
//   }
//   for (let x = 1; x <= lastDay.getDate(); x++) {
//     var newDate = new Date(monthVal.split('-')[0], monthVal.split('-')[1] - 1, x)
//     addhtml += `<th>${newDate.yyyymmdd()}</th>`;
//   }
//   if (lastDay.getDay() < 6) {
//     for (let x = lastDay.getDay(); x <= 6; x++) {
//       var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + x);
//       addhtml += `<th>${newDate.yyyymmdd()}</th>`;
//     }
//   }

//   $('#name').after(addhtml);
// }

// Week Val
function createTable(weekVal) {
  $($('#name').nextAll()).remove()
  getDates(weekVal).forEach(element => {
    $('#headrow').append(`<th>${element.yyyymmdd()}</th>`)
  });
}

$(document).on('change', '#weekSel', function () {
  var week = $(this).val()
  createTable(week);
});

function getDates(inp) {
  let year = parseInt(inp.split('-')[0]);
  let week = parseInt(inp.split('W')[1]);

  let day = (1 + (week - 1) * 7); // 1st of January + 7 days for each week

  let dayOffset = new Date(year, 0, 1).getDay(); // we need to know at what day of the week the year start

  dayOffset--;  // depending on what day you want the week to start increment or decrement this value. This should make the week start on a monday

  let days = [];
  for (let i = 0; i < 7; i++) // do this 7 times, once for every day
    days.push(new Date(year, 0, day - dayOffset + i)); // add a new Date object to the array with an offset of i days relative to the first day of the week
  return days;
}