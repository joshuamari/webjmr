const defaults =getDefaults();
var projects=[];
var items=[];
var selectedProject='';
var selectedProjectString='';
var selectedItems='';
var selectedItemsString='';
const leaveVal = getLeaveItems();
var gowJobVal = [];
const leaveJobVal=getLeaveJob();
var jobs=[];

const addBtn = `<button id="addBtn" title="Add"><i class="fa fa-plus"></i></button>`;
const addInput = `Add: <input type="text" id="addThis"> <button id="checkAdd" class="addCon"><i class="fa fa-check"></i></button> <button id="timesAdd" class="addCon"><i class="fa fa-times"></i></button>`;
const projHeader = `<th class="w3-border" width="1%">No.</th>
                    <th class="w3-border">Title</th>
                    <th class="w3-border" width="10%">Order #</th>
                    <th class="w3-border" width="10%">Budget in charge</th>
                    
                    <th class="w3-border" width="1%">Active</th>
                    <th class="w3-border" width="1%">Options</th>`;
const itemHeader = `<th class="w3-border" width="1%">No.</th>
                    <th class="w3-border">Title</th>
       
                    <th class="w3-border" width="1%">Active</th>
                    <th class="w3-border" width="1%">Options</th>`;
const jobHeader =  `<th class="w3-border" width="1%">No.</th>
                    <th class="w3-border">Title</th>
                    <th class="w3-border">No. of Sheet</th>
                    <th class="w3-border">Paper Size</th>
                    <th class="w3-border">KHI Date</th>
                    <th class="w3-border">KHI In-Charge</th>
                    <th class="w3-border">KHI Deadline</th>
                    <th class="w3-border">KDT Deadline</th>
                    <th class="w3-border">Expected Manhour</th>
        
                    <th class="w3-border" width="1%">Active</th>
                    <th class="w3-border" width="1%">Options</th>`;

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
var empDetails=[];
$(document).ready(function(){
  $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
    empDetails=$.parseJSON(data);
    if(empDetails.length<1){
      window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
    }
    else{
      console.log(empDetails);
      console.log("logged in: employee#"+empDetails['empNum']);//if result is not 0, store employee number in global variable
      console.log("logged in: firstname"+empDetails['empFName']);
      //checkAdminAccess SOON here
      getMyGroups();
   
    }
  }})
  //console.log('connected main.js');
  
});


function getMyGroups(){
  $.post("ajax/getMyGroup.php",
  {
    empNum:empDetails['empNum'],
  },
    function (data) {
      $('#myGroup').html(data);
      getProjects();
      getGOWJob();
    }
  );
}
function getProjects(){
  projects=[];
  $.post("ajax/getProjects.php",
  {
    empGroup:$('#myGroup').val(),
  },
    function (data) {
      projects=$.parseJSON(data);
      fillProj();
      selectedProject='';
    }
  );
}
function getGOWJob(){
  gowJobVal=[];
  $.post("ajax/getGOWJob.php",
  {
    empGroup:$('#myGroup').val(),
  },
    function (data) {
      gowJobVal=$.parseJSON(data);
    }
  );
}
function getLeaveJob(){
  var defaultsArray=[];
  $.ajax({
    url: "ajax/getLeaveJob.php",
    success: function (data) {
      defaultsArray=$.parseJSON(data);
    },
    async: false
  });
  return defaultsArray;
}
function getDefaults(){
  var defaultsArray=[];
  $.ajax({
    url: "ajax/getDefaults.php",
    success: function (data) {
      defaultsArray=$.parseJSON(data);
    },
    async: false
  });
  return defaultsArray;
}
function getLeaveItems(){
  var leaveItemsArray=[];
  $.ajax({
    url: "ajax/getLeaveItems.php",
    success: function (data) {
      leaveItemsArray=$.parseJSON(data);
    },
    async: false
  });
  return leaveItemsArray;
}

function fillProj(){
  $('#tContent').empty();
  projects.map(projRow);
  defaults.map(projRow); //pang defaults lang to
}

function projRow(iVal){
  var iTitle = iVal.split('||')[0];
  var trID = iVal.split('||')[1] || "";
  var iOrder =  iVal.split('||')[2] || "";
  var iBU = iVal.split('||')[3] || "";
  var iActive = iVal.split('||')[4] || "";
  var iPrio = iVal.split('||')[5] || "";
  var maxPrio = iVal.split('||')[6] || "";
  var prioString=``;
  var activeStatus="";
  if(iActive==1){
    activeStatus="checked";
  }
  if(iPrio!=0){
    switch(iPrio){
      case '1':
          if(maxPrio=='1'){
            prioString+=`<td>${iPrio}</td>`;
          }
          else if(maxPrio=='2'){
            prioString+=`<td><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a></td>`;
          }
          else{
            prioString+=`<td><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
          }
          break;
      case '2':
          if(maxPrio=='2'){
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}</td>`;
          }
          else if(maxPrio=='3'){
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a></td>`;
          }
          else{
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
          }
          break;
      case (maxPrio-1):
        prioString+=`<td><a href="#" class="prio" name="maxUp")"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a>`;
          break;
      case maxPrio:
        prioString+=`<td><a href="#" class="prio" name="maxUp")"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}`;
          break;
      default:
        prioString+=`<td><a href="#" class="prio" name="maxUp")"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
    }
  }
  else{
    prioString=`<td></td>`;
  }
  var nonDefaults=``;
  if(ifEditable(iVal)=='contenteditable'){
    nonDefaults=`<td class="clBUIC" ><select class="selectBUIC" id="sel${trID}">
    </select></td>
    <td><label class="switch"><input id="cb${trID}" class="cb" type="checkbox" ${activeStatus}><span class="slider round"></span></label></td>
  <td class="w3-xlarge w3-center"><button class='delBut'><i class="fa fa-trash"></i></button></td>`;
  }
  else{
    nonDefaults=`<td></td><td></td><td></td><td></td>`;
  }
  var addString = `<tr id="${trID}">
    <td class="clickProj hoverNext"><span class="hoverID">${parseInt($('#tContent').children().length) + 1}</span><span class="hoverRight" style="display:none"><i class="fa fa-caret-right""></i></span></td>
    <td class="clTitle" ${ifEditable(iVal)}>${iTitle}</td>
    <td class="clOrder" ${ifEditable(iVal)}>${iOrder}</td>
    ${nonDefaults}
  </tr>`;
  $('#tContent').append(addString);
  selectBUIC(`${trID}`);
  if(`${iBU}`){
    $(`#sel${trID}`).val(`${iBU}`);
  }
  else{
    $(`#sel${trID}`).prop('selectedIndex',0)
  }
}

$(document).on('mouseenter','.hoverNext',function(){
  $($(this).find('.hoverID')).hide();
  $($(this).find('.hoverRight')).show();
}).on('mouseleave','.hoverNext',function(){
  $($(this).find('.hoverID')).show();
  $($(this).find('.hoverRight')).hide();
})

function ifEditable(iVal){
  if(!defaults.includes(iVal) && !leaveVal.includes(iVal) && !leaveJobVal.includes(iVal)){
    return "contenteditable";
  }
  return "";
}
function defaultDrawref(){
  var sProj=$('#sProj').text();
  var isSame=false;
  defaults.forEach(element => {
    if(sProj==element.split('||')[0]){
      isSame=true;
    }
  });
  return isSame;
}
//clickProj
$(document).on('click','.clickProj',function(){
  var getTitle = $($($(this).parent()).children()[1]).text();
  var getID = $($(this).parent()).attr('id');
  selectedProject=getID.substr(2);
  selectedProjectString=getTitle;
  $('#sProj').text(getTitle);
  $('#sProj').addClass(`w3-button`);
  getItems();
  $('#addSpan').html(addBtn);
});
function getItems(){
  items=[];
  $.post("ajax/getItems.php",
  {
    selProj:selectedProject,
    empGroup:$('#myGroup').val(),
  },
    function (data) {
      items=$.parseJSON(data);
      fillItem();
    }
  );
}
function fillItem(){
  $('#tContent').empty();
  $('#headRow').removeClass();
  $('#headRow').addClass('w3-center w3-border kawasaki-blue60 w3-container');
  $('#headName').text(`Item of Works (Dwg. No.) - ${selectedProjectString}`);
  items.map(itemRow);
  if(selectedProjectString == "LEAVE"){
    leaveVal.map(itemRow)
  }
  $('#headCols').html(itemHeader);
  $('#headRow').prop('colspan','5');
}

function itemRow(iVal){
  var iTitle = iVal.split('||')[0];
  var trID = iVal.split('||')[1] || "";
  var iActive = iVal.split('||')[2] || "";
  var iPrio = iVal.split('||')[3] || "";
  var maxPrio = iVal.split('||')[4] || "";
  var prioString=``;
  var activeStatus="";
  if(iActive==1){
    activeStatus="checked";
  }
  if(iPrio!=0){
    switch(iPrio){
      case '1':
          if(maxPrio=='1'){
            prioString+=`<td>${iPrio}</td>`;
          }
          else if(maxPrio=='2'){
            prioString+=`<td><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a></td>`;
          }
          else{
            prioString+=`<td><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
          }
          break;
      case '2':
          if(maxPrio=='2'){
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}</td>`;
          }
          else if(maxPrio=='3'){
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a></td>`;
          }
          else{
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
          }
          break;
      case (maxPrio-1):
        prioString+=`<td><a href="#" class="prio" name="maxUp"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a>`;
          break;
      case maxPrio:
        prioString+=`<td><a href="#" class="prio" name="maxUp"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}`;
          break;
      default:
        prioString+=`<td><a href="#" class="prio" name="maxUp"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
    }
  }
  else{
    prioString=`<td></td>`;
  }
  var nonDefaults=``;
  if(ifEditable(iVal)=='contenteditable'){
    nonDefaults=`
  <td><label class="switch"><input id="cb${trID}" class="cb" type="checkbox" ${activeStatus}><span class="slider round"></span></label></td>
  <td class="w3-xlarge w3-center"><button class='delBut'><i class="fa fa-trash"></i></button></td>`;
  }
  else{
    nonDefaults=`<td></td><td></td><td></td>`;
  }
  var addString = `<tr id="${trID}">
    <td class="clickItem hoverNext"><span class="hoverID">${parseInt($('#tContent').children().length) + 1}</span><span class="hoverRight" style="display:none"><i class="fa fa-caret-right""></i></span></td>">${parseInt($('#tContent').children().length) + 1}</td>
    <td class="clTitle" ${ifEditable(iVal)}>${iTitle}</td>
    ${nonDefaults}
  </tr>`;
  $('#tContent').append(addString);
}

//clickItem
$(document).on('click','.clickItem',function(){
  var getTitle = $($($(this).parent()).children()[1]).text();
  var getID = $($(this).parent()).attr('id');
  selectedItems=getID.substr(2);
  selectedItemsString=getTitle;
  $('#sItem').addClass(`w3-button`);
  $('#sItem').text(getTitle);
  getJobs();
  $('#addSpan').html(addBtn);
});
function getJobs(){
  jobs=[];
  $.post("ajax/getJobs.php",
  {
    empGroup:$('#myGroup').val(),
    selProj:selectedProject,
    selItem:selectedItems,
  },
    function (data) {
      jobs=$.parseJSON(data);
      fillJob();
    }
  );
}

function fillJob(){
  $('#tContent').empty();
  $('#headRow').removeClass();
  $('#headRow').addClass('w3-center w3-border kawasaki-turquoiseblue60 w3-container');
  $('#headName').text(`Job Request Description - ${selectedItemsString}`);
  jobs.map(jobRow)
  getGOWJob();
  if($('#sProj').text() == "GENERAL OFFICE WORK"){
    gowJobVal.map(jobRow); // mga common sa GOW
  }
  if($('#sProj').text() == "LEAVE"){
    leaveJobVal.map(jobRow); // mga common sa Leave
  }
  $('#headCols').html(jobHeader);
  $('#headRow').prop('colspan','12');
}

function jobRow(iVal){
  var iTitle = iVal.split('||')[0];
  var trID = iVal.split('||')[1] || "";
  var trNoSheet = iVal.split('||')[2] || "";
  var trPaperSize = iVal.split('||')[3] || "";
  var trKHIDate = iVal.split('||')[4] || "";
  var trKHIC = iVal.split('||')[5] || "";
  var trKHIDeadline = iVal.split('||')[6] || "";
  var trKDTDeadline = iVal.split('||')[7] || "";
  var trExpMH = iVal.split('||')[8] || "";
  var iActive = iVal.split('||')[9] || "";
  var iPrio = iVal.split('||')[10] || "";
  var maxPrio = iVal.split('||')[11] || "";
  var prioString=``;
  var activeStatus="";
  if(iActive==1){
    activeStatus="checked";
  }
  if(iPrio!=0){
    switch(iPrio){
      case '1':
          if(maxPrio=='1'){
            prioString+=`<td>${iPrio}</td>`;
          }
          else if(maxPrio=='2'){
            prioString+=`<td><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a></td>`;
          }
          else{
            prioString+=`<td><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
          }
          break;
      case '2':
          if(maxPrio=='2'){
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}</td>`;
          }
          else if(maxPrio=='3'){
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a></td>`;
          }
          else{
            prioString+=`<td><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
          }
          break;
      case (maxPrio-1):
        prioString+=`<td><a href="#" class="prio" name="maxUp")"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a>`;
          break;
      case maxPrio:
        prioString+=`<td><a href="#" class="prio" name="maxUp")"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}`;
          break;
      default:
        prioString+=`<td><a href="#" class="prio" name="maxUp")"><i class="fa fa-angle-double-up" style="font-size:24px"></i></a><br><a href="#" class="prio" name="oneUp"><i class="fa fa-caret-up" style="font-size:24px"></i></a><br>${iPrio}<br><a href="#" class="prio" name="oneDown"><i class="fa fa-caret-down" style="font-size:24px"></i></a><br><a href="#" class="prio" name="maxDown"><i class="fa fa-angle-double-down" style="font-size:24px"></i></a></td>`;
    }
  }
  else{
    prioString=`<td></td>`;
  }
  var nonDefaults=``;
  if(ifEditable(iVal)=='contenteditable'){
    nonDefaults=`
  <td><label class="switch"><input id="cb${trID}" class="cb" type="checkbox" ${activeStatus}><span class="slider round"></span></label></td>
  <td class="w3-xlarge w3-center"><button class='delBut'><i class="fa fa-trash"></i></button></td>`;
  }
  else{
    nonDefaults=`<td></td><td></td><td></td>`;
  }
  var hasDrawref=`<td contenteditable class="cltrNoSheet">${trNoSheet}</td>
  <td contenteditable class="cltrPaperSize">${trPaperSize}</td>
  <td><input type="date" class="eDates" id="cltrKHIDate" value="${trKHIDate}"></td>
  <td contenteditable class="cltrKHIC">${trKHIC}</td>
  <td><input type="date" class="eDates" id="cltrKHIDeadline" value="${trKHIDeadline}"></td>
  <td><input type="date" class="eDates" id="cltrKDTDeadline" value="${trKDTDeadline}"></td>
  <td contenteditable class="cltrExpMH">${trExpMH}</td>`;
  if(defaultDrawref()){
    hasDrawref=`<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
  }  
  var addString = `<tr id="${trID}">
  <td class="hoverNext"><span class="hoverID">${parseInt($('#tContent').children().length) + 1}</span><span class="hoverRight" style="display:none"><i class="fa fa-caret-right""></i></span></td>">${parseInt($('#tContent').children().length) + 1}</td>
  <td class="clTitle" ${ifEditable(iVal)}>${iTitle}</td>
  ${hasDrawref}
  ${nonDefaults}
</tr>`;
  $('#tContent').append(addString);

}


//#region Click upperB's
//click Proj
$(document).on('click','#sProj.w3-button',function(){
  $('#headRow').removeClass();
  $('#headRow').addClass('w3-center w3-border kawasaki-deepblue60 w3-container');
  $('#headName').text(`Project`);
  $(this).text('#');
  $($(this).nextAll()).text('#');
  $($(this).nextAll()).removeClass('w3-button');
  $(this).removeClass('w3-button');
  getProjects();
  $('#addSpan').html(addBtn);
  $('#headCols').html(projHeader);
  $('#headRow').prop('colspan','7');
});

//click Item
$(document).on('click','#sItem.w3-button',function(){
  $('#headRow').removeClass();
  $('#headRow').addClass('w3-center w3-border kawasaki-blue60 w3-container');
  $('#headName').text(`Item of Works (Dwg. No.)`);
  $(this).text('#');
  $($(this).nextAll()).text('#');
  $($(this).nextAll()).removeClass('w3-button');
  fillItem($($(this).prev()).text());
  $(this).removeClass('w3-button');
  $('#addSpan').html(addBtn);
});

//#endregion

$(document).on('click','#addBtn',function(){
  $('#addSpan').html(addInput);
});

$(document).on('click','.addCon',function(){
  var getId = this.id;
  switch(getId){
    case 'timesAdd':
      $('#addSpan').html(addBtn);
      break;
    case 'checkAdd':
      if(selectedProject=='' && selectedItems==''){
        insertProject();
      }
      if(selectedProject!='' && selectedItems==''){
        insertItems();
      }
      if(selectedProject!='' && selectedItems!=''){
        insertJob();
      }
      $('#addSpan').html(addBtn);
      break;
    default:
      alert(`why are you here`);
      break;
  }
});
function insertProject(){
  var projName=$('#addThis').val();
  var grp=$('#myGroup').val();
  $.post("ajax/insertProject.php",
  {
    projName:projName,
    grp:grp,
  },
    function (data) {
      //console.log(data)
      getProjects();
    }
  );
}
function insertItems(){
  var itemName=$('#addThis').val();
  var grp=$('#myGroup').val();
  $.post("ajax/insertItems.php",
  {
    itemName:itemName,
    grp:grp,
    projID:selectedProject,
  },
    function (data) {
      getItems();
    }
  );
}
function insertJob(){
  var jobName=$('#addThis').val();
  var grp=$('#myGroup').val();
  $.post("ajax/insertJob.php",
  {
    jobName:jobName,
    grp:grp,
    projID:selectedProject,
    itemID:selectedItems,
  },
    function (data) {
      getJobs();
    }
  );
}
$(document).on('blur','td[contenteditable]',function(){
  var getID = $($(this).parent()).attr('id');
  //console.log(getID,$(this).attr('class'),this.innerText);
  // this.innerText >> eto yung laman ng td
  // $(this).attr('class') >> yung class neto yung
  var trID=getID.substr(2);
  var type=getID[0];
  switch (type){
    case "p":
      updateProject($(this).attr('class'),this.innerText,trID)
      break;
    case "i":
      updateItems(this.innerText,trID)
      break;
    case "j":
      updateJob($(this).attr('class'),this.innerText,trID)
      break;
  }
})
$(document).on('change','.eDates',function(){
  var getID = $($(this).parents()[1]).attr('id');
  var trID=getID.substr(2);
  var iDate=$(this).val();
  updateJob($(this).attr('id'),iDate,trID)
})
function updateProject(iVal,xVal,yVal){
  var clmn=iVal;
  var val=xVal;
  var id=yVal;
  $.post("ajax/updateProject.php",
  {
    clmn:clmn,
    val:val,
    id:id,
  },
    function (data) {
      //console.log(data)
      getProjects();
    }
  );
}
function updateItems(xVal,yVal){
  var val=xVal;
  var id=yVal;
  $.post("ajax/updateItems.php",
  {
    val:val,
    id:id,
  },
    function (data) {
      getItems();
    }
  );
}
function updateJob(iVal,xVal,yVal){
  var clmn=iVal;
  var val=xVal;
  var id=yVal;
  $.post("ajax/updateJob.php",
  {
    clmn:clmn,
    val:val,
    id:id,
  },
    function (data) {
      //console.log(data)
      getJobs();
    }
  );
}
$(document).on('click','.delBut',function(){
  if(!confirm("Confirm Delete?")){
    return;
  }
  var getID = $($(this).parents()[1]).attr('id');
  var type=getID[0];
  var trID=getID.substr(2);
  switch (type){
    case "p":
      deleteProject(trID);
      break;
    case "i":
      deleteItem(trID);
      break;
    case "j":
      deleteJob(trID);
      break;
  }

  
});
function deleteProject(iVal){
  $.post("ajax/deleteProject.php",
  {
    trID:iVal,
  },
    function (data) {
      //console.log(data)
      getProjects();
    }
  );
}
function deleteItem(iVal){
  $.post("ajax/deleteItem.php",
  {
    trID:iVal,
  },
    function (data) {
      //console.log(data)
      getItems();
    }
  );
}
function deleteJob(iVal){
  $.post("ajax/deleteJob.php",
  {
    trID:iVal,
  },
    function (data) {
      //console.log(data)
      getJobs();
    }
  );
}
$(document).on('change','#myGroup',function(){
  if($('#sProj').text()!="#"){
    $('#sProj').click();
  }
  else{
    getProjects();
  }
});
$(document).on('click','.cb',function(){
  var getID = $($($(this).parents()[1]).parents()).attr('id');
  var type=getID[0];
  var trID=getID.substr(2);
  var isCheck=$(this).is(":checked");
  var projID=selectedProject;
  var itemID=selectedItems;
  $(this).attr('disabled',true);
  $.post("ajax/changeActive.php",
  {
      type:type,
      trID:trID,
      isCheck:isCheck,
      empGroup:$('#myGroup').val(),
      projID:projID,
      itemID:itemID
  },function(data){
    //console.log(data)
    switch(type){
      case "p":
        getProjects();
        break;
      case "i":
        getItems();
        break;
      case "j":
        getJobs();
        break;
    }
  });
});
$(document).on('click','.prio',function(){
  $(this).prop("disabled",true);
  var getID = $($(this).parents()[1]).attr('id');
  var type=getID[0];
  var trID=getID.substr(2);
  var prioVal=$(this).attr('name');
  var projID=selectedProject;
  var itemID=selectedItems;
  $.post("ajax/prioChange.php",
  {
    type:type,
    trID:trID,
    empGroup:$('#myGroup').val(),
    prioVal:prioVal,
    projID:projID,
    itemID:itemID
  },function(data,status){
    //console.log(data)
    switch(type){
      case "p":
        getProjects();
        break;
      case "i":
        getItems();
        break;
      case "j":
        getJobs();
        break;
    }
  });
});
function selectBUIC(iVal){
  $.ajaxSetup({async: false});
  $.ajax({
    url: "ajax/getAllGroups.php",
    success: function (response) {
      $(`#sel${iVal}`).html(response);
    }
  });
  $.ajaxSetup({async: true});
}
$(document).on('change','.selectBUIC',function(){
  var getID = $($(this).parents()[1]).attr('id');
  var trID=getID.substr(2);
  var buic=$(this).val();
  updateProject('clBUIC',buic,trID)
})