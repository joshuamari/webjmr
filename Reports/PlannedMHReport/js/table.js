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

  const getToday = new Date();
  $('#weekSel').val(getWeekNo(getToday));

  queryfunctions();

});

function queryfunctions() {

  $.getJSON("js/planning.json",
    function (planning) {
      getProjects(planning);
      createTable($('#weekSel').val());
      $.getJSON("js/queries.json",
        function (dr) {
          addDr(dr);
        }
      );
    }
  );

}

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

function createTable(weekVal) { //week
  $($('#status').nextAll()).remove()
  $($('.oStat').nextAll()).remove()
  $('.job-row').after(`<tr class='actual-row'></tr>`)
  getDates(weekVal).forEach(element => {
    $('#headrow').append(`<th>${element.yyyymmdd()}</th>`);
    $('.job-row').append(`<td day-val="${element.getDate()}"></td>`)
    $('.actual-row').append(`<td day-val="${element.getDate()}"></td>`)
  });
  $('#headrow').append(`
  <th>TOTAL(Week ${$('#weekSel').val()})</th>
  <!-- <th>Remaining</th> -->`);
  $('.job-row,.actual-row').append(`
  <td class='jrTot'></td>
  <! --<td class='rem'></td> -->
  `);
}

$(document).on('change', '#weekSel', function () {
  queryfunctions();
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

function getProjects(planningdata) {

  var uniqueArray = [];
  var uniquePrjs = [];

  planningdata.forEach(obj => {
    if (!uniquePrjs.includes(obj.prj)) {
      uniqueArray.push({
        "pName": obj.prj,
        "pNum": obj.pNum
      });
      uniquePrjs.push(obj.prj);
    }
  });

  displayPJ(uniqueArray);
  planningdata.map(addPlanning);
}

function displayPJ(pjArr) {
  $('#main-tbody').empty();
  pjArr.forEach(element => {
    $('#main-tbody').append(`<tr pj-id="${element.pNum}"><td class="bg-warning" colspan="100">${element.pName}</td></tr>`);
  });
}

const uVal = (x) => {
  if (x == undefined) {
    return "###";
  } else {
    return x;
  }
}

function addPlanning(entry) {
  $(`[pj-id="${entry.pNum}"]`).after(`<tr class="job-row" emp-num="${entry.empNum}" job-id="${entry.jobNum}">
  <td rowspan="2">${uVal(entry.jrd)}</td>
  <td rowspan="2">${uVal(entry.iow)}</td>
  <td rowspan="2">${uVal(entry.doc)}</td>
  <td rowspan="2">${uVal(entry.kic)}</td>
  <td rowspan="2">${uVal(entry.empName)}</td>
  <td rowspan="2">${uVal(entry.startDate)}</td>
  <td rowspan="2">${uVal(entry.endDate)}</td>
  <td rowspan="2">${uVal(entry.startDate)}</td>
  <td rowspan="2" class="mhu">${uVal(entry.plnUsed)}</td>
  <td rowspan="2">${uVal(entry.fldStatus)}</td>
  <td rowspan="2" class="oStat">${uVal(entry.fldStatus)}</td>
  </tr>`)
}

function addDr(dArr) { //pang add ng daily report
  dArr.forEach(element => {
    console.log(element.jobNum, element.empNum, (new Date(element.entryDate).getDate()))
    // console.log($(`[job-id='${element.jobNum}'][emp-num='${element.empNum}']`).children(`[day-val='${(new Date(element.entryDate).getDate())}']`))
    $($($(`[job-id='${element.jobNum}'][emp-num='${element.empNum}']`).next()).children(`[day-val='${(new Date(element.entryDate).getDate())}']`)).text(`${element.hours}`)
  });

  totals();
}

function totals() {

  //weekly total
  var jrtots = $('.jrTot');
  $.each(jrtots, function (indexInArray, valueOfElement) {
    var getPrev = $(valueOfElement).prevUntil('.oStat');
    var sum = 0;
    $.each(getPrev, function (indexInArray, valueOfElement) {
      sum += parseFloat($(valueOfElement).text() == "" ? 0 : $(valueOfElement).text())
    });
    $(valueOfElement).text(sum);
  });

  //remaining
  // var rems = $('.rem');
  // $.each(rems, function (indexInArray, valueOfElement) {
  //   $(valueOfElement).text(parseFloat($($(valueOfElement).prevAll('.asm')).text()) - parseFloat($($(valueOfElement).prevAll('.mhu')).text()))
  //   if (parseFloat($(valueOfElement).text()) < 0) {
  //     $(valueOfElement).addClass('bg-danger')
  //   }
  // });
}

//extract date range from planning query

function isDateInRange(dateToCheck, dateRange) {
  return dateToCheck >= dateRange.startDate && dateToCheck <= dateRange.endDate;
}