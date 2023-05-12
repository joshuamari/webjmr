//#region GLOBALS
switch (document.location.hostname)
{
        case 'kdt-ph':
            rootFolder = '//kdt-ph/'; 
            break;
        case 'localhost' :
            rootFolder = '//localhost/'; 
            break;
        default : 
            rootFolder = '//kdt-ph/';
            break;
}
var empDetails=[];
checkLogin();
const defaults =getDefaults();
var projects=[];
var items=[];
var selectedProject='';
var selectedProjectString='';
var selectedItems='';
var selectedItemsString='';
var gowJobVal=[];

var jobs=[];
var del='';
var buicEdit=``;

var shareAccess=``;
const solProjID=getSolProjID();
const trainingProjID=getTrainingProjID();
const noMoreInputItems=getNoMoreInputItems();
const allAccess=getAllAccess();
//#endregion

//#region BINDS
$(document).ready(function(){
  $.ajaxSetup({async: false});
      $('.hello-user').text(empDetails['empFName']);
      ifSmallScreen();
      getMyGroups();
      getBUICGroups();
      getShareGroups();

  //#region sidebar shits
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
  sidebarBtn.addEventListener("click", () => {
    $(".sidebar").toggleClass("close");
    // console.log("pinindot")
  });
  sidebarBtn2.addEventListener("click", () => {
    $(".sidebar").addClass("close");
  });
  //#endregion
  $.ajaxSetup({async: true});
  $('.cs-loader').fadeOut(1000);
});
$(document).on('click','.editJrd-btn', function(){
    var getTR = $($(this).parents()[1]).children();
    var jrdid = $(getTR[0]).text();
    var title = $(getTR[1]).text();
    var sheet = $(getTR[2]).text();
    var paper = $(getTR[3]).text();
    var draw = $(getTR[4]).text();
    var khidate = $(getTR[5]).text();
    var khiemp = $(getTR[6]).text();
    var khidead = $(getTR[7]).text();
    var kdtdead = $(getTR[8]).text();
    var manhour = $(getTR[9]).text();
    var getTD = getTR[11];
    var editDrawRef=``;
    if(checkJRDEdit()){
      $(getTR[2]).html(`<input id='editJSheet' type='number' class='form-control'  value='${sheet}' sid='${jrdid}'>`);
    $(getTR[3]).html(`<select id='editJPaper' class="form-select" id="jrdPaper" sid='${jrdid}' required>
                        <option  selected>${paper}</option>
                        <option>A1</option>
                        <option>A2</option>
                        <option>A3</option>
                        <option>A4</option>
                    </select>`);
    $(getTR[4]).html(`<input id='editJDraw' type='text' class='form-control'  value='${draw}' sid='${jrdid}'/>`);
    $(getTR[5]).html(`<input id='editJKHIReq' type="date"class="form-control" value='${khidate}' sid='${jrdid}' required/>`);
    $(getTR[6]).html(`<input id='editJKHIC' type='text' class='form-control'  value='${khiemp}' sid='${jrdid}'>`);
    $(getTR[7]).html(`<input id='editJKHIDead' type="date"class="form-control" value='${khidead}' sid='${jrdid}' required/>`);
    $(getTR[8]).html(`<input id='editJKDTDead' type="date"class="form-control" value='${kdtdead}' sid='${jrdid}' required/>`);
    $(getTR[9]).html(`<input id='editJMH' type='number' class='form-control'  value='${manhour}' sid='${jrdid}'>`);
    }
    $(getTR[1]).html(`<input id='editJName' type='text' class='form-control'  value='${title}' sid='${jrdid}'/>`);
    

    $($('#jrdTable').find('button')).prop('disabled',true);

    $(getTD).html(`<button id='jrdsave-btn' type='button' class='btn btn-success col-3'data-bs-toggle='tooltip' data-bs-placement="bottom" title='Save'>
        <i class='bx bx-save' ></i>
        </button> <button id='jrdcancel-btn' type='button' class='btn btn-danger col-3' data-bs-toggle='tooltip' data-bs-placement="bottom" title='Cancel'>
        <i class='fa fa-ban' ></i>
        </button>`);
});
$(document).on('click','.editItem', function(){
    var getTR = $($(this).parents()[1]).children();
    var itemid = $(getTR[0]).text();
    var title = $(getTR[1]).text();
    var getTD = getTR[3];

    $(getTR[1]).html(`<input id='editIName' type='text' class='form-control'  value='${title}' sid='${itemid}'>`);


    $($('#itemTable').find('button')).prop('disabled',true);

    $(getTD).html(`<button type='button' id='itemsave-btn' class='btn btn-success col-3'data-bs-toggle='tooltip' data-bs-placement="bottom" title='Save'>
        <i class='bx bx-save' ></i>
        </button> <button type='button' class='btn btn-danger col-3' data-bs-toggle='tooltip' data-bs-placement="bottom" title='Cancel' id='itemcancel-btn'>
        <i class='fa fa-ban' ></i>
        </button>`);
});
$(document).on('click','.editProj', function(){
    var getTR = $($(this).parents()[1]).children();
    var projid = $(getTR[0]).text();
    var title = $(getTR[1]).text();
    var order = $(getTR[2]).text();
    var buic = $(getTR[3]).text();
    var getTD = getTR[5];

    $(getTR[1]).html(`<input type='text' class='form-control'  value='${title}' sid='${projid}' id='editPName'>`);
    $(getTR[2]).html(`<input type='text' class='form-control'  value='${order}' sid='${projid}' id='editPOrder'>`);
    $(getTR[3]).html(`<select class="form-select" id="buicEdit" sid='${projid}'>
                        ${buicEdit}
                      
                    </select>`);


    $($('#projTable').find('button')).prop('disabled',true);

    $(getTD).html(`<button type='button' id='projsave-btn' class='btn btn-success col-3'data-bs-toggle='tooltip' data-bs-placement="bottom" title='Save'>
        <i class='bx bx-save' ></i>
        </button> <button type='button' id='projcancel-btn' class='btn btn-danger col-3' data-bs-toggle='tooltip' data-bs-placement="bottom" title='Cancel'>
        <i class='fa fa-ban' ></i>
        </button>`);
    $('#buicEdit').val(`${buic}`);
        
});
$(document).on('click','#itemPage',function(){
  $('.project').addClass('d-none');
  $('.item').removeClass('d-none');
  $('.jrd').addClass('d-none');
});
$(document).on('click','#projectPage',function(){
  $('.project').removeClass('d-none');
  $('.item').addClass('d-none');
  $('.jrd').addClass('d-none');
});
$(document).on('click','.hoverProjNext',function(){
  getProjects();
  $('.project').addClass('d-none');
  $('.item').removeClass('d-none');
  $('.jrd').addClass('d-none');
  var getTitle = $($($(this).parent()).children()[1]).text();
  var getID = $($(this).parent()).attr('id');
  selectedProject=getID.split("_")[1];
  selectedProjectString=getTitle;
  $('#selectedProject').html(selectedProjectString);
  getItems();
});
$(document).on('click','.itemIcon',function(){
  getItems();
  $('.project').addClass('d-none');
  $('.item').addClass('d-none');
  $('.jrd').removeClass('d-none');
  var getTitle = $($($(this).parent()).nextAll()[0]).text();
  var getID = $($(this).parents()[1]).attr('id');
  selectedItems=getID.split("_")[1];
  selectedItemsString=getTitle;
  $('#selectedItem').html(selectedItemsString);
  getJobs();
  checkJRDADD();
  checkJRDAddDiv();
})
$(document).on({
  mouseenter: function () {
    var dznuts=$(this).parent().prop('id').split('_')[1];
    if((!defaults.includes(selectedProject) || selectedProject==solProjID || selectedProject==trainingProjID) && !noMoreInputItems.includes(dznuts)){
      $($(this).find('.itemPrio')).hide();
      $($(this).find('.itemIcon')).show();
    }
  },
  mouseleave: function () {
    var dznuts=$(this).parent().prop('id').split('_')[1];
    if((!defaults.includes(selectedProject) || selectedProject==solProjID || selectedProject==trainingProjID) && !noMoreInputItems.includes(dznuts)){
      $($(this).find('.itemPrio')).show();
      $($(this).find('.itemIcon')).hide();
    }
  }
}, ".hoverItemNext");
$(document).on({
  mouseenter: function () {
    $($(this).find('.projPrio')).hide();
    $($(this).find('.projIcon')).show();
  },
  mouseleave: function () {
    $($(this).find('.projPrio')).show();
    $($(this).find('.projIcon')).hide();
  }
}, ".hoverProjNext");
$(document).on('change','#myGroup',function(){
  getProjects();
  // $('.projIcon,.itemIcon').hide();
});
$(document).on('click','.checkbox',function(){
  var getTRID=$($(this).parents()[2]).attr('id');//get TR ID
  var isCheck=0;
  if($(this).is(":checked")){
    isCheck=1;
  }
  changeActive(getTRID,isCheck);
});
$(document).on('click','#addProj',function(){
  if($('#projTitle').val().length==0){
    alert('input project name');
    return;
  }
  addProject();
});
$(document).on('click','.cancelProj',function(){
  clearPModal();
});
$(document).on('click','.delBut',function(){
  del=$($(this).parents()[1]).attr('id');
});
$(document).on('click','#deleteProj',function(){
  var trID=del.split("_")[1];
  deleteProject(trID);
});
$(document).on('click','#projcancel-btn',function(){
  getProjects();
});
$(document).on('click','#projsave-btn',function(){
  var getTRID=$($(this).parents()[1]).attr('id');
  var trID=getTRID.split("_")[1];
  updateProject(trID);
});
$(document).on('click','#addItem',function(){
  if($('#itemTitle').val().length==0){
    alert('input item name');
    return;
  }
  addItem();
});
$(document).on('click','.cancelItem',function(){
  clearIModal();
});
$(document).on('click','#deleteItem',function(){
  var trID=del.split("_")[1];
  deleteItem(trID);
});
$(document).on('click','#itemcancel-btn',function(){
  getItems();
});
$(document).on('click','#itemsave-btn',function(){
  var getTRID=$($(this).parents()[1]).attr('id');
  var trID=getTRID.split("_")[1];
  updateItem(trID);
});
$(document).on('click','#addJob',function(){
  if($('#jrdTitle').val().length==0){
    alert('input description name');
    return;
  }
  addJob();
});
$(document).on('click','.cancelJob',function(){
  clearJModal();
});
$(document).on('click','#deleteJob',function(){
  var trID=del.split("_")[1];
  deleteJob(trID);
});
$(document).on('click','#jrdcancel-btn',function(){
  getJobs();
});
$(document).on('click','#jrdsave-btn',function(){
  var getTRID=$($(this).parents()[1]).attr('id');
  var trID=getTRID.split("_")[1];
  updateJob(trID);
});
$(document).on('change','#shareGroup',function(){
  checkShareValidation();
  getShareEmployees();
});
$(document).on('click','.addAccess',function(){
  var getTRID=$($(this).parents()[1]).attr('id');
  var trID=getTRID.split("_")[1];
  shareAccess=trID;
  getSharedList(shareAccess);
});
$(document).on('click','#shareAccess',function(){
  if(!checkAddShare()){
    alert('Incomplete fields');
    return;
  }
  shareProject();
});
$(document).on('click','.removeAccess',function(){
  if(!confirm("Remove Access?")){
    return;
  }
  var dd=($($(this).parents()[1]).attr('id')).split('_')[1];
  removeShare(dd);
});


//#endregion

//#region FUNCTIONS
function checkLogin(){//check if user is logged in
  $.ajaxSetup({async: false});
  $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
    empDetails=$.parseJSON(data);

    if(empDetails.length<1){
      window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
    }
    jmcAccess();
  }});
  $.ajaxSetup({async: true});
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
function getMyGroups(){//get group selection
  $.post("ajax/getMyGroup.php",
  {
    empNum:empDetails['empNum'],
  },
    function (data) {
      $('#myGroup').html(data);
      $('#myGroup').val(`${empDetails['empGroup']}`);
      getProjects();
      getGOWJob();
    }
  );
}
function getProjects(){//get projects
  $.ajaxSetup({async: false});
  projects=[];
  $.post("ajax/getProjects.php",
  {
    empGroup:$('#myGroup').val(),
    empPos:empDetails['empPos'],
    empNum:empDetails['empNum']
  },
    function (data) {
      projects=$.parseJSON(data);
      fillProj();
      selectedProject='';
      $('.projIcon').hide();
      $('#projTable').sortable({
          items: 'tr:not(.dontMove)',
          update:function(event,ui){
            var page_id_array=new Array();
            $('#projTable tr.mover').each(function(){
              var trID=($(this).attr('id')).split("_")[1];
              page_id_array.push(trID)
            });
            $.post("ajax/updatePPrio.php",
            {
              page_id_array:page_id_array
            },
              function (data) {
                getProjects();
              }
            );
          }
        });
    }
  );
  $.ajaxSetup({async: true});
}
function fillProj(){//set items to lay
  $('#projTable').empty();
  projects.map(projRow);
  // defaults.map(projRow); //pang defaults lang to
}
function projRow(iVal){//lay project table
  var iTitle = iVal.split('||')[0];
  var trID = iVal.split('||')[1] || "";
  var iOrder =  iVal.split('||')[2] || "";
  var iBU = iVal.split('||')[3] || "";
  var iActive = iVal.split('||')[4] || "";
  var iPrio = iVal.split('||')[5] || "";
  var draggable="mover";
  var activeStatus="checked";
  if(iActive==0){
    activeStatus="";
    draggable="dontMove"
  }
  //$('#flexSwitchCheckChecked1').is(":checked")
  //$('#flexSwitchCheckChecked1').prop("checked",false)
  //$($(this).parent()).attr('id');//get TR ID
  
  var nonDefaults=``;
  if(ifEditable(trID)){
    nonDefaults=`
    <td>
      <div class="form-check form-switch p-0">
        <input class="checkbox pcb" type="checkbox" role="switch" ${activeStatus}>
      </div>  
    </td>
    <td>
      <button class="btn addAccess" data-bs-toggle="modal" data-bs-target="#addEmpAccess" title="Share project access"><i class='bx bx-user-plus fs-4'></i></button>
      <button class="btn btn-warning editProj" title="Edit"><i class='bx bx-edit fs-5' ></i></button>
      <button class="btn btn-danger delBut" data-bs-toggle="modal" data-bs-target="#deleteProjModal" title="Delete"><i class='bx bx-trash fs-5'></i></button>
    </td>`;
  }
  else{
    nonDefaults=`<td></td><td></td>`;
    draggable="dontMove";
  }

  var addString=`<tr class=" text-center ${draggable}" id="p_${trID}">
  <td class="hoverProjNext"><span class="projPrio">${parseInt($('#projTable').children().length) + 1}</span><span class="projIcon"><i class='bx bxs-right-arrow fs-3 m-0 p-0' ></i></span></td>
  <td>${iTitle}</td>
  <td>${iOrder}</td>
  <td>${iBU}</td>
  ${nonDefaults}
</tr>`;
  $('#projTable').append(addString);

}
function ifEditable(iVal){//check if non default
  var vool=false;
  if(!defaults.includes(iVal)){
    vool=true;
  }
  return vool;
}
function getGOWJob(){//get draw ref for GOW
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
function getLeaveJob(){//get draw ref for leave
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
function getDefaults(){//get default projects
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
function getLeaveItems(){//get items for leave project
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
function getOtherItems(){//get items for other project
  var otherItemsArray=[];
  $.ajax({
    url: "ajax/getOtherItems.php",
    success: function (data) {
      otherItemsArray=$.parseJSON(data);
    },
    async: false
  });
  return otherItemsArray;
}
function getOtherJob(){//get draw ref for leave
  var defaultsArray=[];
  $.ajax({
    url: "ajax/getOtherJob.php",
    success: function (data) {
      defaultsArray=$.parseJSON(data);
    },
    async: false
  });
  return defaultsArray;
}
function ifSmallScreen(){
  if ($(window).width() < 426) {
    if ($(".sidebar").hasClass(".close")) {
      $(".menu-two").addClass('d-none');
    } else {
      $(".menu-two").removeClass('d-none');
    }
  } else {
    $(".menu-two").addClass('d-none');
  }
}
function changeActive(iVal,xVal){//set active/inactive
  var trType=iVal.split("_")[0];
  var trID=iVal.split("_")[1];
  $.post("ajax/changeActive.php",
  {
    trType:trType,
    trID:trID,
    empGroup:$('#myGroup').val(),
    isCheck:xVal
  },
    function (data) {
      switch(trType){
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
    }
  );
}
function addProject(){//add project to database
  var projName=$('#projTitle').val();
  var grp=$('#myGroup').val();
  var orderNum=$('#projOrder').val();
  var buic=$('#projBUIC').val();
  $.post("ajax/insertProject.php",
  {
    projName:projName,
    grp:grp,
    orderNum:orderNum,
    buic:buic,
  },
    function (data) {
      if(data.trim().length!='0'){
        alert(data.trim());
      }
      else{
        $('#cancelAddProj').click();
        getProjects();
      }
    }
  );
}
function deleteProject(iVal){//delete selected project from database
  $.post("ajax/deleteProject.php",
  {
    trID:iVal,
  },
    function (data) {
      $('#cancelDelProj').click();
      getProjects();
    }
  );
}
function getBUICGroups(){//get buic group selection
  $.ajax({
    url: "ajax/getAllGroups.php",
    success: function (response) {
      $('#projBUIC').html(response);
      buicEdit=response.trim();
    }
  });
}
function updateProject(iVal){//update selected project in database
  var id=iVal;
  var editPName=$('#editPName').val();
  var editPOrder=$('#editPOrder').val();
  var editPBUIC=$('#buicEdit').val();
  $.post("ajax/updateProject.php",
  {
    id:id,
    editPName:editPName,
    editPOrder:editPOrder,
    editPBUIC:editPBUIC
  },
    function (data) {
      getProjects();
    }
  );
}
function getItems(){//get items
  $.ajaxSetup({async: false});
  items=[];
  $.post("ajax/getItems.php",
  {
    selProj:selectedProject,
    empGroup:$('#myGroup').val(),
  },
    function (data) {
      items=$.parseJSON(data);
      fillItem();
      $('.itemIcon').hide();
      $('#itemTable').sortable({
          items: 'tr:not(.dontMove)',
          update:function(event,ui){
            var page_id_array=new Array();
            $('#itemTable tr.mover').each(function(){
              var trID=($(this).attr('id')).split("_")[1];
              page_id_array.push(trID)
            });
            $.post("ajax/updateIPrio.php",
            {
              page_id_array:page_id_array
            },
              function (data) {
                getItems();
              }
            );
          }
        });
        
      checkItemAdd();
    }
  );
  $.ajaxSetup({async: true});
}
function fillItem(){//set item to lay
  $('#itemTable').empty();
  items.map(itemRow);
  // if(selectedProjectString == "LEAVE"){
  //   leaveVal.map(itemRow)
  // }
  // if(selectedProjectString == "OTHER"){
  //   otherVal.map(itemRow)
  // }
}
function itemRow(iVal){//lay item table
  var iTitle = iVal.split('||')[0];
  var trID = iVal.split('||')[1] || "";
  var iActive = iVal.split('||')[2] || "";
  var iPrio = iVal.split('||')[3] || "";
  var draggable="mover";
  var activeStatus="checked";
  if(iActive==0){
    activeStatus="";
    draggable="dontMove"
  }
  //$('#flexSwitchCheckChecked1').is(":checked")
  //$('#flexSwitchCheckChecked1').prop("checked",false)
  //$($(this).parent()).attr('id');//get TR ID
  
  var nonDefaults=``;
  if(ifEditable(selectedProject)){
    nonDefaults=`
    <td>
      <div class="form-check form-switch p-0">
        <input class="checkbox ecb" type="checkbox" role="switch" ${activeStatus}>
      </div>  
    </td>
    <td>
    <button class="btn btn-warning editItem"><i class='bx bx-edit fs-5' ></i></button>
    <button class="btn btn-danger delBut" data-bs-toggle="modal" data-bs-target="#deleteItemModal"><i class='bx bx-trash fs-5'></i></button>
    </td>`;
  }
  else{
    nonDefaults=`<td></td><td></td>`;
    draggable="dontMove";
  }

  var addString=`<tr class=" text-center ${draggable}" id="i_${trID}">
  <td class="hoverItemNext"><span class="itemPrio">${parseInt($('#itemTable').children().length) + 1}</span><span class="itemIcon"><i class='bx bxs-right-arrow fs-3 m-0 p-0' ></i></span></td>
  <td>${iTitle}</td>
  ${nonDefaults}
</tr>`;
  $('#itemTable').append(addString);

}
function addItem(){//add item to database
  var itemName=$('#itemTitle').val();
  var grp=$('#myGroup').val();
  $.post("ajax/insertItems.php",
  {
    itemName:itemName,
    grp:grp,
    projID:selectedProject,
  },
    function (data) {
      if(data.trim().length!='0'){
        alert(data.trim());
      }
      else{
        $('#cancelAddItem').click();
        getItems();
      }
    }
  );
}
function clearPModal(){//clear project add modal fields
  $('#projTitle').val('');
  $('#projOrder').val('');
  $('#projBUIC').val('');
}
function clearIModal(){//clear item add modal fields
  $('#itemTitle').val('');
}
function clearJModal(){//clear draw ref add modal fields
  $('#jrdTitle').val('');
  $('#jrdSheet').val('');
  $('#jrdPaper').val('');
  $('#jrdDraw').val('');
  $('#jrdKhiDate').val('');
  $('#jrdCharge').val('');
  $('#jrdKhiDl').val('');
  $('#jrdKdtDl').val('');
  $('#jrdMh').val('');
}
function deleteItem(iVal){//delete selected item in database
  $.post("ajax/deleteItem.php",
  {
    trID:iVal,
  },
    function (data) {
      $('#cancelDelItem').click();
      getItems();
    }
  );
}
function updateItem(iVal){//update selected item in database
  var val=$('#editIName').val();
  var id=iVal;
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
function getJobs(){//get draw refs
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
      $('#jrdTable').sortable({
        items: 'tr:not(.dontMove)',
        update:function(event,ui){
          var page_id_array=new Array();
          $('#jrdTable tr.mover').each(function(){
            var trID=($(this).attr('id')).split("_")[1];
            page_id_array.push(trID)
          });
          $.post("ajax/updateJPrio.php",
          {
            page_id_array:page_id_array
          },
            function (data) {
              getJobs();
            }
          );
        }
      });
    }
  );
}
function fillJob(){//set draw refs to lay
  $('#jrdTable').empty();
  jobs.map(jobRow)
  getGOWJob();
}
function jobRow(iVal){//lay drawref table
  var iTitle = iVal.split('||')[0];
  var trID = iVal.split('||')[1] || "";
  var trNoSheet = iVal.split('||')[2] || "";
  var trPaperSize = iVal.split('||')[3] || "";
  var trDrawName = iVal.split('||')[4] || "";
  var trKHIDate = iVal.split('||')[5] || "";
  var trKHIC = iVal.split('||')[6] || "";
  var trKHIDeadline = iVal.split('||')[7] || "";
  var trKDTDeadline = iVal.split('||')[8] || "";
  var trExpMH = iVal.split('||')[9] || "";
  var iActive = iVal.split('||')[10] || "";
  var draggable="mover";
  var activeStatus="checked";
  if(iActive==0){
    activeStatus="";
    draggable="dontMove"
  }
  //$('#flexSwitchCheckChecked1').is(":checked")
  //$('#flexSwitchCheckChecked1').prop("checked",false)
  //$($(this).parent()).attr('id');//get TR ID
  
  var nonDefaults=``;
  if(ifEditable(selectedProject) || (selectedProject==trainingProjID && allAccess.includes(empDetails['empNum'])) || selectedProject==solProjID){
    nonDefaults=`
    <td>
      <div class="form-check form-switch p-0">
        <input class="checkbox jcb" type="checkbox" role="switch" ${activeStatus}>
      </div>  
    </td>
    <td>
    <button class="btn btn-warning editJrd-btn"><i class='bx bx-edit fs-5' ></i></button>
    <button class="btn btn-danger delBut" data-bs-toggle="modal" data-bs-target="#deleteJRDModal"><i class='bx bx-trash fs-5'></i></button>
    </td>`;
  }
  else{
    nonDefaults=`<td></td><td></td>`;
    draggable="dontMove";
  }
  var hasDrawref=`<td>${trNoSheet}</td>
  <td>${trPaperSize}</td>
  <td>${trDrawName}</td>
  <td>${trKHIDate}</td>
  <td>${trKHIC}</td>
  <td>${trKHIDeadline}</td>
  <td>${trKDTDeadline}</td>
  <td>${trExpMH}</td>`;
  if(defaultDrawref()){
    hasDrawref=`<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
  }  
  
  var addString=`<tr class="text-center ${draggable}" id="j_${trID}">
  <td>${parseInt($('#jrdTable').children().length) + 1}</td>
  <td>${iTitle}</td>
  ${hasDrawref}
  ${nonDefaults}
  </tr>`
  $('#jrdTable').append(addString);

}
function defaultDrawref(){//check if drawref for non engineering
  var sProj=selectedProject;
  var isSame=false;
  defaults.forEach(element => {
    if(sProj==element){
      isSame=true;
    }
  });
  return isSame;
}
function addJob(){//add jrd to database
  var jobName=$('#jrdTitle').val();
  var jobSheet=$('#jrdSheet').val();
  var jobPaper=$('#jrdPaper').val();
  var jobDraw=$('#jrdDraw').val();
  var jobKHIReq=$('#jrdKhiDate').val();
  var jobKHICharge=$('#jrdCharge').val();
  var jobKHIDead=$('#jrdKhiDl').val();
  var jobKDTDead=$('#jrdKdtDl').val();
  var jobMH=$('#jrdMh').val();
  var grp=$('#myGroup').val();
  $.post("ajax/insertJob.php",
  {
    jobName:jobName,
    jobSheet:jobSheet,
    jobPaper:jobPaper,
    jobDraw:jobDraw,
    jobKHIReq:jobKHIReq,
    jobKHICharge:jobKHICharge,
    jobKHIDead:jobKHIDead,
    jobKDTDead:jobKDTDead,
    jobMH:jobMH,
    grp:grp,
    projID:selectedProject,
    itemID:selectedItems,
  },
    function (data) {
      if(data.trim().length!='0'){
        alert(data.trim());
      }
      else{
        $('#cancelAddJob').click();
        getJobs();
      }
    }
  );
}
function deleteJob(iVal){//delete jrd from database
  $.post("ajax/deleteJob.php",
  {
    trID:iVal,
  },
    function (data) {
      $('#cancelDelJob').click();
      getJobs();
    }
  );
}
function checkJRDADD(){//check if jrd add has engineering fields
  $('.engr').remove();
  if(!defaults.includes(selectedProject)){
    $('#afterEngr').after(`<div class="col-12 mb-2 engr">
    <label for="jrdSheet" class="form-label">No. of Sheet</label>
    <input type="number" placeholder="#" class="form-control" id="jrdSheet"  min="0" required/>
      <span class="col-12 mt-1 alert-danger text-danger" id="j2" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
    <label for="jrdPaper" class="form-label">Paper Size</label>
    <div class="input-group col-8">
      <select class="form-select" id="jrdPaper" required>
        <option value="" hidden selected>Select paper size</option>
        <option>A1</option>
        <option>A2</option>
        <option>A3</option>
        <option>A4</option>
      </select>
    </div>
      <span class="col-12 mt-1 alert-danger text-danger" id="j3" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
  <label for="jrdDraw" class="form-label">Drawing/Document Name</label>
    <input type="text"class="form-control"id="jrdDraw" placeholder="Input Drawing/Document Name" required/>
    <span class="col-12 mt-1 alert-danger text-danger" id="j9" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
    <label for="jrdKhiDate" class="form-label">KHI Date</label>
    <input type="date"class="form-control"id="jrdKhiDate" required/>
    <span class="col-12 mt-1 alert-danger text-danger" id="j4" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
    <label for="jrdCharge" class="form-label">KHI in Charge</label>
      <input type="text"class="form-control"id="jrdCharge" placeholder="Input Employee" required/>
      <span class="col-12 mt-1 alert-danger text-danger" id="j5" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
    <label for="jrdKhiDl" class="form-label">KHI Deadline</label>
    <input type="date"class="form-control"id="jrdKhiDl" required/>
    <span class="col-12 mt-1 alert-danger text-danger" id="j6" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
    <label for="jrdKdtDl" class="form-label">KDT Deadline</label>
    <input type="date"class="form-control"id="jrdKdtDl" required/>
    <span class="col-12 mt-1 alert-danger text-danger" id="j7" role="alert"></span>
  </div>
  <div class="col-12 mb-2 engr">
    <label for="jrdMh" class="form-label">Expected Manhour</label>
    <input type="number" placeholder="#" class="form-control"  min="0" id="jrdMh"  required/>
      <span class="col-12 mt-1 alert-danger text-danger" id="j8" role="alert"></span>
  </div>`);
  }
}
function checkItemAdd(){//check if selected project can add itemofworks
  $('#divAddItem').remove();
  if(!defaults.includes(selectedProject)){
    $('#afteritem').after(
      `<div class="col-12 col-lg-2 d-flex justify-content-end" id="divAddItem">
      <button class="btn btn-add fw-bold text-center shadow w-100"
      data-bs-toggle="modal" data-bs-target="#addItemModal"><i class='bx bxs-plus-circle p-0'></i> ADD ENTRY</button>
    </div>`
    );
  }

}
function checkJRDAddDiv(){//check if selected project can add jrd
  $('#divAddJRD').remove();
  // console.log(!defaults.includes(selectedProject) || selectedProject==solProjID || (selectedProject==trainingProjID && allAccess.includes(empDetails['empNum'])))
  if(!defaults.includes(selectedProject) || selectedProject==solProjID || (selectedProject==trainingProjID && allAccess.includes(empDetails['empNum']))){
    $('#afterjrd').after(
      `<div class="col-12 col-lg-2 d-flex justify-content-end" id="divAddJRD">
      <button class="btn btn-add fw-bold text-center shadow w-100"
      data-bs-toggle="modal" data-bs-target="#addJrdModal"><i class='bx bxs-plus-circle p-0'></i> ADD ENTRY</button>
    </div>`
    );
  }
}
function checkJRDEdit(){//check if jrd edit has engineering fields
  var vool=true;
  // var defs=['1','2','3','4','5']
  if(defaults.includes(selectedProject)){
    vool=false;
  }
  return vool;
}
function updateJob(iVal){//update selected drawing reference in database
  var id=iVal;
  var editJName=$('#editJName').val();
  var editJSheet=$('#editJSheet').val();
  var editJPaper=$('#editJPaper').val();
  var editJDraw=$('#editJDraw').val();
  var editJKHIReq=$('#editJKHIReq').val();
  var editJKHIC=$('#editJKHIC').val();
  var editJKHIDead=$('#editJKHIDead').val();
  var editJKDTDead=$('#editJKDTDead').val();
  var editJMH=$('#editJMH').val();
  $.post("ajax/updateJob.php",
  {
    id:id,
    editJName:editJName,
    editJSheet:editJSheet,
    editJPaper:editJPaper,
    editJDraw:editJDraw,
    editJKHIReq:editJKHIReq,
    editJKHIC:editJKHIC,
    editJKHIDead:editJKHIDead,
    editJKDTDead:editJKDTDead,
    editJMH:editJMH
  },
    function (data) {
      getJobs();
    }
  );
}
function checkTestAccess(){//check if has access to testing
  $.post("ajax/checkTestAccess.php",
  {
    empNum:empDetails['empNum']
  },
    function (data) {
      var access=data.trim();
      if(access=='0'){
        alert('Access denied')
        window.location.href = rootFolder + "/welcome";
      }
    }
  );
}
function getShareGroups(){//get groups selections in share jmc modal
  $.post("ajax/getShareGroups.php",
  {
    empGroup:empDetails['empGroup']
  },
    function (data) {
     $('#shareGroup').html(data);
    }
  );
}
function getShareEmployees(){//get members of selected group in share jmc modal
  $.post("ajax/getShareEmployees.php",
  {
    projID:shareAccess,
    empGroup:$('#shareGroup').val()
  },
    function (data) {
      $('#shareEmployee').html(data)
    }
  );
}
function getSharedList(iVal){//get members shared with selected project
  $.post("ajax/getSharedList.php",
  {
    projID:iVal
  },
    function (data) {
      $('#sharedList').html(data)
    }
  );
}
function shareProject(){//share project to selected member
  var eid=$($('#shareEmployee').find('option:selected')).attr('e-id');
  $.post("ajax/shareProject.php",
  {
    projID:shareAccess,
    empNum:eid
  },
    function (data) {
      $('#shareEmployee').val('');
      $('#shareGroup').val('');
      getSharedList(shareAccess);
    }
  );
}
function removeShare(iVal){//remove project access from selected member
  $.post("ajax/removeShare.php",
  {
    projID:shareAccess,
    empNum:iVal
  },
    function (data) {
      getSharedList(shareAccess);
    }
  );
}
function checkShareValidation(){
  if($('#shareGroup').val().length!=0){
    $('#shareEmployee').prop('disabled',false);
  }
}
function checkAddShare(){
  var vool=true;
  if(!$('#shareGroup').val()){
    vool=false;
  }
  if(!$('#shareEmployee').val()){
    vool=false;
  }
  return vool;
}
function getSolProjID(){//get database id of solution project
    var spID=``;
    $.ajax({
      url: "ajax/getSolProjID.php",
      success: function (data) {
        spID=data.trim();
      },
      async: false
    });
    return spID;
}
function getTrainingProjID(){//get database id of training project
  var trID=``;
  $.ajax({
    url: "ajax/getTrainingProjID.php",
    success: function (data) {
      trID=data.trim();
    },
    async: false
  });
  return trID;
}
function getNoMoreInputItems(){//get ids of no more input items
  var nmiIDs=[];
  $.ajax({
    url: "ajax/getNoMoreInputItems.php",
    success: function (data) {
      nmiIDs=$.parseJSON(data)
    },
    async: false
  });
  return nmiIDs;
}
function getAllAccess(){
  var allAccessIDs=[];
  $.ajax({
    url: "ajax/getAllAccess.php",
    success: function (data) {
      allAccessIDs=$.parseJSON(data)
    },
    async: false
  });
  return allAccessIDs;
}
// var projID=$($(this).find('option:selected')).attr('proj-id');
//#endregion