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
var dateNgayon = new Date();
var empDetails=[];
//emp#||Name||Group and Desig
const empList = ['300||AAA||Env', '310||BBB||Env', '400||CCC||Env', '410||DDD||Env', '420||EEE||Env', '320||FFF||Pip', '330||GGG||Civ']

//Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
const testHeader = ['Env||6311051-P300||Komuradai||P||51-P', 'Env||6311052-P300||Aizu||P||69', 'Env||6311053-P300||Kirishima||P||72', 'Env||61H3E35-020L||STP75||P||81', 'Env||61WXXXX-XXX1||KHI Indirect||P||87', 'Env||6311053-P300||Kirishima||J||89', 'Env||61HXXXX-XXXX||KHI Indirect||J||98', 'Env||61WXXXX-XXXX||KHI Indirect||J||112'];

//emp#||dbIndex||duration
const entries = ['300||51-P||50', '300||89||80', '300||98||10', '300||112||10', '310||51||150', '400||69||100', '400||81||20', '400||87||30', '410||72||150', '320||69||50', '330||72||50']

//pwede rin to galing db (initialize once)
const codeArr = { CEM: "61W2201", MIL: "61W2201", CHE: "61W2252", CRY: "61W2971", MHAH: "61W2202", AH: "61W2714", ENV: "61W2322", EE: "61W2283", CIV: "61W2211", PIP: "61W2510", BOI: "61W2723", KHI: "61W2102", KDT: "61W2102-8900" }

//grp||proj Code||Proj Name||Location(P/J)||dbIndex
const mgaNahiram = ['Cem||6269420-P300||Hehe||P||469', 'EE||6242069-P100||Haha||P||999']

//emp#||dbIndex||duration
const hiramEntries = ['410||469||5', '410||999||5', '320||469||5', '330||999||5'];

//emp#||td class||duration
const mngkdt = ['300||M1||130', '310||M1||120', '400||M1||50', '400||M2||10', '300||K1||2.5', '300||B1||2.5', '310||K1||5', '310||B1||5', '400||K1||2.5', '400||B1||2.5', '400||K2||1.5', '400||B2||1.5', '410||K1||5', '410||B1||5', '420||K1||75', '420||B1||75'];
//#endregion

$.ajaxSetup({async: false});
$.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
  empDetails=$.parseJSON(data);

  if(empDetails.length<1){
    window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
  }
  jmcAccess();
}});
$.ajaxSetup({async: true});

//#region BINDS
$(document).ready(function () {
  $.ajaxSetup({async: false});
  setDate();
  getGroups();
  getTable();
  $.ajaxSetup({async: true});
})
$(document).on('change','#buSel',function(){
  getTable();
});
$(document).on('change','#monthSel',function(){
  getTable();
});
$(document).on('change','#CO',function(){
  getTable();
});
//#endregion

//#region FUNCTIONS
function setDate(){//set default month
  var today = new Date();

  var rawMonth = `${today.getMonth()+1}`;
  var dateString = `${today.getFullYear()}-${rawMonth.padStart(2,"0")}`;
  $('#monthSel').val(dateString);
}
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
function getTable(){
  $.ajaxSetup({async: false});
  var _testHeader=getTestHeader();
  var _empList=getEmplist();
  var _entries=getEntries();
  var _mgaNahiram=getMgaNahiram();
  var _hiramEntries=getHiramEntries();
  var _mngkdt=getMngKdt();
  var _getGroup=$('#buSel').val();
  createTable(_testHeader, _empList, _entries, _mgaNahiram, _hiramEntries, _mngkdt, _getGroup);
  $.ajaxSetup({async: true});
}
function getTestHeader(){
  var tHeader=[];
  var getYMSel=$(`#monthSel`).val()
var getHalfSel=$(`#CO`).val()
  $.post("ajax/getTestHeader.php",
  {
    getYMSel:getYMSel,
    getHalfSel:getHalfSel,
    getGroup:$('#buSel').val()
  },
    function (data) {
      tHeader=$.parseJSON(data);
    },
    async=false
  );
  return tHeader;
}
function getEmplist(){
  var eList=[];
  var getYMSel=$(`#monthSel`).val()
  var getHalfSel=$(`#CO`).val()
  $.post("ajax/getEmplist.php",
  {
    getYMSel:getYMSel,
    getHalfSel:getHalfSel,
    getGroup:$('#buSel').val()
  },
    function (data) {
      eList=$.parseJSON(data);
    },
    async=false
  );
  return eList;
}
function getEntries(){
  var entrs=[];
  var getYMSel=$(`#monthSel`).val()
  var getHalfSel=$(`#CO`).val()
  $.post("ajax/getEntries.php",
  {
    getYMSel:getYMSel,
    getHalfSel:getHalfSel,
    getGroup:$('#buSel').val()
  },
    function (data) {
      entrs=$.parseJSON(data);
    },
    async=false
  );
  return entrs;
}
function getMgaNahiram(){
  var mgaNhiram=[];
  var getYMSel=$(`#monthSel`).val()
  var getHalfSel=$(`#CO`).val()
  $.post("ajax/getMgaNahiram.php",
  {
    getYMSel:getYMSel,
    getHalfSel:getHalfSel,
    getGroup:$('#buSel').val()
  },
    function (data) {
      mgaNhiram=$.parseJSON(data);
    },
    async=false
  );
  return mgaNhiram;
}
function getHiramEntries(){
  var hramEntries=[];
  var getYMSel=$(`#monthSel`).val()
  var getHalfSel=$(`#CO`).val()
  $.post("ajax/getHiramEntries.php",
  {
    getYMSel:getYMSel,
    getHalfSel:getHalfSel,
    getGroup:$('#buSel').val()
  },
    function (data) {
      hramEntries=$.parseJSON(data);
    },
    async=false
  );
  return hramEntries;
}
function getMngKdt(){
  var mngakdt=[];
  var getYMSel=$(`#monthSel`).val()
  var getHalfSel=$(`#CO`).val()
  $.post("ajax/getMngKdt.php",
  {
    getYMSel:getYMSel,
    getHalfSel:getHalfSel,
    getGroup:$('#buSel').val()
  },
    function (data) {
      mngakdt=$.parseJSON(data);
    },async=false
  );
  return mngakdt;
}
function createTable(hVal, eVal, nVal, bVal, pVal, mVal, BU) {
  $('#mainTable').html(`<thead>
  <tr id="tr1">
    <th rowspan="4" title="Employee Number" class="text-center">#</th>
    <th rowspan="4">Name</th>
    <th>Budget in Charge</th>
  </tr>
  <tr id="tr2">
    <th>Order No.</th>
  </tr>
  <tr id="tr3">
    <th>Project</th>
  </tr>
  <tr id="tr4">
    <th>Location</th>
  </tr>
</thead>
<tbody id="mainTbody">

</tbody>`);
  addEmp(eVal);
  pHead(hVal);
  $('#tr1').append(`<th rowspan="4" class="st-color">Sub-total</th>`);
  $('.empRow').append(`<td class="st st-color"></td>`);
  $('#tot1').append(`<td id="tot1-st" class="st-color"></td>`);
  $('#multiplier').append(`<td class="st-color"></td>`);
  $('#xd').append(`<td id="xd-st" class="st-color"></td>`);
  afterSub(BU);
  pHead(bVal);
  $('#tr1').append(`<th rowspan="4" class="mhpp-color">Monthly Man-hour per Person</th>`);
  $('.empRow').append(`<td class="mhpp mhpp-color"></td>`);
  $('#tot1').append(`<td id="tot1-mhpp" class="mhpp-color" ></td>`);
  $('#multiplier').append(`<td></td>`);
  $('#xd').append(`<td></td>`);

  //for entries
  // $($(".empRow[data-val='300']").children('td[data-val="51"]')).text('w3-black')
  addEntries(nVal);
  addEntries(mVal);
  addEntries(pVal);
  total();
}

function addEmp(iVal) {
  //emp#||Name||Group and Desig
  iVal.forEach(element => {
    var splitVal = element.split('||');
    $('#mainTbody').append(`
  <tr class="empRow" data-val="${splitVal[0]}">
  <td>${splitVal[0]}</td>
  <td>${splitVal[1]}</td>
  <td>${splitVal[2]}</td>
  </tr>
  `)
  });
  $('#mainTbody').append(`
<tr id="tot1">
  <td colspan="2">Total Man-Hour per Order</td>
  <td>Hr</td>
</tr>
<tr id="multiplier">
  <td colspan="2">単価</td>
  <td>（千円）</td>
</tr>
<tr id="xd">
  <td colspan="2">請求額</td>
  <td>（千円）</td>
</tr>
`);
}

function pHead(iVal) {
  iVal.forEach(function callback(element) {
    //Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
    var splitVal = element.split("||");

    if(!splitVal[1]){

      splitVal[1]=codeArr[splitVal[0]];

    }
    $('#tr1').append(`<th>${splitVal[0]}</th>`);
    $('#tr2').append(`<th>${splitVal[1]}</th>`);
    $('#tr3').append(`<th>${splitVal[2]}</th>`);
    $('#tr4').append(`<th>${splitVal[3]}</th>`);
    $('.empRow').append(`<td data-val="${splitVal[4]}"></td>`);
    $('#tot1').append(`<td data-tot="${splitVal[4]}" class="tot"></td>`);
    $('#multiplier').append(`<td class="multiplier-${splitVal[4]}">${splitVal[3] == "P" ? "2" : "2.85"}</td>`);
    $('#xd').append(`<td data-xtot="${splitVal[4]}" class="xTot"></td>`);
  });
}

function afterSub(iVal) {
  const except = ["SYS", "IT", "ANA", "ETCL", "MPM"];

  if(!except.includes(iVal)){
    pHead([`Management||${codeArr[iVal]}||100%||P||M1`, `Management||${codeArr[iVal]}||100%||J||M2`, `KDT||${codeArr["KDT"]}||50%||P||K1`, `KDT||${codeArr["KDT"]}||50%||J||K2`, `${iVal}||${codeArr[iVal]}||50%||P||B1`, `${iVal}||${codeArr[iVal]}||50%||J||B2`]);
  }else{
    pHead([`KDT||61W2102-8900||100%||P||K1`,`KDT||61W2102-8900||100%||J||K2`]);
  }
}

function addEntries(iVal) {
  iVal.forEach(element => {
    var splitVal = element.split('||');
    //emp#||dbIndex||duration
    $($(`.empRow[data-val='${splitVal[0]}']`).children(`td[data-val="${splitVal[1]}"]`)).text(splitVal[2]);
  });
}

function total(){
  // Left
  var getTots = $('.tot');
  for(let x = 0 ; x < getTots.length ; x++){
    $(getTots[x]).text(getTotal($($(getTots)[x]).attr('data-tot')));
  }

  // Multiplied (2 || 2.85) .xTot
  var getXTot = $('.xTot');
  for(let x = 0 ; x < getXTot.length ; x++){
    var totalmh=parseFloat($(`.tot[data-tot="${$($(getTots)[x]).attr('data-tot')}"]`).text());
    var multi=parseFloat($(`.multiplier-${$($(getTots)[x]).attr('data-tot')}`).text())
    var overall=Math.round(((totalmh*multi) + Number.EPSILON) * 100) / 100
    $(getXTot[x]).text(overall);
    // $(getXTot[x]).text(parseFloat($(`.tot[data-tot="${$($(getTots)[x]).attr('data-tot')}"]`).text()) * parseFloat($(`.multiplier-${$($(getTots)[x]).attr('data-tot')}`).text()));
    // $('#xd-st').text(`${ parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0") + parseFloat($(getXTot[x]).text())}`);
  }

  // total ng multiplied
  var mTot = $('#xd-st').prevAll(".xTot");
  for(let x = 0 ; x < mTot.length ; x++){
    var mtotleft=parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0");
    var mtotright=parseFloat($(mTot[x]).text());
    var mtottotal=Math.round(((mtotleft+mtotright) + Number.EPSILON) * 100) / 100
    // $('#xd-st').text(`${ parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0") + parseFloat($(mTot[x]).text())}`);
    $('#xd-st').text(`${mtottotal}`);
  }

  //subTot $('.st')
  var getST = $('.st');
  for(let x = 0 ; x < getST.length ; x++){
    $(getST[x]).text(sTot($(getST[x])));
  }

  // mhpp
  var getmhpp = $('.mhpp');
  for(let x = 0 ; x < getmhpp.length ; x++){
    $(getmhpp[x]).text(totmhpp(getmhpp[x]))
  }
}

function getTotal(iVal){
var getTots = $(`td[data-val="${iVal}"]`);
var rVal = 0;
for(let x = 0 ; x < getTots.length ; x++){
  rVal += parseFloat(getTots[x].innerText != "" ? getTots[x].innerText : "0");
}
rVal=Math.round(((rVal) + Number.EPSILON) * 100) / 100
return rVal;
}

function sTot(iVal){
  var rVal = 0;
  var getsTot = $(iVal).prevAll('td[data-val]');
  for(let x = 0 ; x < getsTot.length ; x++){
    rVal += parseFloat($(getsTot[x]).text()!= "" ? $(getsTot[x]).text() : "0")
  }
  rVal=Math.round(((rVal) + Number.EPSILON) * 100) / 100
  //total ng subTot
  $('#tot1-st').text(`${parseFloat($('#tot1-st').text() != "" ? $('#tot1-st').text() : "0") + parseFloat(rVal)}`)
  return rVal;
}

function totmhpp(iVal){
  var rVal = parseFloat($($(iVal).siblings('.st')).text());
  var getLeft = $(iVal).prevUntil('.st');
  for(let x = 0 ; x < getLeft.length ; x++){
    rVal += parseFloat($(getLeft[x]).text() != "" ? $(getLeft[x]).text() : "0");
  }
  rVal=Math.round(((rVal) + Number.EPSILON) * 100) / 100
  //total ng mhpp
  $('#tot1-mhpp').text(`${(parseFloat($('#tot1-mhpp').text() != "" ? $('#tot1-mhpp').text() : "0")) + parseFloat(rVal)}`);
  return rVal;
}
function getGroups(){
  $('#buSel').html(`<option value='' selected hidden>Select Group</option>`)
  var grps=[];
  $.post("ajax/getMyGroups.php",
  {
    empNum:empDetails['empNum']
  },
    function (data) {
      grps=$.parseJSON(data);
      grps.map(fillGroup)
      $('#buSel').val(empDetails['empGroup'])
    },
    async=false
  );
}
function fillGroup(iVal){
  var addString=`<option>${iVal}</option>`;
  $('#buSel').append(addString);
}
//#endregion

//#region Print and Export

$(document).on('click','#btnPrint',function(){
  $('.xPrint').toggle();
  $('.lower').toggleClass('lower lower_');
  print();
  $('.lower_').toggleClass('lower lower_');
  $('.xPrint').toggle();
});

$(document).on('click','#btnExport',function(){
  var cOff;
  switch($('#CO').val()){
    case "1":
      cOff="First Half";
      break;
    case "2":
      cOff="Second Half";
      break;
    case "3":
      cOff="Monthly";
      break;
  }
  $('#mainTable').table2excel({
    name: `${$('#grpSel').val()} Summary`,
    filename: `${$('#monthSel').val()}_${$('#buSel').val()}_${cOff} Man-Hour Report`
  })
});

//#endregion