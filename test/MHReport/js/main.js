// switch (document.location.hostname)
// {
//         case 'kdt-ph':
//             rootFolder = '//kdt-ph/update_test/'; 
//             break;
//         case 'localhost' :
//             rootFolder = '//localhost/'; 
//             break;
//         default : 
//             rootFolder = '//kdt-ph/update_test/';
//             break;
// }
var dateNgayon = new Date();

//emp#||Name||Group and Desig
const empList = ['300||AAA||Env', '310||BBB||Env', '400||CCC||Env', '410||DDD||Env', '420||EEE||Env', '320||FFF||Pip', '330||GGG||Civ']

//Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
const testHeader = ['Env||6311051-P300||Komuradai||P||51', 'Env||6311052-P300||Aizu||P||69', 'Env||6311053-P300||Kirishima||P||72', 'Env||61H3E35-020L||STP75||P||81', 'Env||61WXXXX-XXX1||KHI Indirect||P||87', 'Env||6311053-P300||Kirishima||J||89', 'Env||61HXXXX-XXXX||KHI Indirect||J||98', 'Env||61WXXXX-XXXX||KHI Indirect||J||112'];

//emp#||dbIndex||duration
const entries = ['300||51||50', '300||89||80', '300||98||10', '300||112||10', '310||51||150', '400||69||100', '400||81||20', '400||87||30', '410||72||150', '320||69||50', '330||72||50']

//pwede rin to galing db (initialize once)
const codeArr = { Cem: "61W2201", Mil: "61W2201", Chem: "61W2252", Cryo: "61W2971", MH: "61W2202", AH: "61W2714", Env: "61W2322", EE: "61W2283", Civ: "61W2211", Pip: "61W2510", Boi: "61W2725", KHI: "61W2102", KDT: "61W2102-8900" }

//grp||proj Code||Proj Name||Location(P/J)||dbIndex
const mgaNahiram = ['Cem||6269420-P300||Hehe||P||469', 'EE||6242069-P100||Haha||P||999']

//emp#||dbIndex||duration
const hiramEntries = ['410||469||5', '410||999||5', '320||469||5', '330||999||5'];

//emp#||td class||duration
const mngkdt = ['300||M1||130', '310||M1||120', '400||M1||50', '400||M2||10', '300||K1||2.5', '300||B1||2.5', '310||K1||5', '310||B1||5', '400||K1||2.5', '400||B1||2.5', '400||K2||1.5', '400||B2||1.5', '410||K1||5', '410||B1||5', '420||K1||75', '420||B1||75',
];

//emp#||

$(document).ready(function () {
  // $.post("Includes/checkLogin.php",
  //   {
  //   },function(data,status){
  //       if(data==0){
  //           window.location.href=rootFolder+'/welcome';
  //       }
  //   });
  createTable(testHeader, empList, entries, mgaNahiram, hiramEntries, mngkdt, $('#buSel').val());
})

function createTable(hVal, eVal, nVal, bVal, pVal, mVal, BU) {
  // $('#mainTable').html(`<thead class="sticky-top">
  $('#mainTable').html(`<thead>
  <tr id="tr1">
    <th rowspan="4" title="Employee Number">#</th>
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
  $('#tr1').append(`<th rowspan="4">Sub-total</th>`);
  $('.empRow').append(`<td class="st"></td>`);
  $('#tot1').append(`<td id="tot1-st"></td>`);
  $('#multiplier').append(`<td></td>`);
  $('#xd').append(`<td id="xd-st"></td>`);
  afterSub(BU);
  pHead(bVal);
  $('#tr1').append(`<th rowspan="4">Monthly Man-hour per Person</th>`);
  $('th,td').addClass('border border-secondary border-1 bg-white');
  $('.empRow').append(`<td class="mhpp"></td>`);
  $('#tot1').append(`<td id="tot1-mhpp"></td>`);
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
  iVal.forEach(function callback(element, index) {
    //Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
    var splitVal = element.split("||");
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
  var addThis = ["Management", "KDT", iVal];
  //Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
  var headers = [`Management||${codeArr[iVal]}||100%||P||M1`, `Management||${codeArr[iVal]}||100%||J||M2`, `KDT||${codeArr["KDT"]}||50%||P||K1`, `KDT||${codeArr["KDT"]}||50%||P||K2`, `${iVal}||${codeArr[iVal]}||50%||P||B1`, `${iVal}||${codeArr[iVal]}||50%||J||B2`];
  pHead(headers);
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
    $(getXTot[x]).text(parseFloat($(`.tot[data-tot="${$($(getTots)[x]).attr('data-tot')}"]`).text()) * parseFloat($(`.multiplier-${$($(getTots)[x]).attr('data-tot')}`).text()));
    // $('#xd-st').text(`${ parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0") + parseFloat($(getXTot[x]).text())}`);
  }

  // total ng multiplied
  var mTot = $('#xd-st').prevAll(".xTot");
  for(let x = 0 ; x < mTot.length ; x++){
    $('#xd-st').text(`${ parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0") + parseFloat($(mTot[x]).text())}`);
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
return rVal;
}

function sTot(iVal){
  var rVal = 0;
  var getsTot = $(iVal).prevAll('td[data-val]');
  for(let x = 0 ; x < getsTot.length ; x++){
    rVal += parseFloat($(getsTot[x]).text()!= "" ? $(getsTot[x]).text() : "0")
  }
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
  //total ng mhpp
  $('#tot1-mhpp').text(`${(parseFloat($('#tot1-mhpp').text() != "" ? $('#tot1-mhpp').text() : "0")) + parseFloat(rVal)}`);
  return rVal;
}