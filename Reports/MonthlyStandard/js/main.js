//#region GLOBALS
switch (document.location.hostname)
{
        case 'kdt-ph':
            rootFolder = '//kdt-ph/update_test/'; 
            break;
        case 'localhost' :
            rootFolder = '//localhost/'; 
            break;
        default : 
            rootFolder = '//kdt-ph/update_test/';
            break;
}
//#endregion

$.ajaxSetup({async: false});
$.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
  empDetails=$.parseJSON(data);

  if(empDetails.length<1){
    window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
  }
  // jmcAccess();
}});
$.ajaxSetup({async: true});

function jmcAccess(){//check if user has access to jmc
  $.post("ajax/jmcAccess.php",
  {
    empNum:empDetails['empNum']
  },
    function (data) {
      if(data.trim()==0){
        alert('Access denied');
        window.location.href='../';
      }
    }
  );
}
//#region TEST Values

//empID||empName
const members = ["464||Coquia, Joshua Mari","465||Petate, Felix Edwin","487||Medrano, Collene Keith"];

//projectdbIndex||projectName
const projects464 = ["420||Hiram(ENV)","10||Development, Analysis & IT"];
const projects465 = ["69||kdtSimplifiedClashCheck","10||Development, Analysis & IT"];
const projects487 = ["99||Catia(MHAH)","10||Development, Analysis & IT"];
const queries = {464: projects464, 465: projects465, 487: projects487};
//pag may OT
//projectdbIndex_o||projectName
const otTest1 = ["420_o||Hiram(ENV)"];
const otTest2 = ["69_o||kdtSimplifiedClashCheck"];
const otQ = {464: otTest1, 465: otTest2};

//projectdbIndex||empID||day||hours if OT //projectdbIndex_o||empID||day||hours
const entries = ["10||464||3||8","10||464||4||8","10||464||12||8","10||464||13||8","10||464||14||4","420||464||14||4","10||464||17||8","10||464||18||8","10||464||19||8","10||464||20||8","10||464||24||8","10||464||25||4","420||464||25||4","10||464||26||8","10||464||27||8","10||464||28||8","10||487||3||8","10||487||4||8","10||487||12||8","10||487||13||8","10||487||14||8","10||487||17||8","10||487||18||4","10||487||19||4","99||487||18||4","99||487||19||4","10||487||20||8","10||487||24||8","10||487||25||8","10||487||26||8","10||487||27||8","10||487||28||8","69||465||11||4","69||465||12||4","69||465||13||4","69||465||14||4","69||465||18||4","69||465||19||4","69||465||20||4","69||465||24||4","69||465||25||4","69||465||26||4","69||465||27||4","69||465||28||4","10||465||3||4","10||465||4||4","10||465||11||4","10||465||12||4","10||465||13||4","10||465||14||4","10||465||18||4","10||465||19||4","10||465||20||4","10||465||24||4","10||465||25||4","10||465||26||4","10||465||27||4","10||465||28||4","420_o||464||13||2","420_o||464||14||2","420_o||464||26||2","69_o||465||13||2","69_o||465||15||8","69_o||465||13||2"];
//#endregion

//GLOBALS
var maxDate = 0;
var allPjArr = [];
//pang distinct. di ko alam kung may function ba na distinct hehe
const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
}

$(document).ready(function(){
  $('#monthSel').val(`${(new Date).getFullYear()}-${((new Date).getMonth()+1).toString().padStart(2,"0")}`);
  createTable($('#monthSel').val(),members);
});

$(document).on('change','#monthSel',function(){
  createTable($(this).val(),members);
})

function createTable(iVal,mVal){
  //clearTable
  $('#mainThead').empty();
  $('#mainTbody').empty();
  
  //header
  maxDate = parseInt((new Date(iVal.split('-')[0],iVal.split('-')[1],0)).getDate());
  $('#mainThead').html(`<th>Employee Name</th><th>Project</th>`);

  //body na
  //add member then project for every member
  mVal.map(addMP);
  
  //addDates
  for(let x = 1 ; x <= maxDate ; x++){
    $('#mainThead').append(`<th>${x.toString().padStart(2,"0")}</th>`);
    $('.pRow,.oRow,.tRow').append('<td class="count"></td>');
  }
  $('#mainThead').append('<th>TOTAL</th>');
  $('.pRow,.oRow,.tRow').append('<td class="rTotal"></td>');

  //latag entries
  genEntries(entries);

  genTotal();
};

function addMP(iVal){
  var eID = iVal.split("||")[0];
  var eName = iVal.split("||")[1];
  var addString = `<tr><td>${eName}</td><td>Project and Job Name</td><td colspan='${maxDate+1}'></td></tr>`;

  //query projects ni member
  //projectdbIndex||projectName
  var data = queries[eID];

  data.forEach(element => {
    allPjArr.push(element);
    allPjArr = allPjArr.filter(onlyUnique)
    var splitVal = element.split('||');
    addString += `<tr class="pRow regular r_${eID}" data-val="${eID}_${splitVal[0]}"><td></td><td>${splitVal[1]}</td></tr>`;
  }); 
  addString += `<tr class="tRow" data-val="${eID}"><td></td><td data-val="${eID}" class="tCell">Total Hours</td></tr>
  <tr class="oRow" data-val="${eID}"><td></td><td data-val="${eID}" class="oCell">Overtime</td></tr>`

  //pag may OT
  //test lang to. query mo to oi.
  var data2 = eID == 464 ? otTest1 : (eID == 465 ? otTest2 : []);

  data2.forEach(element => {
    var splitVal = element.split('||');
    addString += `<tr class="pRow ot o_${eID}" data-val="${eID}_${splitVal[0]}"><td></td><td>OT - ${splitVal[1]}</td></tr>`
  });

  $('#mainTbody').append(addString);
}

function genEntries(iVal){
  iVal.forEach(element => {
    //projectdbIndex||empID||day||hours -- "420_o||464||13||2"
    var splitVal = element.split('||');
    var dataVal = `${splitVal[1]}_${splitVal[0]}`;
    $($(`.pRow[data-val="${dataVal}"]`).children()[parseInt(splitVal[2])+1]).text(splitVal[3]);
  });
};

function genTotal(){
  //total Hours
  var tRows = $('.tRow');
  for(let x = 0 ; x < tRows.length ; x++){
    empTot(tRows[x]);
  }
  //total OT
  var oRows = $('.oRow');
  for(let x = 0 ; x < oRows.length ; x++){
    oTot(oRows[x])
  }

  //total sa right
  var rTot = $('.rTotal');
  for(let x = 0 ; x < rTot.length ; x++){
    var getLeft = $(rTot[x]).prevAll('.count');
    var addVal = 0;
    for(let y = 0 ; y < getLeft.length ; y++){
      addVal += parseFloat($(getLeft[y]).text() == "" ? 0 : $(getLeft[y]).text());
    }
    $(rTot[x]).text(addVal);
  }
}

function empTot(iVal){
  var eID = $(iVal).attr('data-val');
  var getTots = $(iVal).children();
  getTots.length -= 1;

  for(let x = 2 ; x < getTots.length ; x++){
    var getER = $(`.r_${eID}`);
    var addVal = 0
    for(let y = 0 ; y < getER.length ; y++){
      addVal += parseFloat($($(getER[y]).children()[x]).text() == "" ? 0 : $($(getER[y]).children()[x]).text());
    }
    $(getTots[x]).text(addVal == 0 ? "" : addVal);
  }
}
function oTot(iVal){
  var eID = $(iVal).attr('data-val');
  var getTots = $(iVal).children();
  getTots.length -= 1;

  for(let x = 2 ; x < getTots.length ; x++){
    var getER = $(`.o_${eID}`);
    var addVal = 0
    for(let y = 0 ; y < getER.length ; y++){
      addVal += parseFloat($($(getER[y]).children()[x]).text() == "" ? 0 : $($(getER[y]).children()[x]).text());
    }
    $(getTots[x]).text(addVal == 0 ? "" : addVal);
  }
}