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
            rootFolder = '//kdt-ph/update_test/';
            break;
}
var empDetails=[];
var editID = "";
var mgaKulang = [];


//#endregion

//#region BINDS
$(document).ready(function(){//page Initialize Event
    $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check 9 is logged in
        empDetails=$.parseJSON(data);
        if(empDetails.length<1){//if result is 0, redirect to log in page
          window.location.href=rootFolder+'/KDTPortalLogin'; 
        }
        else{//if result is not 0, store employee number in global variable
        //   console.log(empDetails);
        //   console.log("logged in: employee#"+empDetails['empNum']);
        //   console.log("logged in: firstname"+empDetails['empFName']);
        $('.hello-user').text(empDetails['empFName']);
        // checkTestAccess();
        }
      },async:false});
        ifSmallScreen();
        initializeDate();

        getMyGroups();
        getEntries();
        sequenceValidation();
        sequenceEditValidation();
       
        //#region sidebarshits
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
        // console.log("pinindot")
        });
        sidebarBtn2.addEventListener("click", () => {
        $(".sidebar").addClass("close");
        });
        //#endregion

        //#region input time validation
        var inputHour = document.getElementById("getHour");
            
                var invalidChars = [
                    "-",
                    "+",
                    "e",
                    "."
                ];

                inputHour.addEventListener("input", function() {
                    this.value = this.value.replace(/[e\+\-\.]/gi, "");
                });
                

                inputHour.addEventListener("keydown", function(e) {
                    if (invalidChars.includes(e.key)) {
                        e.preventDefault();
                    }
                });
        var inputMin = document.getElementById("getMin");
            
                var invalidChars = [
                    "-",
                    "+",
                    "e",
                    "."
                ];

                inputMin.addEventListener("input", function() {
                    this.value = this.value.replace(/[e\+\-\.]/gi, "");
                });
                

                inputMin.addEventListener("keydown", function(e) {
                    if (invalidChars.includes(e.key)) {
                        e.preventDefault();
                    }
                });
        //#endregion
        $('.cs-loader').fadeOut(1000);
    });


$(document).on('change','#idGroup',function(){//select Group Event

    getProjects();
    $('#p1').text("");
    $(this).removeClass('border-danger');
    $('.iow').removeClass('active');
    
});
$(document).on('change','#editPlanningEntry #idGroup',function(){//select Group Event

    getEditProjects();
    $('#e1').text("");
    $(this).removeClass('border-danger');
    $('#editPlanningEntry .iow').removeClass('active');
});

$(document).on('change','#idProject',function(){//select Project Event
    var projID=$($(this).find('option:selected')).attr('proj-id');//get ID of selected Project
    $('#idJRD').val('');//clear Job Request Description
    $('#idItem').val(null).change();
    if($('#idItem').val() == null || $('#idItem').val() == ""){
        $('#idItem').empty().append(`<option selected hidden disabled value="">Select Item of Works</option>`);
    }
    getItems(projID);
    // getItemSearch(projID)
    $('.iow').removeClass('active');
    $('#p2').text("");
    $(this).removeClass('border-danger');
});

$(document).on('change','#editPlanningEntry #idProject',function(){//select Project Event
    var projID=$($(this).find('option:selected')).attr('proj-id');//get ID of selected Project
    $('#editPlanningEntry #idJRD').val('');//clear Job Request Description
    $('#editPlanningEntry #idItem').val(null).change();
    if($('#editPlanningEntry #idItem').val() == null || $('#idItem').val() == ""){
        $('#editPlanningEntry #idItem').empty().append(`<option selected hidden disabled value="">Select Item of Works</option>`);
    }
    getEditItems(projID);
    // getItemSearch(projID)
    $('#editPlanningEntry .iow').removeClass('active');
    $('#e2').text("");
    $(this).removeClass('border-danger');
});



$(document).on('change','#idItem',function(){//select Item Event
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    var itemID=$($(this).find('option:selected')).attr('item-id');
    
    getJobs(projID,itemID);
    // getJRDSearch(projID,itemID);
    $('#p3').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change','#editPlanningEntry #idItem',function(){//select Item Event
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    var itemID=$($(this).find('option:selected')).attr('item-id');
    
    getEditJobs(projID,itemID);
    // getJRDSearch(projID,itemID);
    $('#e3').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change', '#idJRD', function(){
    $('#p4').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change', '#editPlanningEntry #idJRD', function(){
    $('#e4').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change', '#idEmp', function(){
    $('#p5').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change', '#editPlanningEntry #idEmp', function(){
    $('#e5').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change','#idStartDate',function(){//select Date Event
    $('#p6').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change','#editPlanningEntry #idStartDate',function(){//select Date Event
    $('#e6').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change','#idEndDate',function(){//select Date Event
    $('#p7').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change','#editPlanningEntry #idEndDate',function(){//select Date Event
    $('#e7').text("");
    $(this).removeClass('border-danger');
});

$(document).on('change', '#idMH', function(){
    $('#p8').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change', '#editPlanningEntry #idMH', function(){
    $('#e8').text("");
    $(this).removeClass('border-danger');
});

$(document).on('click','#idAdd',function(){
    addEntries();
})
$(document).on('click',' #idEdit',function(){
    editEntries();
})

$(document).on('click','#idProject',function(event){
    event.stopPropagation();
    $('.proj').toggleClass('active');
    $('.jord').removeClass('active');
    $('.iow').removeClass('active');
    $(this).blur();
});


$(document).on('click','body',function(event){
    if(!$('.proj .content').is(event.target) && $('.proj .content').has(event.target).length === 0){
        $('.proj').removeClass('active');
    }
   
    if(!$('.iow .content').is(event.target) && $('.iow .content').has(event.target).length === 0){
        $('.iow').removeClass('active');
    }
   
    if(!$('.jord .content').is(event.target) && $('.jord .content').has(event.target).length === 0){
        $('.jord').removeClass('active');
    }
   
})

$(document).on('click','#projOptions li',function(){
    $('.proj').removeClass('active');
    var projID=$(this).attr('proj-id');
    $($('#idProject').find(`option[proj-id=${projID}]`)).prop('selected',true).change(); 
})
$(document).on('click','#editPlanningEntry #projOptions li',function(){
    $('#editPlanningEntry .proj').removeClass('active');
    var projID=$(this).attr('proj-id');
    $($('#editPlanningEntry #idProject').find(`option[proj-id=${projID}]`)).prop('selected',true).change(); 
})

$(document).on('keyup','#searchproj',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getProjSearch();
});
$(document).on('search','#searchproj',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getProjSearch();
});
$(document).on('keyup','#editPlanningEntry #searchproj',function(){
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    getEditProjSearch();
});
$(document).on('search','#editPlanningEntry #searchproj',function(){
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    getEditProjSearch();
});

$(document).on('click','#idItem',function(event){
    event.stopPropagation();
    $('.iow').toggleClass('active');
    $('.proj').removeClass('active');
    $('.jord').removeClass('active');
    $(this).blur();

})

$(document).on('click','#itemOptions li',function(){
    $('.iow').removeClass('active');
    var itemID=$(this).attr('item-id');
    $($('#idItem').find(`option[item-id=${itemID}]`)).prop('selected',true).change(); 
})
$(document).on('click','#editPlanningEntry #itemOptions li',function(){
    $('#editPlanningEntry .iow').removeClass('active');
    var itemID=$(this).attr('item-id');
    $($('#editPlanningEntry #idItem').find(`option[item-id=${itemID}]`)).prop('selected',true).change(); 
})

$(document).on('keyup','#searchitem',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getItemSearch(projID);
});
$(document).on('search','#searchitem',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getItemSearch(projID);
});

$(document).on('keyup','#editPlanningEntry #searchitem',function(){
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    getEditItemSearch(projID);
});
$(document).on('search','#editPlanningEntry #searchitem',function(){
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    getEditItemSearch(projID);
});

$(document).on('click','#idJRD',function(event){
    event.stopPropagation();
    $('.jord').toggleClass('active');
    $('.iow').removeClass('active');
    $('.proj').removeClass('active');
    $(this).blur();
})
$(document).on('click','#jrdOptions li',function(){
    $('.jord').removeClass('active');
    var jrdID=$(this).attr('job-id');
    $($('#idJRD').find(`option[job-id=${jrdID}]`)).prop('selected',true).change();
})
$(document).on('click','#editPlanningEntry #jrdOptions li',function(){
    $('#editPlanningEntry .jord').removeClass('active');
    var jrdID=$(this).attr('job-id');
    $($('#editPlanningEntry #idJRD').find(`option[job-id=${jrdID}]`)).prop('selected',true).change();
})
$(document).on('keyup','#searchjrd',function(){
    var itemID=$($('#idItem').find('option:selected')).attr('item-id');
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    
    getJRDSearch(projID,itemID);
});
$(document).on('keyup','#editPlanningEntry #searchjrd',function(){
    var itemID=$($('#editPlanningEntry #idItem').find('option:selected')).attr('item-id');
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    
    getEditJRDSearch(projID,itemID);
});
$(document).on('search','#searchjrd',function(){
    var itemID=$($('#idItem').find('option:selected')).attr('item-id');
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    
    getJRDSearch(projID,itemID);
});
$(document).on('search','#editPlanningEntry #searchjrd',function(){
    var itemID=$($('#editPlanningEntry #idItem').find('option:selected')).attr('item-id');
    var projID=$($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    
    getEditJRDSearch(projID,itemID);
});
$(document).on('click', '.badge', function(){
    $('#editStatus').modal('show');


})
$(document).on('click', '#idEditStatus', function(){
    $('#editStatus').modal('hide');
    $('.bdge').html(`<button class="badge done bg-success border-0  w-100">Finished - 12/22/2023</button>`)
})
$(document).on('click', '#editPlanning', function(){
    var getTR = $(this).closest('tr');
})
$(document).on('click', '.cancel', function(){
    resetEntry();
})
$(document).on('click', '.cancel1', function(){
    resetEditEntry();
})

//#endregion

//#region FUNCTIONS


function initializeDate(){//Initialize Selected Date
    $.ajax({
        url: "ajax/getDate.php",
        success: function (response) {
            $('#idDRDate').val(response);
        },async:false
    });

}
function getMyGroups(){//get Group Selection
    $.ajaxSetup({async: false});
    $.post("ajax/getMyGroups.php",
    {
        empNum:empDetails['empNum']
    },
        function (data) {
            $('#idGroup').html(data);
            $('#editPlanningEntry #idGroup').html(data);
        }
    );
    $.ajaxSetup({async: true});
}

function addRow(iVal){//map Entries for display
    // ["primary_id||location||group||project||item||description||hour||mht"]
    var pId = iVal.split('||')[0];
    var loc = iVal.split('||')[1];
    var group = iVal.split('||')[2];
    var project = iVal.split('||')[3];
    var item = iVal.split('||')[4];
    var desc = iVal.split('||')[5];
    var hour = parseFloat(iVal.split('||')[6]);
    var mht = iVal.split('||')[7];
    var rmrks = iVal.split('||')[8];
    var del = ``;
    if(iVal.split('||')[9]==1){
        del=`<strong>(Deleted)</strong>`;
    }
    const mhtyp = ["Regular", "OT", "Leave"];
    switch(mht){
        case "0":
            regCount+=hour;
            break;
        case "1":
            otCount+=hour;
            break;
        case "2":
            lvCount+=hour;
            break;
        default:
            alert("WTF")
            break;
    }
    var addString = `
    <tr id="${mht}_${pId}" title="${rmrks}" >
    <td>${loc}</td>
    <td>${group}</td>
    <td>${del}${project}</td>
    <td>${item}</td>
    <td>${desc}</td>
    <td>${parseFloat(hour/60).toFixed(2)}</td>
    <td>${mhtyp[mht]}</td>
    <td><button class="btn btn-primary action selectBut" id="selectBut" title="Duplicate Items"><i class="text-light  bx bx-duplicate"></i></button><button class="btn btn-warning action edit" title="Edit" edit-entry><i class="fa fa-pencil"></i></button><button class="btn btn-danger action delBut" title="Delete"><i class="text-light fa fa-trash"></i></button>
    </td>
    </tr>
    `;
    $('#drEntries').append(addString);
}
function getEntries(){//get Daily Report Entries
    regCount=0;
    otCount=0;
    lvCount=0;
    $('#drEntries').empty();
    $.post("ajax/getEntries.php",
    {
        curDay:$('#idDRDate').val(),
        empNum:empDetails['empNum']
    },
    function (data) {
        var entries=$.parseJSON(data);
        if(entries.length>0){
            entries.map(addRow);
        }
        else{
            var addString = `<tr ><td colspan='8'class="text-center py-5 "><h3>No Entries Found</h3></td></tr>`;
    $('#drEntries').append(addString);
        }
        
    }
    );
}

function sequenceValidation(){//sequence Checking Project->Item->Job
    $('#idProject').prop('disabled',true);
    $('#idItem').prop('disabled',true);
    $('#idJRD').prop('disabled',true);
    if($("#idItem").prop('selectedIndex')>0){
        $('#idJRD').prop('disabled',false);
    }
    if($("#idProject").prop('selectedIndex')>0){
        $('#idItem').prop('disabled',false);
    }
    if($("#idGroup").prop('selectedIndex')>0){
        $('#idProject').prop('disabled',false);
    }
}
function sequenceEditValidation(){//sequence Checking Project->Item->Job
    $('#editPlanningEntry #idProject').prop('disabled',true);
    $('#editPlanningEntry #idItem').prop('disabled',true);
    $('#editPlanningEntry #idJRD').prop('disabled',true);
    if($("#editPlanningEntry #idItem").prop('selectedIndex')>0){
        $('#editPlanningEntry #idJRD').prop('disabled',false);
    }
    if($("#editPlanningEntry #idProject").prop('selectedIndex')>0){
        $('#editPlanningEntry #idItem').prop('disabled',false);
    }
    if($("#editPlanningEntry #idGroup").prop('selectedIndex')>0){
        $('#editPlanningEntry #idProject').prop('disabled',false);
    }
}

function getProjects(){//get PROJECT Selection
    var proj=[];
   $('#projOptions,#idProject').empty();
    $('#idProject').html(`<option value='' hidden>Select Project</option>`);
    
    $.ajaxSetup({async: false});
    $.post("ajax/getProjects.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
    },
        function (data) {
          
            proj=$.parseJSON(data);
            console.log(proj)
            proj.map(fillProj);
            sequenceValidation();
        }
    );
    $.ajaxSetup({async: true}); 
}

function getEditProjects(){//get edit PROJECT Selection
    var proj=[];
   $('#editPlanningEntry #projOptions,#editPlanningEntry #idProject').empty();
    $('#editPlanningEntry #idProject').html(`<option value='' hidden>Select Project</option>`);
    
    $.ajaxSetup({async: false});
    $.post("ajax/getProjects.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#editPlanningEntry #idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
    },
        function (data) {
          
            proj=$.parseJSON(data);
            console.log(proj)
            proj.map(fillEditProj);
            sequenceEditValidation();
        }
    );
    $.ajaxSetup({async: true}); 
}

function fillProj(iVal){

    var projDeets=iVal.split("||");
    var addString=`<li proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</li>`;
    var addStringMain=`<option hidden proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</option>`;
    $(`#projOptions`).append(addString);
    $(`#idProject`).append(addStringMain);
}

function fillEditProj(iVal){

    var projDeets=iVal.split("||");
    var addString=`<li proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</li>`;
    var addStringMain=`<option hidden proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</option>`;
    $(`#editPlanningEntry #projOptions`).append(addString);
    $(`#editPlanningEntry #idProject`).append(addStringMain);
}

function getProjSearch(){//get Proj Selection
    var proj=[];
    var searchProj=$(`#searchproj`).val();
    $('#projOptions').empty();
    $.ajaxSetup({async: false});
    $.post("ajax/getProjects.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        searchProj:searchProj,
    },
        function (data) {
            proj=$.parseJSON(data);
            proj.map(fillProj);
            
        }
    );
    $.ajaxSetup({async: true}); 
}

function getEditProjSearch(){//get Proj Selection
    var proj=[];
    var searchProj=$(`#editPlanningEntry #searchproj`).val();
    $('#editPlanningEntry #projOptions').empty();
    $.ajaxSetup({async: false});
    $.post("ajax/getProjects.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#editPlanningEntry #idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        searchProj:searchProj,
    },
        function (data) {
            proj=$.parseJSON(data);
            proj.map(fillEditProj);
            
        }
    );
    $.ajaxSetup({async: true}); 
}


function getItems(iVal){//get Item Selection
    var itms=[];
    $('#itemOptions').empty();
    $('#idItem').html(`<option value='' hidden>Select Item of Works</option>`);
    $('#labell').remove();
    $.ajaxSetup({async: false});
    $.post("ajax/getItems.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
    },
        function (data) {
            itms=$.parseJSON(data);
            itms.map(fillItem);
            sequenceValidation();
            
        }
    );
    $.ajaxSetup({async: true}); 
}

function getEditItems(iVal){//get Item Selection
    var itms=[];
    $('#editPlanningEntry #itemOptions').empty();
    $('#editPlanningEntry #idItem').html(`<option value='' hidden>Select Item of Works</option>`);
    $.ajaxSetup({async: false});
    $.post("ajax/getItems.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#editPlanningEntry #idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
    },
        function (data) {
            itms=$.parseJSON(data);
            itms.map(fillEditItem);
            sequenceEditValidation();
            
        }
    );
    $.ajaxSetup({async: true}); 
}


function fillItem(iVal){
    var itemDeets=iVal.split("||");
    var addString=`<li item-id='${itemDeets[0]}'>${itemDeets[1]}</li>`;
    var addStringMain=`<option hidden item-id='${itemDeets[0]}'>${itemDeets[1]}</option>`;
    $(`#itemOptions`).append(addString);
    $(`#idItem`).append(addStringMain);
}

function fillEditItem(iVal){
    var itemDeets=iVal.split("||");
    var addString=`<li item-id='${itemDeets[0]}'>${itemDeets[1]}</li>`;
    var addStringMain=`<option hidden item-id='${itemDeets[0]}'>${itemDeets[1]}</option>`;
    $(`#editPlanningEntry #itemOptions`).append(addString);
    $(`#editPlanningEntry #idItem`).append(addStringMain);
}
function getItemSearch(iVal){//get Item Selection
    var itms=[];
    var searchIOW=$(`#searchitem`).val();
    $('#itemOptions').empty();
    $.ajaxSetup({async: false});
    $.post("ajax/getItems.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
        searchIOW:searchIOW,
    },
        function (data) {
            itms=$.parseJSON(data);
            itms.map(fillItem);
        }
    );
    $.ajaxSetup({async: true}); 
}
function getEditItemSearch(iVal){//get Item Selection
    var itms=[];
    var searchIOW=$(`#editPlanningEntry #searchitem`).val();
    $('#editPlanningEntry #itemOptions').empty();
    $.ajaxSetup({async: false});
    $.post("ajax/getItems.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#editPlanningEntry #idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
        searchIOW:searchIOW,
    },
        function (data) {
            itms=$.parseJSON(data);
            itms.map(fillEditItem);
        }
    );
    $.ajaxSetup({async: true}); 
}

function getJobs(iVal,xVal){//get Item Selection
    var jobs=[];
    $('#jrdOptions').empty();
    $('#idJRD').html(`<option value='' hidden>Select Job Request Description</option>`);
    $.ajaxSetup({async: false});
    $.post("ajax/getJobs.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
        itemID:xVal
    },
        function (data) {
            jobs=$.parseJSON(data);
            jobs.map(fillJobs);
            sequenceValidation();
            
        }
    );
    $.ajaxSetup({async: true}); 
}
function getEditJobs(iVal,xVal){//get Item Selection
    var jobs=[];
    $('#editPlanningEntry #jrdOptions').empty();
    $('#editPlanningEntry #idJRD').html(`<option value='' hidden>Select Job Request Description</option>`);
    $.ajaxSetup({async: false});
    $.post("ajax/getJobs.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#editPlanningEntry #idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
        itemID:xVal
    },
        function (data) {
            jobs=$.parseJSON(data);
            jobs.map(fillEditJobs);
            sequenceEditValidation();
            
        }
    );
    $.ajaxSetup({async: true}); 
}

function fillJobs(iVal){
    var jrdDeets=iVal.split("||");
    var addString=`<li job-id='${jrdDeets[0]}'>${jrdDeets[1]}</li>`;
    var addStringMain=`<option hidden job-id='${jrdDeets[0]}'>${jrdDeets[1]}</option>`;
    $(`#jrdOptions`).append(addString);
    $(`#idJRD`).append(addStringMain);
}
function fillEditJobs(iVal){
    var jrdDeets=iVal.split("||");
    var addString=`<li job-id='${jrdDeets[0]}'>${jrdDeets[1]}</li>`;
    var addStringMain=`<option hidden job-id='${jrdDeets[0]}'>${jrdDeets[1]}</option>`;
    $(`#editPlanningEntry #jrdOptions`).append(addString);
    $(`#editPlanningEntry #idJRD`).append(addStringMain);
}
function getJRDSearch(iVal,xVal){//get Item Selection
    var jrd=[];
    var searchjrd=$(`#searchjrd`).val();
    $('#jrdOptions').empty();
    $.ajaxSetup({async: false});
    $.post("ajax/getJobs.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
        itemID:xVal,
        searchjrd:searchjrd,
    },
        function (data) {
            jrd=$.parseJSON(data);
            jrd.map(fillJobs);
        }
    );
    $.ajaxSetup({async: true}); 
}
function getEditJRDSearch(iVal,xVal){//get Item Selection
    var jrd=[];
    var searchjrd=$(`#editPlanningEntry #searchjrd`).val();
    $('#editPlanningEntry #jrdOptions').empty();
    $.ajaxSetup({async: false});
    $.post("ajax/getJobs.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#editPlanningEntry #idGroup').val(),
        empNum:empDetails['empNum'],
        empPos:empDetails['empPos'],
        projID:iVal,
        itemID:xVal,
        searchjrd:searchjrd,
    },
        function (data) {
            jrd=$.parseJSON(data);
            jrd.map(fillEditJobs);
        }
    );
    $.ajaxSetup({async: true}); 
}


function addEntries(){//add Entries to Database
    var grp = $('#idGroup').val();
    var proj = $($('#idProject').find('option:selected')).attr('proj-id');
    var item = $($('#idItem').find('option:selected')).attr('item-id');
    var jobreq = $($('#idJRD').find('option:selected')).attr('job-id');
    var emp = $($('#idEmp').find('option:selected')).attr('emp-id');
    var sdate = $('#idStartDate').val();
    var edate = $('#idEndDate').val();
    var mh = $('#idMH').val();

    
    if(!grp){
        $('#p1').text("Please select group");
        $('#idGroup').addClass('border border-danger')
        mgaKulang.push("GROUP");
    }
    if(!proj){
        $('#p2').text("Please select project");
        $('#idProject').addClass('border border-danger')
        mgaKulang.push("PROJECT");
    }
    if(!item){
        $('#p3').text("Please select item of works");
        $('#idItem').addClass('border border-danger')
        mgaKulang.push("ITEM");
    }
    if(!jobreq){
        $('#p4').text("Please select job request description");
        $('#idJRD').addClass('border border-danger')
        mgaKulang.push("JRD");
    }
    if(!emp){
        $('#p5').text("Please select employee");
        $('#idEmp').addClass('border border-danger')
        mgaKulang.push("EMP");
    }
    if(!sdate){
        $('#p6').text("Please input start date");
        $('#idStartDate').addClass('border border-danger')
        mgaKulang.push("SDATE");
    }
    if(!edate){
        $('#p7').text("Please input end date");
        $('#idEndDate').addClass('border border-danger')
        mgaKulang.push("EDATE");
    }
    if(!mh){
        $('#p8').text("Please input man hour");
        $('#idMH').addClass('border border-danger')
        mgaKulang.push("MH");
    }

    var fd= new FormData()
    fd.append("getGroup",grp);
    fd.append("getProject",proj);
    fd.append("getItem",item);
    fd.append("getDescription",jobreq);
    fd.append("getEmp",emp);
    fd.append("getsDate",sdate);
    fd.append("geteDate",edate);
    fd.append("getMH",mh);
    fd.append("empNum",empDetails['empNum']);
    if(mgaKulang.length>0){
        console.log(mgaKulang)
        return;
    }
    else{
            
         $.ajax({
            type: "POST",
            url: "ajax/addPlanningEntries.php",
            data: fd,
            contentType: false,
            cache: false,
             processData: false,
             success: function (data) {
                 // console.log(data)
                 
                getEntries();
                resetEntry();
                
            }
        });
    }
}

function editEntries(){//add Entries to Database
    var grp = $('#editPlanningEntry #idGroup').val();
    var proj = $($('#editPlanningEntry #idProject').find('option:selected')).attr('proj-id');
    var item = $($('#editPlanningEntry #idItem').find('option:selected')).attr('item-id');
    var jobreq = $($('#editPlanningEntry #idJRD').find('option:selected')).attr('job-id');
    var emp = $($('#editPlanningEntry #idEmp').find('option:selected')).attr('emp-id');
    var sdate = $('#editPlanningEntry #idStartDate').val();
    var edate = $('#editPlanningEntry #idEndDate').val();
    var mh = $('#editPlanningEntry #idMH').val();

    
    if(!grp){
        $('#e1').text("Please select group");
        $('#editPlanningEntry #idGroup').addClass('border border-danger')
        mgaKulang.push("GROUP");
    }
    if(!proj){
        $('#e2').text("Please select project");
        $('#editPlanningEntry #idProject').addClass('border border-danger')
        mgaKulang.push("PROJECT");
    }
    if(!item){
        $('#e3').text("Please select item of works");
        $('#editPlanningEntry #idItem').addClass('border border-danger')
        mgaKulang.push("ITEM");
    }
    if(!jobreq){
        $('#e4').text("Please select job request description");
        $('#editPlanningEntry #idJRD').addClass('border border-danger')
        mgaKulang.push("JRD");
    }
    if(!emp){
        $('#e5').text("Please select employee");
        $('#editPlanningEntry #idEmp').addClass('border border-danger')
        mgaKulang.push("EMP");
    }
    if(!sdate){
        $('#e6').text("Please input start date");
        $('#editPlanningEntry #idStartDate').addClass('border border-danger')
        mgaKulang.push("SDATE");
    }
    if(!edate){
        $('#e7').text("Please input end date");
        $('#editPlanningEntry #idEndDate').addClass('border border-danger')
        mgaKulang.push("EDATE");
    }
    if(!mh){
        $('#e8').text("Please input man hour");
        $('#editPlanningEntry #idMH').addClass('border border-danger')
        mgaKulang.push("MH");
    }

    var fd= new FormData()
    fd.append("getGroup",grp);
    fd.append("getProject",proj);
    fd.append("getItem",item);
    fd.append("getDescription",jobreq);
    fd.append("getEmp",emp);
    fd.append("getsDate",sdate);
    fd.append("geteDate",edate);
    fd.append("getMH",mh);
    fd.append("empNum",empDetails['empNum']);
    if(mgaKulang.length>0){
        console.log(mgaKulang)
        return;
    }
    else{
            
         $.ajax({
            type: "POST",
            url: "ajax/EditEntries.php",
            data: fd,
            contentType: false,
            cache: false,
             processData: false,
             success: function (data) {
                 
                getEntries();
                resetEditEntry();
                
            }
        });
    }
}


function deleteEntry(iVal){//delete Entries from Database
    $.post("ajax/deleteEntry.php",
    {
        trID:iVal
    },
        function (data) {
            getEntries();
        }
    );
}
function resetEntry(){//reset Inputs
    $("#idGroup,#idProject,#idItem,#idJRD,#idEmp,#idStartDate,#idEndDate,#idMH").val("").change();
    $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8").text("");
    $("#idGroup,#idProject,#idItem,#idJRD,#idEmp,#idStartDate,#idEndDate,#idMH").removeClass('border border-danger');
    sequenceValidation();
}
function resetEditEntry(){//reset Inputs
    $("#editPlanningEntry #idGroup,#editPlanningEntry #idProject,#editPlanningEntry #idItem,#editPlanningEntry #idJRD,#editPlanningEntry #idEmp,#editPlanningEntry #idStartDate,#editPlanningEntry #idEndDate,#editPlanningEntry #idMH").val("").change();
    $("#e1,#e2,#e3,#e4,#e5,#e6,#e7,#e8").text("");
    $("#editPlanningEntry #idGroup,#editPlanningEntry #idProject,#editPlanningEntry #idItem,#editPlanningEntry #idJRD,#editPlanningEntry #idEmp,#editPlanningEntry #idStartDate,#editPlanningEntry #idEndDate,#editPlanningEntry #idMH").removeClass('border border-danger');
    sequenceEditValidation();
}

function isWorkDay(iVal){//check if work day
    var isWorkDay=false;
    var selDate=$("#idDRDate").val();
    var selLoc=iVal;
    if(selLoc==null){
        selLoc="KDT";
    }
    $.ajaxSetup({async: false});
    $.post("ajax/checkWorkDay.php",
    {
        selDate:selDate,
        selLoc:selLoc
    },
        function (data) {
            isWorkDay=$.parseJSON(data);
        }
    );
    $.ajaxSetup({async: true});
    return isWorkDay;
}


function ifSmallScreen(){//responsive
    if ($(window).width() < 550) {
      if ($(".sidebar").hasClass(".close")) {
        $(".menu-two").addClass('d-none');
      } else {
        $(".menu-two").removeClass('d-none');
      }
    } else {
      $(".menu-two").addClass('d-none');
    }
}

function checkTestAccess(){//check if has access to testing
    $.post("ajax/checkTestAccess.php",
    {
      empNum:empDetails['empNum']
    },
      function (data) {
        var access=data.trim();
        if(access=='0'){
            alert('Access denied');
          window.location.href = rootFolder + "/welcome";
        }
      }
    );
}




//#endregion


//#endregion