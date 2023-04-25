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
var regCount=0;
var otCount=0;
var lvCount=0;
const leaveID=getLeaveID();
const otherID=getOtherID();
const mngID=getMngID();
const kiaID=getKiaID();
const noMoreInputItems=getNoMoreInputItems();
const oneBUTrainerID=getOneBUTrainerID();


//#endregion

//#region BINDS
$(document).ready(function(){//page Initialize Event
    $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check 9 is logged in
        empDetails=$.parseJSON(data);
        if(empDetails.length<1){//if result is 0, redirect to log in page
          window.location.href=rootFolder+'/welcome'; 
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
        
        // $('#msv').hide();
        // $($('#msv').nextAll()).hide();
        getMyGroups();
        getDispatchLoc();
        getTOW();
        getEntries();
        sequenceValidation();
        initCalendar();
       
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
        //#region

      

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
//IIIFFFFFUUUUUU AAAAAAAAAAAAAAAAAAGGHHCCKK
// $('.card').addClass('new');//PANG PALIT KULAY

$(document).on('change','#idTOW',function(){//select TOW Event
    if(this.value == "Chk - Checker"){
        $('.checker').removeClass('d-none');
    }else{
        $('.checker').addClass('d-none');
    }
    $("#idChecking").prop('selectedIndex',0);
    var towVal=$($(this).find('option:selected')).attr('tow-id');
    if(towVal==10 || towVal==11){
        $('#getHour').val('4');
    }
    if(towVal==12){
        $('#getHour').val('8');
    }
    getTOWDesc(towVal);

    $('#p11').text("");
    $(this).removeClass('border-danger');
});
$(document).on('click','.pindot',function(){
    $('.ms').toggleClass('open');
    if($('.ms').hasClass('open')){
        $('.ms-lbl p').html(`<i class='bx bx-x' style='color:#fff; font-size:40px;'></i>`);
    }else{
        $('.ms-lbl p').html(`Calendar <i class='bx bx-right-arrow-alt d-flex align-items-center text-light' style="font-size: 20px;"></i>`);
    }
   
    // $('.today-btn').click();
    
})
$(document).on('change','#idGroup',function(){//select Group Event
    // var getSelValue = $(this).children(":selected").prop("data-id");
    // $('#idGroup').children(":selected").prop("data-id");
    getProjects();
  
    // getCheckers();
    $('#p1').text("");
    $(this).removeClass('border-danger');
    $('.iow').removeClass('active');

    // console.log(getSelValue);
});
$(document).on('change','#idDRDate',function(){//select Date Event
    getEntries();
    MHValidation();
    sequenceValidation();
});
$(document).on('click','#idReset', function(){//click Reset Event
    if($(this).text().trim() == "Clear"){
        resetEntry();
    }else{
        cancelEditFunction();
    }
});
$(document).on('click','#idAdd',function () {//click Add Event
    switch($(this).text().trim()){
        case "Add":
            addEntries(0);
            break;
        case "Save Changes":
            saveFunction();
            break;
    }
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
    isDrawing();
    getTOW(projID);
    disableTimeInput(projID);
    MHValidation();
    $('.iow').removeClass('active');
    $('#p4').text("");
    $(this).removeClass('border-danger');

    if(projID == leaveID){
        $('#itemlbl').html("Leave Type");
        $('#lbltow').html("Day Type");
    }
    else{
        $('#itemlbl').html("Item of Works");
        $('#lbltow').html("Type of Work");
    }

    getCheckers();
    $('.trgrp').remove();
});
$(document).on('change','#idItem',function(){//select Item Event
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    var itemID=$($(this).find('option:selected')).attr('item-id');
    
    $('.trgrp').remove();
    getLabel(itemID);
    disableInputs(projID,itemID);
    if(noMoreInputItems.includes(itemID)){
        $('#drInstruction').modal('show');
    }
    trainingGroup(itemID);
    getJobs(projID,itemID);
    // getJRDSearch(projID,itemID);
    $('#p5').text("");
    $(this).removeClass('border-danger');
})
$(document).on('click','#refBtn',function(){//click Refresh Event
    getEntries();
})
$(document).on('click','.delBut',function(){//click Delete Event
    var getID = $($(this).parents()[1]).attr('id');
    var trID=getID.substr(2);
    if(!confirm("Delete this entry?")){
        return;
    }
    deleteEntry(trID);
})
$(document).on('click','#idCopy',function(){//click Copy Event
    if(!confirm("Confirm copy entries")){
        return;
    }
    copyEntries();
});
$(document).on('click','button[edit-entry]',function(){//click edit event
    editEntry(this);
});
$(document).on('change','#idLocation',function(){//select Group Event  
    MHValidation();
    
    $('#p3').text("");
    $(this).removeClass('border-danger');

    // if($(this).val()=="WFH"){
    //     $($('#idProject').find(`option[proj-id=${leaveID}]`)).prop('hidden',true);
    // }
    // else{
    //      $($('#idProject').find(`option[proj-id=${leaveID}]`)).prop('hidden',false);
    //  }
    });
     
$(document).on('change', '#idMH', function(){
    $('#p10').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change', '#idJRD', function(){
    $('#p6').text("");
    $(this).removeClass('border-danger');
})
$(document).on('click','.prev', function(){
    prevMonth();
    $('#gotomonth').val("");
})
$(document).on('click','.next', function(){
    nextMonth();
    $('#gotomonth').val("");
})
$(document).on('change','#gotomonth',function(){
    gotoMonth();
})
$(document).on('click', '.today-btn', function(){
    gotoday();
    $('#gotomonth').val("");
})
$(document).on('click','.day', function() {
    
    $('.day').each(function(){
        $(this).removeClass("active");
    })
    $(this).addClass("active");
    // console.log("click")
    var hatdog = $(this).text();
    // console.log(hatdog)
    getActiveDay(hatdog);
    
})
$(document).on('change','#trGroup',function(){
    $('#p12').text("");
    $('#trGroup').removeClass('border border-danger');
})
$(document).on('click','#back2Project',function(){
    $('#drInstruction').modal('hide');
    $('#idItem').val(null).change();
})
$(document).on('click','#drInstruction .btn-close',function(){
    $('#back2Project').click();
})
$(document).on('click','#selectBut',function(){
    $('#idAdd').text("Add");
    $('#idReset').text("Clear");
    selectEntry(this);
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
        }
    );
    $.ajaxSetup({async: true});
}
function getDispatchLoc(){//get Dispatch Location Selection
    $.ajax({
        url: "ajax/getDispatchLoc.php",
        success: function (data) {
            $('#idLocation').html(data)
        }
    });
}
function getTOW(iVal){//get Types of Work Selection
    $.ajaxSetup({async: false});
    $("#idTOW").prop('selectedIndex',0);
    $("#idChecking").prop('selectedIndex',0);
    $("#forChecking").hide();
    $.post("ajax/getTOW.php",
    {
        projID:iVal
    },
        function (data) {
            $('#idTOW').html(data);
            $('#idTOW').val("").change();
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
        del=`(Deleted)`;
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
    <td>${project}${del}</td>
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
        // if(reg>8){
        //     $('#cardReg').addClass('new');
        //     $('#regCount').text(reg);
        // }
        // else{
        //     $('#cardReg').removeClass('new');
        //     $('#regCount').text(reg);
        // }
        // if(ot>8){
        //     $('#cardOt').addClass('new');
        //     $('#otCount').text(ot);
        // }
        // else{
        //     $('#cardOt').removeClass('new');
        //     $('#otCount').text(ot);
        // }
        // if(lv>8){
        //     $('#cardLv').addClass('new');
        //     $('#lvCount').text(lv);
        // }
        // else{
        //     $('#cardLv').removeClass('new');
        //     $('#lvCount').text(lv);
        // }
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
// function getProjects(){//get Project Selection

//     $.ajaxSetup({async: false});
//     $.post("ajax/getProjects.php",
//     {
//         // empGroup:empDetails['empGroup'],
//         empGroup:$('#idGroup').val(),
//         empNum:empDetails['empNum'],
//         empPos:empDetails['empPos']
//     },
//         function (data) {
//             $('#idProject').html(data);
//             $('#idProject').val("").change();
//         }
//     );
//     $.ajaxSetup({async: true});
    
// }

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
// function getJobs(iVal,xVal){//get Job Selection
//     $.ajaxSetup({async: false});
//     $('#idJRD').val('');
//     $.post("ajax/getJobs.php",
//     {
//         // empGroup:empDetails['empGroup'],
//         empGroup:$('#idGroup').val(),
//         empNum:empDetails['empNum'],
//         projID:iVal,
//         itemID:xVal
//     },
//         function (data) {
//             $('#idJRD').html(data);
//             sequenceValidation();
//             if(iVal==mngID || iVal==kiaID){
//                 $($('#idJRD').children()[1]).prop("selected",true);
//             }
//         }
//     );
//     $.ajaxSetup({async: true});
// }

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
    var tutri=$('input[name="radio"]:checked').val();
    var grp = $('#idGroup').val();
    var date = $('#idDRDate').val();
    var loc = $($('#idLocation').find('option:selected')).attr('loc-id');
    var proj = $($('#idProject').find('option:selected')).attr('proj-id');
    var item = $($('#idItem').find('option:selected')).attr('item-id');
    var trgrp = $($('#trGroup').find('option:selected')).val()||'';
    var jobreq = $($('#idJRD').find('option:selected')).attr('job-id')||'';
    var tow = $($('#idTOW').find('option:selected')).attr('tow-id');
    var hour = $('#getHour').val()*60 || "0";
    var mins = $('#getMin').val() || "0";
    var getDuration = `${parseFloat(hour) + parseFloat(mins)}`;
    var revision = "";
    var mhtype = $($('#idMH').find('option:selected')).attr('mhid');
    var remarks = $('#idRemarks').val();
    var checker = $($('#idChecking').find('option:selected')).attr('dataid') || "";
    var mgaKulang = [];
    
    if($("#id2DDiv").hasClass("d-none")){
        tutri="";
    }
    if(!grp){
        $('#p1').text("Please select group");
        $('#idGroup').addClass('border border-danger')
        mgaKulang.push("GROUP");
    }
    if(!date){
        $('#p2').text("Please select date");
        $('#idDRDate').addClass('border border-danger')
        mgaKulang.push("DATE");
    }
    if(!loc){
        $('#p3').text("Please select location");
        $('#idLocation').addClass('border border-danger')
        mgaKulang.push("LOCATION");
    }
    if(!proj){
        $('#p4').text("Please select project");
        $('#idProject').addClass('border border-danger')
        mgaKulang.push("PROJECT");
    }
    if(!item){
        $('#p5').text("Please select item of works");
        $('#idItem').addClass('border border-danger')
        mgaKulang.push("ITEM");
    }
    if(!jobreq && (proj!=leaveID && proj!=otherID)){
        $('#p6').text("Please select job request description");
        $('#idJRD').addClass('border border-danger')
        mgaKulang.push("JRD");
    }
    if($('#idRev').is(":checked") && !$("#idRevDiv").hasClass("d-none")){
        revision = 1;
    }
    else{
        revision = 0;
    }
    if(!tow && (!defaults.includes(proj) || proj==leaveID)){
        if(proj==leaveID){
            $('#p11').text("Please select day type");
        }
        else{
            $('#p11').text("Please select type of work");
        }
        $('#idTOW').addClass('border border-danger')
        mgaKulang.push("TOW");
    }
    if(tow == 3){//If checker    
        if(!checker){
            $('#p8').text("Please select checker");
            $('#idChecking').addClass('border border-danger')
            mgaKulang.push("CHECKER");
        }
    }
    if(hour>1200||hour<0){//hour*60    
        $('#p9').text("Please input valid time");
        $('#getHour').addClass('border border-danger')
        mgaKulang.push("ORAS");
    }
    if(mins>59||mins<0){
        $('#p9').text("Please input valid time");
        $('#getMin').addClass('border border-danger')
        mgaKulang.push("ORAS");
    }
    if(hour==''&&mins==''){
        $('#p9').text("Please input valid time");
        $('#getHour').addClass('border border-danger')
        $('#getMin').addClass('border border-danger')
        mgaKulang.push("ORAS");
    }
    if(!mhtype && proj!=leaveID){
        $('#p10').text("Please select manhour type");
        $('#idMH').addClass('border border-danger')
        mgaKulang.push("MHTYPE");
    };
    if(proj==leaveID){//IF LEAVE    
        mhtype=2;
    }
    if(item==oneBUTrainerID){
        if(!trgrp){
        $('#p12').text("Please select group to train");
        $('#trGroup').addClass('border border-danger');
        mgaKulang.push("TRGROUP");
        }
    }
    var fd= new FormData()
    fd.append("getTwoThree",tutri);
    fd.append("getGroup",grp);
    fd.append("getDate",date);
    fd.append("getLocation",loc);
    fd.append("getProject",proj);
    fd.append("getItem",item);
    fd.append("getTrGrp",trgrp);
    fd.append("getDescription",jobreq);
    fd.append("getType",tow);
    fd.append("getRev",revision);
    fd.append("getDuration",getDuration);
    fd.append("getMHType",mhtype);
    fd.append("getRemarks",remarks);
    fd.append("getChecking",checker);
    fd.append("addType",iVal);
    fd.append("empNum",empDetails['empNum']);
    if(mgaKulang.length>0){
        console.log(mgaKulang)
        return;
    }
    else{
         
        //for (var pair of fd.entries()) {
        //   console.log(pair[0]+ ', ' + pair[1]);    
        //}
        // return;
            
             $.ajax({
                type: "POST",
                url: "ajax/addEntries.php",
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
                    isDrawing();
                    initCalendar();
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
            initCalendar();
        }
    );
}
function resetEntry(){//reset Inputs
    $("#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#towDesc,#trGroup").val("").change();
    $("#one").click();
    $("#idRev").prop('checked',false);
    $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8,#p9,#p10,#p11,#p12").text("");
    $("#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup").removeClass('border border-danger');
    $('.checker').addClass('d-none');
    sequenceValidation();
}
function disableTimeInput(iVal){//disable Time Input
    $('#getHour').prop('disabled',false);
    $('#getMin').prop('disabled',false);
    if(iVal==leaveID){
        $('#getHour').prop('disabled',true);
        $('#getMin').prop('disabled',true);
    }
}
function isDrawing(){//enable/disable engineering selections
    isEngineering();
    hasJRD();
    hasTOW();
}
function isEngineering(){
    var isDrawing = true;
    var projID=$($("#idProject").find('option:selected')).attr('proj-id');
    var selGroup=$("#idGroup").val();
    isDrawing=(!defaults.includes(projID) && (selGroup != "SYS" && selGroup != "IT") && projID);
    // return isDrawing;
    if(isDrawing){
        $("#id2DDiv").removeClass("d-none");
        $("#idRevDiv").removeClass("d-none");
    }
    else{
        $("#id2DDiv").addClass("d-none");
        $("#idRevDiv").addClass("d-none");
    }
}
function hasJRD(){
    var isDrawing = true;
    var projID=$($("#idProject").find('option:selected')).attr('proj-id');
    var selGroup=$("#idGroup").val();
    // isDrawing=((!defaults.includes(projID) || projID=='2') && projID);
    isDrawing=(projID!=leaveID&&projID!=otherID);
    // return isDrawing;
    if(isDrawing){
        $("#idJRDDiv").removeClass("d-none");
    }
    else{
        $("#idJRDDiv").addClass("d-none");
    }
}
function hasTOW(){
    var isDrawing = true;
    var projID=$($("#idProject").find('option:selected')).attr('proj-id');
    var selGroup=$("#idGroup").val();
    isDrawing=(!defaults.includes(projID) && projID);
    // return isDrawing;
    if(isDrawing){
        // $("#idJRDDiv").removeClass("d-none");
        $("#idTowDiv").removeClass("d-none");
        $("#idTowDescDiv").removeClass("d-none");
    }
    else{
        // $("#idJRDDiv").addClass("d-none");
        $("#idTowDiv").addClass("d-none");
        $("#idTowDescDiv").addClass("d-none");
    }
    if(projID==leaveID){
        $("#idTowDiv").removeClass("d-none");
        $("#idTowDescDiv").removeClass("d-none");
    }
}
function MHValidation(){//enable/disable manhour type selection  
    var projID=$($("#idProject").find('option:selected')).attr('proj-id');
    var selLoc="KDT";
    
    if($('#idLocation').val()){
        selLoc=$('#idLocation').val();
    }
    if(projID!=leaveID){//if Project selected is not LEAVE    
        $("#idMH").prop('disabled',false);
        // $("#idMH").val('');
        if(!isWorkDay(selLoc)){
            $("#idMH").val('Overtime');
            $("#idMH").prop('disabled',true);
        }
        if(selLoc=="WFH"){
            $("#idMH").val('Regular');
            $("#idMH").prop('disabled',true);
        }
    }
    else{
        $("#idMH").prop('disabled',true);
         $("#idMH").val('');
         if(!isWorkDay(selLoc)){
            alert("Leave disabled on holidays/weekends");
            $("#idProject").val("").change();
        }
    }
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
function getTOWDesc(iVal){//get TOW Selection
    $.post("ajax/getTOWDesc.php",
     {
        towID:iVal
     },
        function (data) {
            $("#towDesc").html(data.trim());
        }
    );
}
function copyEntries(){//copy entries from selected date
    var getDate = $('#idDRDate').val();
    var copyDate = $('#idCopyDate').val();
    $.post("ajax/copyEntries.php",
     {
        empNum:empDetails['empNum'],
        getDate:getDate,
        copyDate:copyDate
     },
        function (data) {
            // console.log(data)
            getEntries();
            resetEntry();
            initCalendar();
        }
    );
}
function editEntry(iVal){//edit selected entry
    $('#idAdd').text("Save Changes");
    $('#idReset').text("Cancel");
    $('#idLocation').val("");
    // $('#idMH').val("");

    var trID = $($(iVal).parents()[1]).attr('id')
    editID = trID.split("_")[1];
    
    $.post("ajax/getDataEdit.php", {
        primaryID : editID
    },
        function (data) {
            var dataEdit = $.parseJSON(data);
            // var dataEdit = ["KDT","SYS",6,3,"Training",8,0,1,"test",null,null];
            $('#idGroup').val(dataEdit[1]);

            getCheckers();
            getProjects();
            $($('#idProject').find(`option[proj-id=${dataEdit[2]}]`)).prop('selected',true).change();
            getItems(dataEdit[2]);
            $($('#idItem').find(`option[item-id=${dataEdit[3]}]`)).prop('selected',true).change();
            getJobs(dataEdit[2],dataEdit[3]);
            $($('#idJRD').find(`option[job-id=${dataEdit[4]}]`)).prop('selected',true).change();

            // $('#getHour').val(dataEdit[5].toString().split('.')[0]);
            // if(dataEdit[5].toString().split('.')[1] == undefined){
            //     $('#getMin').val(0);
            // }else{
            //     $('#getMin').val(parseFloat(`.${dataEdit[5].toString().split('.')[1]}`)*60);
            // }
            $(`#getHour`).val(`${Math.floor(dataEdit[5]/60)}`);
            $(`#getMin`).val(`${dataEdit[5] % 60}`);
            isDrawing();
            getTOW(`${dataEdit[2]}`);
            disableTimeInput(`${dataEdit[2]}`);
            MHValidation();
            $($('#idTOW').find(`option[tow-id=${dataEdit[7]}]`)).prop('selected',true).change();
            getTOWDesc(dataEdit[7]);
            $($('#idMH').find(`option[mhid=${dataEdit[6]}]`)).prop('selected',true).change();
            $('#idRemarks').val(dataEdit[8]);
            if(dataEdit[9] != null){
                // $(`button[2d3d-id=${dataEdit[9]}]`).click();
                $(`#${dataEdit[9]}`).click()
            }
            if(dataEdit[10] == 1){
                $('#idRev').click();
            }
            disableTimeInput(dataEdit[2]);
            if(dataEdit[11] != null){
                // $('#idChecking').val(dataEdit[11]);
                $("#forChecking").show();
                $($('#idChecking').find(`option[dataid=${dataEdit[11]}]`)).prop('selected',true).change();
                // console.log(`$($('#idChecking').find("option[dataid=${dataEdit[11]}]")).prop('selected',true);`);
            }
            $('#trGroup').val(dataEdit[12]);
        }
    );
    isDrawing();
}

function selectEntry(iVal){//edit selected entry

    // var trID = $($(iVal).parents()[1]).prop('id')
    var trID = $($(iVal).parents()[1]).attr('id')
    selectID = trID.split("_")[1];
    
    $.post("ajax/getDataEdit.php", {
        primaryID : selectID
    },
        function (data) {
            // console.log(data);
            var dataSelect = $.parseJSON(data);
            // console.log(dataSelect);
            // var dataEdit = ["KDT","SYS",6,3,"Training",8,0,1,"test",null,null];
            $($('#idLocation').find(`option[loc-id=${dataSelect[0]}]`)).prop('selected',true).change();
            $('#idGroup').val(dataSelect[1]);

            getCheckers();
            getProjects();
            $($('#idProject').find(`option[proj-id=${dataSelect[2]}]`)).prop('selected',true).change();
            getItems(dataSelect[2]);
            $($('#idItem').find(`option[item-id=${dataSelect[3]}]`)).prop('selected',true).change();
            getJobs(dataSelect[2],dataSelect[3]);
            $($('#idJRD').find(`option[job-id=${dataSelect[4]}]`)).prop('selected',true).change();

            // $('#getHour').val(dataEdit[5].toString().split('.')[0]);
            // if(dataEdit[5].toString().split('.')[1] == undefined){
            //     $('#getMin').val(0);
            // }else{
            //     $('#getMin').val(parseFloat(`.${dataEdit[5].toString().split('.')[1]}`)*60);
            // }
            $(`#getHour`).val(`${Math.floor(dataSelect[5]/60)}`);
            $(`#getMin`).val(`${dataSelect[5] % 60}`);
            isDrawing();
            getTOW(`${dataSelect[2]}`);
            disableTimeInput(`${dataSelect[2]}`);
            MHValidation();
            $($('#idTOW').find(`option[tow-id=${dataSelect[7]}]`)).prop('selected',true).change();
            getTOWDesc(dataSelect[7]);
            $($('#idMH').find(`option[mhid=${dataSelect[6]}]`)).prop('selected',true).change();
            $('#idRemarks').val(dataSelect[8]);
            if(dataSelect[9] != null){
                // $(`button[2d3d-id=${dataEdit[9]}]`).click();
                $(`#${dataSelect[9]}`).click()
            }
            if(dataSelect[10] == 1){
                $('#idRev').click();
            }
            disableTimeInput(dataSelect[2]);
            if(dataSelect[11] != null){
                // $('#idChecking').val(dataEdit[11]);
                $("#forChecking").show();
                $($('#idChecking').find(`option[dataid=${dataSelect[11]}]`)).prop('selected',true).change();
                // console.log(`$($('#idChecking').find("option[dataid=${dataEdit[11]}]")).prop('selected',true);`);
            }
            $('#trGroup').val(dataSelect[12]);
        }
    );
    isDrawing();
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

function getCheckers(){//get Checkers Selection
    $.ajaxSetup({async: false});
    var empGrp=$('#idGroup').val();
    var projID=$($('#idProject').find('option:selected')).attr('proj-id')||'';
    $.post("ajax/getCheckers.php",
     {
        empGrp:empGrp,
        empNum:empDetails['empNum'],
        projID:projID
     },
        function (data) {
            $('#idChecking').html(data);
        }
    );
    $.ajaxSetup({async: true});
}
function saveFunction(){//update database entry
    addEntries(editID);
    
}
function cancelEditFunction(){//cancel editables
    $('#idAdd').text("Add");
    $('#idReset').text("Clear");
    resetEntry();
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
function getLeaveID(){
    var lvID=``;
    $.ajax({
      url: "ajax/getLeaveID.php",
      success: function (data) {
        lvID=data.trim();
      },
      async: false
    });
    return lvID;
}

function getOtherID(){
    var oID=``;
    $.ajax({
      url: "ajax/getOtherID.php",
      success: function (data) {
        oID=data.trim();
      },
      async: false
    });
    return oID;
}
function getMngID(){
    var mngID=``;
    $.ajax({
      url: "ajax/getMngID.php",
      success: function (data) {
        mngID=data.trim();
      },
      async: false
    });
    return mngID;
}
function getKiaID(){
    var kiaID=``;
    $.ajax({
      url: "ajax/getKiaID.php",
      success: function (data) {
        kiaID=data.trim();
      },
      async: false
    });
    return kiaID;
}
function getNoMoreInputItems(){
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
function disableInputs(iVal,xVal){
    $('#getHour').prop('disabled',true);
    $('#getMin').prop('disabled',true);
    $('#idMH').prop('disabled',true);
    $('#idRemarks').prop('disabled',true);
    $('#idAdd').prop('disabled',true);
    
     if(iVal!=leaveID){
            if(!noMoreInputItems.includes(xVal)){
            $('#idRemarks').prop('disabled',false);
            $('#idAdd').prop('disabled',false);
            $('#getHour').prop('disabled',false);
            $('#getMin').prop('disabled',false);
            $('#idMH').prop('disabled',false);
            }
     }
     else{
        $('#idRemarks').prop('disabled',false);
        $('#idAdd').prop('disabled',false);
     }
}
function trainingGroup(iVal) {
    if(iVal==oneBUTrainerID){
        $('.iow').after(`
    <div class="col-12 my-2 trgrp">
                  <label for="trGroup" class="form-label">Group of Trainees</label>
                  <div class="input-group">
                    <select class="form-select" id="trGroup" required>
                      <option value="" selected hidden>Select Group to Train</option>
                    </select>
                  </div>
                  <span class="col-12 mt-1 alert-danger text-danger" id="p12" role="alert"></span>
                </div>
    `);
    getTRGroups();
    }
    else{
        $('.trgrp').remove();
    }
    
}
function getTRGroups(){
$.ajax({
    url: "ajax/getGroups.php",
    success: function (response) {
        $('#trGroup').html(response)
    },async:false
});
}
function getLabel(itemOfWorkID){
    $.post("ajax/getLabel.php",
    {
        itemID:itemOfWorkID
    },
        function (data) {
            if(data.trim()){
                $('#labell').remove();
                //display label
                // console.log(data.trim())
                $('#p5').after(`
                <span class="col-12 alert-primary text-primary" id="labell" role="alert">${data}</span>
                `)
            }
        }
    );
   
}
function getOneBUTrainerID(){
    var obutrainID=``;
    $.ajax({
      url: "ajax/getOneBUTrainerID.php",
      success: function (data) {
        obutrainID=data.trim();
      },
      async: false
    });
    return obutrainID;
}
//#endregion

//#region MonthlyStandardViewer
const calendar = document.querySelector('.calendar');
 

let today = new Date();
let activeDay;
let month= today.getMonth();
let year = today.getFullYear();

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",

];

//function to add days

function initCalendar() {
    // console.log("hehe");
    const firstDay = new Date(year, month , 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() -1;
    var mhColor=``;
    // date.innerHTML = months[month] + " " + year;
    //month upper center
    $('.date').html(months[month] + " " + year);
        //#region prev month days
        let days = "";
        for ( let x=day; x>0; x--){
            var newDate = new Date(year, month-1, prevDays-x + 1);
            // mhColor=checkValidMH(formatDate((prevDays-x + 1)+" "+months[month-1]+ " "+year))
            if(newDate.getDay()==0 ){
            days += `<div class="day prev-date weekend ${mhColor}">${prevDays-x + 1}</div>`;
            }
            else{
                days += `<div class="day prev-date ${mhColor}">${prevDays-x + 1}</div>`
            }
            // 
            // console.log("prev",prevDays-x + 1);
            // console.log("prev",newDate);
            }
        //#endregion
        //#region current month days
        for (let i = 1; i <=lastDate; i++){
        //if day is today add class today
        
        // mhColor=checkValidMH(formatDate(i+" "+months[month]+ " "+year))
            if(i == new Date().getDate() && year== new Date().getFullYear() && month == new Date().getMonth()){
                var newDate = new Date(year, month, i);
                    if(newDate.getDay()==0){
                        days += `<div class='day today active weekend ${mhColor}'>${i}</div>`;
                        activeDay=i;
                        getActiveDay(i);
                    }
                    else{
                        days += `<div class='day today active ${mhColor}'>${i}</div>`;
                        activeDay=i;
                        getActiveDay(i);
                    }
            }
            else{
                var newDate = new Date(year, month, i);
                if(newDate.getDay()==0 || newDate.getDay()==6 ){
                    days += `<div class="day weekend ${mhColor}">${i}</div>`;
                }
                else{
                    days += `<div class="day ${mhColor}">${i}</div>`;
                }
            }
        }
        //#endregion
        //#region next month days  
        for(let j=1; j<= nextDays; j++){
            // mhColor=checkValidMH(formatDate(j+" "+months[month+1]+ " "+year))
            var newDate = new Date(year, month+1, j);
            if(newDate.getDay()!=6 ){
                days += `<div class="day next-date  ${mhColor}">${j}</div>`;
            }
            else{
                days += `<div class="day next-date weekend ${mhColor}">${j}</div>`;
            }
            // console.log("next",newDate)
        }
        //#endregion
    // daysContainer.innerHTML = days;  
     $('.days').html(days);
     addListener();
     addColors(formatDate(1+" "+months[month]+ " "+year));
    //  alert(formatDate(1+" "+months[month]+ " "+year))
    }


//previous month
function prevMonth() {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
    initCalendar();
  }

  //next month
function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

//go to entered date
function gotoMonth(){
    const dateArr = $('#gotomonth').val().split('-');
    if(dateArr.length == 2){
        if(dateArr[1]> 0 && dateArr[1] < 13 && dateArr[0].length == 4){
            month = dateArr[1] -1;
            year = dateArr[0];
            initCalendar();
            return;
            
        }
    }
}

//go to today
function gotoday(){
    todayy = new Date();
    month = todayy.getMonth();
    year= todayy.getFullYear();
    initCalendar();
}

function getActiveDay(date){
    const day = new Date(year, month, date);
    const dayName = day.toString().split(" ")[0];
    $('.event-day').html(dayName);
    $('.event-date').html(date+" "+months[month]+ " "+year);
    // console.log(formatDate(date+" "+months[month]+ " "+year))
    getDayta(formatDate(date+" "+months[month]+ " "+year));
}
function formatDate(iVal) {
    var d = new Date(iVal),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
function addListener() {
    const days = document.querySelectorAll(".day");
    days.forEach((day) => {
      day.addEventListener("click", (e) => {
        // getActiveDay(e.target.innerHTML);
        activeDay = Number(e.target.innerHTML);
        //remove active
        days.forEach((day) => {
          day.classList.remove("active");
        });
        //if clicked prev-date or next-date switch to that month
        if (e.target.classList.contains("prev-date")) {
          prevMonth();
          //add active to clicked day afte month is change
          setTimeout(() => {
            //add active where no prev-date or next-date
            const days = document.querySelectorAll(".day");
            days.forEach((day) => {
              if (
                !day.classList.contains("prev-date") &&
                day.innerHTML === e.target.innerHTML
              ) {
                day.classList.add("active");
              }
            });
          }, 100);
        } else if (e.target.classList.contains("next-date")) {
          nextMonth();
          //add active to clicked day afte month is changed
          setTimeout(() => {
            const days = document.querySelectorAll(".day");
            days.forEach((day) => {
              if (
                !day.classList.contains("next-date") &&
                day.innerHTML === e.target.innerHTML
              ) {
                day.classList.add("active");
              }
            });
          }, 100);
        } else {
          e.target.classList.add("active");
        }
      });
    });
}
function getDayta(iVal){
    $('#pHoursTable').empty();
    var projHours=[];
    var mhArr=[0,0,0,0];
    $.ajaxSetup({async: false});
    $.post("ajax/getDayta.php",
    {
        getDate:iVal,
        empNum:empDetails['empNum']
    },
        function (data) {
            projHours=$.parseJSON(data);
            // console.log(projHours)
            if(projHours.length>0){
                projHours.map(fillDayta);
            }
            else{
                $('#pHoursTable').html("<tr><td colspan='2' class='text-center'>No entries found</td></tr>");
            }
        }
    );
    $.ajaxSetup({async: true});
    $.post("ajax/getMHDayta.php",
    {
        getDate:iVal,
        empNum:empDetails['empNum']
    },
        function (data) {
            mhArr=$.parseJSON(data);
            $('#msvReg').html(mhArr[0].toFixed(2));
            $('#msvOt').html(mhArr[1].toFixed(2));
            $('#msvLv').html(mhArr[2].toFixed(2));
            $('#msvAms').html(mhArr[3].toFixed(2));
        }
    );
}
function fillDayta(iVal){
    var prj = iVal.split('||')[0];
    var del=``;
    if(iVal.split('||')[2]==1){
        del=`<strong>(Deleted)</strong>`;
    }
    var prjHrs = iVal.split('||')[1];
    var addString=`<tr>
    <td>${del}${prj}</td>
    <td>${prjHrs}</td>
  </tr>`;
    $('#pHoursTable').append(addString);
}
function addColors(iVal){
    var greenDates=[];
    var redDates=[];
    var holidates=[]
    var allDates=[];
    // $().addClass('green');
    $.ajaxSetup({async: false});
    $.post("ajax/getDateColors.php",
    {
        curMonth:iVal,
        empNum:empDetails['empNum']
    },
        function (data) {
            // console.log(data)
            allDates=$.parseJSON(data);
            greenDates=allDates[0];
            redDates=allDates[1];
            holidates=allDates[2];
        }
    );
    $.ajaxSetup({async: true});
    greenDates.forEach(element => {
        
        var spl = element.split("-");
        
        var m = spl[1];
        var da = spl[2];
        var d = new Date(iVal);
        var nowm = d.getMonth()+1;
        if (m>nowm){
            $(`.day.next-date:contains(${parseInt(da)})`).addClass('green').removeClass('red');
        }
        else if(m<nowm){
            $(`.day.prev-date:contains(${parseInt(da)})`).addClass('green').removeClass('red');
        }
        else{
            $(".day").not('.next-date').not('.prev-date').filter(function() {    return $(this).text() === `${parseInt(da)}`; }).addClass("green").removeClass("red");
        }
    });
    redDates.forEach(element => {
        
        var spl = element.split("-");
        
        var mm = spl[1];
        var daa = spl[2];
        var d = new Date(iVal);
        var nowmm = d.getMonth()+1;
        
        
        if (mm>nowmm){
            $(`.day.next-date:contains(${parseInt(daa)})`).addClass('red').removeClass('green')
        }
        else if(mm<nowmm){
            $(`.day.prev-date:contains(${parseInt(daa)})`).addClass('red').removeClass('green');
        }
        else{
            $(".day").not('.next-date').not('.prev-date').filter(function() {    return $(this).text() === `${parseInt(daa)}`; }).addClass("red").removeClass("green");
        }

    });
    holidates.forEach(element => {
        // console.log(element)
        var rawHoliday=element.split("||");
        var spl = rawHoliday[0].split("-");
        
        var mm = spl[1];
        var daa = spl[2];
        var d = new Date(iVal);
        var nowmm = d.getMonth()+1;
        
        
        if (mm>nowmm){
            $(`.day.next-date:contains(${parseInt(daa)})`).addClass('holiday');
            $(`.day.next-date:contains(${parseInt(daa)})`).prop('title',`${rawHoliday[1]}`);
        }
        else if(mm<nowmm){
            $(`.day.prev-date:contains(${parseInt(daa)})`).addClass('holiday');
            $(`.day.prev-date:contains(${parseInt(daa)})`).prop('title',`${rawHoliday[1]}`);
        }
        else{
            $(".day").not('.next-date').not('.prev-date').filter(function() {    return $(this).text() === `${parseInt(daa)}`; }).addClass("holiday");
            $(".day").not('.next-date').not('.prev-date').filter(function() {    return $(this).text() === `${parseInt(daa)}`; }).prop('title',`${rawHoliday[1]}`);
        }

    });
}
$(document).on('change','#gotomonth',function(){
    gotoMonth();
})
$(document).on('click', '.today-btn', function(){
    gotoday();
    $('#gotomonth').val("");
})
//#endregion