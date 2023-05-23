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
var editID = ""
const defaults =getDefaults();
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
$(document).on('change','#editGroup',function(){//select Group Event

    getProjects();
    $('.iow').removeClass('active');
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
$(document).on('change','#idItem',function(){//select Item Event
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    var itemID=$($(this).find('option:selected')).attr('item-id');
    
    getJobs(projID,itemID);
    // getJRDSearch(projID,itemID);
    $('#p3').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change', '#idJRD', function(){
    $('#p4').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change', '#idEmp', function(){
    $('#p5').text("");
    $(this).removeClass('border-danger');
})
$(document).on('change','#idStartDate',function(){//select Date Event
    $('#p6').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change','#idEndDate',function(){//select Date Event
    $('#p7').text("");
    $(this).removeClass('border-danger');
});

$(document).on('change', '#idMH', function(){
    $('#p8').text("");
    $(this).removeClass('border-danger');
});

$(document).on('click','#idAdd',function(){
    addEntries();
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

$(document).on('keyup','#searchproj',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getProjSearch();
});
$(document).on('search','#searchproj',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getProjSearch();
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

$(document).on('keyup','#searchitem',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getItemSearch(projID);
});
$(document).on('search','#searchitem',function(){
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    getItemSearch(projID);
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
$(document).on('keyup','#searchjrd',function(){
    var itemID=$($('#idItem').find('option:selected')).attr('item-id');
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    
    getJRDSearch(projID,itemID);
});
$(document).on('search','#searchjrd',function(){
    var itemID=$($('#idItem').find('option:selected')).attr('item-id');
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    
    getJRDSearch(projID,itemID);
});
$(document).on('click', '.badge', function(){
    $('.bdge').html(`<button class="badge text-center text-bg-success p-2 w-100 border-0 done">Done - 12/22/2023</button>`)
    
})
$(document).on('click', '#editPlanning', function(){
    var getTR = $(this).closest('tr');
})
$(document).on('click', '.cancel', function(){
    resetEntry();
})

//#endregion

//#region FUNCTIONS

function getDefaults(){//get Default Projects(GOW,Kaizen,etc.)
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
            $('#editGroup').html(data);
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
        getMHCount();
    }
    );
}
function getMHCount(){//get MH Counter Values
    var reg=0;
    var ot=0;
    var lv=0;
    var loc="KDT";
    var getTRs = Object.values($('#drEntries').children());
    getTRs.length -= 2;
    getTRs.forEach(element => {
        // var mhType=(element.id)[0];
        // var hr=parseFloat($($(element).children()[5]).text());
        // switch(mhType){
        //     case "0":
        //         reg+=hr;
        //         break;
        //     case "1":
        //         ot+=hr;
        //         break;
        //     case "2":
        //         lv+=hr;
        //         break;
        // }
        loc=$($(element).children()[0]).text();
        });
    
    $('#regCount').text(parseFloat(regCount/60).toFixed(2));
    $('#otCount').text(parseFloat(otCount/60).toFixed(2));
    $('#lvCount').text(parseFloat(lvCount/60).toFixed(2));
    reg=parseFloat(regCount/60);
    ot=parseFloat(otCount/60);
    lv=parseFloat(lvCount/60);
    $('#cardReg').removeClass('new');
    $('#cardOt').removeClass('new');
    $('#cardLv').removeClass('new');
    if(loc=="WFH"){
        if(ot>0){
            $('#cardOt').addClass('new');
        }
        if(lv>0){
            $('#cardLv').addClass('new');
        }
    }
    else{
        if(isWorkDay(loc)){
            if(ot>0){
                if(reg<8 || lv>0){
                    $('#cardOt').addClass('new');
                }
            }
            if((lv==4 && reg<4)){
                    $('#cardLv').addClass('new');
            }
            if(reg>8 || (reg>0&&(reg+lv)<8)){
                $('#cardReg').addClass('new');
            }
        }
        else{
            if(reg>0){
                $('#cardReg').addClass('new');
            }
            if(lv>0){
                $('#cardLv').addClass('new');
            }
        }
    }
 
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
function fillProj(iVal){
    console.log("oo")
    var projDeets=iVal.split("||");
    
    var addString=`<li proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</li>`;
    var addStringMain=`<option hidden proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</option>`;
    $(`#projOptions`).append(addString);
    $(`#idProject`).append(addStringMain);
}
function getProjSearch(){//get Item Selection
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
            if(iVal==mngID){
                $($('#idItem').children()[1]).prop("selected",true).change();
            }
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
            if(iVal==mngID || iVal==kiaID){
                $($('#idJRD').children()[1]).prop("selected",true).change();
            }
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


function addEntries(iVal){//add Entries to Database
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

    fd.append("addType",iVal);
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
                    if($('#idAdd').text()!="Add"){
                        $('#idAdd').text("Add");
                        $('#idReset').text("Reset");
                    }

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

function editEntry(iVal){//edit selected entry

    var trID = $($(iVal).parents()[1]).attr('id')
    editID = trID.split("_")[1];
    
    $.post("ajax/getDataEdit.php", {
        primaryID : editID
    },
        function (data) {
            var dataEdit = $.parseJSON(data);
            // var dataEdit = ["KDT","SYS",6,3,"Training",8,0,1,"test",null,null];
            $('#idGroup').val(dataEdit[1]);

            getProjects();
            $($('#idProject').find(`option[proj-id=${dataEdit[2]}]`)).prop('selected',true).change();
            getItems(dataEdit[2]);
            $($('#idItem').find(`option[item-id=${dataEdit[3]}]`)).prop('selected',true).change();
            getJobs(dataEdit[2],dataEdit[3]);
            $($('#idJRD').find(`option[job-id=${dataEdit[4]}]`)).prop('selected',true).change();


            if(dataEdit[9] != null){
                // $(`button[2d3d-id=${dataEdit[9]}]`).click();
                $(`#${dataEdit[9]}`).click()
            }

            if(dataEdit[11] != null){
                // $('#idChecking').val(dataEdit[11]);
                $("#forChecking").show();
                $($('#idChecking').find(`option[dataid=${dataEdit[11]}]`)).prop('selected',true).change();
                // console.log(`$($('#idChecking').find("option[dataid=${dataEdit[11]}]")).prop('selected',true);`);
            }
        }
    );
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

function saveFunction(){//update database entry
    addEntries(editID);
    
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