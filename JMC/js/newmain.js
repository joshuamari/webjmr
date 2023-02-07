
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
var empDetails=[];
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
//#endregion

//#region BINDS
$(document).ready(function(){
  $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
    empDetails=$.parseJSON(data);
    if(empDetails.length<1){
      window.location.href=rootFolder+'/welcome'; //if result is 0, redirect to log in page
    }
    else{
      // console.log(empDetails);
      // console.log("logged in: employee#"+empDetails['empNum']);//if result is not 0, store employee number in global variable
      // console.log("logged in: firstname"+empDetails['empFName']);
      $('.hello-user').text(empDetails['empFName']);
      ifSmallScreen();
      jmcAccess();
      getMyGroups();
    }
  }});
  $('#projIcon,#itemIcon').hide();
  $('tbody').sortable({
    items: 'tr:not(.dontMove)'  
  });

});
$(document).on('click','#editJrd-btn', function(){
    var getTR = $($(this).parents()[1]).children();
    var jrdid = $(getTR[0]).text();
    var title = $(getTR[1]).text();
    var sheet = $(getTR[2]).text();
    var paper = $(getTR[3]).text();
    var khidate = $(getTR[4]).text();
    var khiemp = $(getTR[5]).text();
    var khidead = $(getTR[6]).text();
    var kdtdead = $(getTR[7]).text();
    var manhour = $(getTR[8]).text();
    var getTD = getTR[10];

    $(getTR[1]).html(`<input type='text' class='form-control'  value='${title}' sid='${jrdid}'>`);
    $(getTR[2]).html(`<input type='number' class='form-control'  value='${sheet}' sid='${jrdid}'>`);
    $(getTR[3]).html(`<select class="form-select" id="jrdPaper" sid='${jrdid}' required>
                        <option  selected>${paper}</option>
                        <option>A1</option>
                        <option>A2</option>
                        <option>A3</option>
                    </select>`);
    $(getTR[4]).html(`<input type="date"class="form-control"id="jrdKhiDate" value='${khidate}' sid='${jrdid}' required/>`);
    $(getTR[5]).html(`<input type='text' class='form-control'  value='${khiemp}' sid='${jrdid}'>`);
    $(getTR[6]).html(`<input type="date"class="form-control"id="jrdKhiDate" value='${khidead}' sid='${jrdid}' required/>`);
    $(getTR[7]).html(`<input type="date"class="form-control"id="jrdKhiDate" value='${kdtdead}' sid='${jrdid}' required/>`);
    $(getTR[8]).html(`<input type='number' class='form-control'  value='${manhour}' sid='${jrdid}'>`);

    $($('tbody').find('button')).prop('disabled',true);

    $(getTD).html(`<button type='button' class='btn btn-success jrdsave-btn col-3'data-bs-toggle='tooltip' data-bs-placement="bottom" title='Save'>
        <i class='bx bx-save' ></i>
        </button> <button type='button' class='btn btn-danger jrdcancel-btn col-3' data-bs-toggle='tooltip' data-bs-placement="bottom" title='Cancel'>
        <i class='fa fa-ban' ></i>
        </button>`);
});
$(document).on('click','#editItem-btn', function(){
    var getTR = $($(this).parents()[1]).children();
    var itemid = $(getTR[0]).text();
    var title = $(getTR[1]).text();
    var getTD = getTR[3];

    $(getTR[1]).html(`<input type='text' class='form-control'  value='${title}' sid='${itemid}'>`);


    $($('tbody').find('button')).prop('disabled',true);

    $(getTD).html(`<button type='button' class='btn btn-success itemsave-btn col-3'data-bs-toggle='tooltip' data-bs-placement="bottom" title='Save'>
        <i class='bx bx-save' ></i>
        </button> <button type='button' class='btn btn-danger itemcancel-btn col-3' data-bs-toggle='tooltip' data-bs-placement="bottom" title='Cancel'>
        <i class='fa fa-ban' ></i>
        </button>`);
});
$(document).on('click','#editProj-btn', function(){
    var getTR = $($(this).parents()[1]).children();
    var projid = $(getTR[0]).text();
    var title = $(getTR[1]).text();
    var order = $(getTR[2]).text();
    var buic = $(getTR[3]).text();
    var getTD = getTR[6];

    $(getTR[1]).html(`<input type='text' class='form-control'  value='${title}' sid='${projid}'>`);
    $(getTR[2]).html(`<input type='text' class='form-control'  value='${order}' sid='${projid}'>`);
    $(getTR[3]).html(`<select class="form-select" id="jrdPaper" sid='${projid}' required>
                        <option  selected>${buic}</option>
                        <option>...</option>
                      
                    </select>`);


    $($('tbody').find('button')).prop('disabled',true);

    $(getTD).html(`<button type='button' class='btn btn-success projsave-btn col-3'data-bs-toggle='tooltip' data-bs-placement="bottom" title='Save'>
        <i class='bx bx-save' ></i>
        </button> <button type='button' class='btn btn-danger projcancel-btn col-3' data-bs-toggle='tooltip' data-bs-placement="bottom" title='Cancel'>
        <i class='fa fa-ban' ></i>
        </button>`);
        
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
$(document).on('click','#hoverProjNext',function(){
  $('.project').addClass('d-none');
  $('.item').removeClass('d-none');
  $('.jrd').addClass('d-none');
});
$(document).on('click','#hoverItemNext',function(){
  $('.project').addClass('d-none');
  $('.item').addClass('d-none');
  $('.jrd').removeClass('d-none');
})
$(document).on({
  mouseenter: function () {
    $($(this).find('#itemPrio')).hide();
    $($(this).find('#itemIcon')).show();
  },
  mouseleave: function () {
    $($(this).find('#itemPrio')).show();
    $($(this).find('#itemIcon')).hide();
  }
}, "#hoverItemNext");
$(document).on({
  mouseenter: function () {
    $($(this).find('#projPrio')).hide();
    $($(this).find('#projIcon')).show();
  },
  mouseleave: function () {
    $($(this).find('#projPrio')).show();
    $($(this).find('#projIcon')).hide();
  }
}, "#hoverProjNext");


//sidebar shits//////

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
// console.log(sidebarBtn);
sidebarBtn.addEventListener("click", () => {
  $(".sidebar").toggleClass("close");
  console.log("pinindot")
});
sidebarBtn2.addEventListener("click", () => {
  $(".sidebar").addClass("close");
});


//#endregion

//#region FUNCTIONS
function jmcAccess(){
  $.post("ajax/jmcAccess.php",
  {
    empNum:empDetails['empNum']
  },
    function (data) {
      if(data.trim()==0){
        alert('Access denied');
        window.location.href=rootFolder+'/welcome';
      }
    }
  );
}
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
      // fillProj();
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
//#endregion