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
//#endregion

//#region BINDS
$(document).ready(function(){//page Initialize Event
    $.ajax({url:"Includes/checkLogin.php", success: function(data){ //ajax to check if user is logged in
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
        console.log("pinindot")
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
        $('.ms-lbl p').html(`Monthly Standard <i class='bx bx-right-arrow-alt d-flex align-items-center text-light' style="font-size: 20px;"></i>`);
    }

    
})
$(document).on('change','#idGroup',function(){//select Group Event
    // var getSelValue = $(this).children(":selected").attr("data-id");
    // $('#idGroup').children(":selected").attr("data-id");
    getProjects();
    getCheckers();
    $('#p1').text("");
    $(this).removeClass('border-danger');

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
    getItems(projID);
    // if(projID==1 || projID==5 || projID==4){//IF GOW or LEAVE
    //     getJobs(projID,"test");
    // }
    isDrawing();
    getTOW(projID);
    disableTimeInput(projID);
    MHValidation();
    $('#p4').text("");
    $(this).removeClass('border-danger');

    if(projID == '5'){
        $('#itemlbl').html("Leave Type");
        $('#lbltow').html("Day Type");
    }
    else{
        $('#itemlbl').html("Item of Works");
        $('#lbltow').html("Type of Work");
    }
    
});
$(document).on('change','#idItem',function(){//select Item Event
    var projID=$($('#idProject').find('option:selected')).attr('proj-id');
    var itemID=$($(this).find('option:selected')).attr('item-id');
    getJobs(projID,itemID);

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
});
$(document).on('change', '#idMH', function(){
    $('#p10').text("");
    $(this).removeClass('border-danger');
});
$(document).on('change', '#idJRD', function(){
    $('#p6').text("");
    $(this).removeClass('border-danger');
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
    <tr id="${mht}_${pId}">
    <td>${loc}</td>
    <td>${group}</td>
    <td>${project}</td>
    <td>${item}</td>
    <td>${desc}</td>
    <td>${parseFloat(hour/60).toFixed(2)}</td>
    <td>${mhtyp[mht]}</td>
    <td><button class="btn btn-warning" edit-entry><i class="fa fa-pencil"></i></button><button class="btn btn-danger  delBut"><i class="text-light fa fa-trash"></i></button></td>
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
            if(reg>8 || (reg>0 && reg<8)){
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
function getProjects(){//get Project Selection

    $.ajaxSetup({async: false});
    $.post("ajax/getProjects.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum']
    },
        function (data) {
            $('#idProject').html(data);
            $('#idProject').val("").change();
        }
    );
    $.ajaxSetup({async: true});
    
}
function getItems(iVal){//get Item Selection
    $.ajaxSetup({async: false});
    $.post("ajax/getItems.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        projID:iVal
    },
        function (data) {
            $('#idItem').html(data);
            sequenceValidation();
        }
    );
    $.ajaxSetup({async: true}); 
}
function getJobs(iVal,xVal){//get Job Selection
    $.ajaxSetup({async: false});
    $('#idJRD').val('');
    $.post("ajax/getJobs.php",
    {
        // empGroup:empDetails['empGroup'],
        empGroup:$('#idGroup').val(),
        empNum:empDetails['empNum'],
        projID:iVal,
        itemID:xVal
    },
        function (data) {
            $('#idJRD').html(data);
            sequenceValidation();
        }
    );
    $.ajaxSetup({async: true});
}
function addEntries(iVal){//add Entries to Database
    var tutri=$('input[name="radio"]:checked').val();
    var grp = $('#idGroup').val();
    var date = $('#idDRDate').val();
    var loc = $('#idLocation').val();
    var proj = $($('#idProject').find('option:selected')).attr('proj-id');
    var item = $($('#idItem').find('option:selected')).attr('item-id');
    var jobreq = $($('#idJRD').find('option:selected')).attr('job-id');
    var tow = $($('#idTOW').find('option:selected')).attr('tow-id');
    var hour = $('#getHour').val()*60 || "0";
    var mins = $('#getMin').val() || "0";
    var getDuration = `${parseFloat(hour) + parseFloat(mins)}`;  
    var revision =  "";
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
    if(!jobreq && !defaults.includes(proj)){
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
    if(!tow && !defaults.includes(proj)){
        $('#p11').text("Please select type of work");
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
    if(!mhtype && proj!=5){
        $('#p10').text("Please select manhour type");
        $('#idMH').addClass('border border-danger')
        mgaKulang.push("MHTYPE");
    };
    
    if(proj==5){//IF LEAVE
        mhtype=2;
    }

    var fd= new FormData();
    fd.append("getTwoThree",tutri);
    fd.append("getGroup",grp);
    fd.append("getDate",date);
    fd.append("getLocation",loc);
    fd.append("getProject",proj);
    fd.append("getItem",item);
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
        // for (var pair of fd.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]); 
        // }
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
    $("#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#towDesc").val("");
    $("#one").click();
    $("#idRev").prop('checked',false);
    $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8,#p9,#p10,#p11").text("");
    $("#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate").removeClass('border border-danger');
    $('.checker').addClass('d-none');
    sequenceValidation();
}
function disableTimeInput(iVal){//disable Time Input
    $('#getHour').prop('disabled',false);
    $('#getMin').prop('disabled',false);
    if(iVal==5){
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
    isDrawing=((!defaults.includes(projID) || projID=='2') && projID);
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
    if(projID=='5'){
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
    $('#idLocation').val();
    if(projID!="5"){//if Project selected is not LEAVE
        if(!isWorkDay(selLoc)){
            $("#idMH").val('Overtime');
            $("#idMH").attr('disabled',true);
        }
        else{
            $("#idMH").attr('disabled',false);
            $("#idMH").val('');
        }
    }
    else{
        $("#idMH").attr('disabled',true);
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
            console.log(data)
            getEntries();
            resetEntry();
        }
    );
}
function editEntry(iVal){//edit selected entry
    $('#idAdd').text("Save Changes");
    $('#idReset').text("Cancel");

    var trID = $($(iVal).parents()[1]).attr('id')
    editID = trID.split("_")[1];
    
    $.post("ajax/getDataEdit.php", {
        primaryID : editID
    },
        function (data) {
            console.log(data);
            var dataEdit = $.parseJSON(data);
            // console.log(dataEdit);
            // var dataEdit = ["KDT","SYS",6,3,"Training",8,0,1,"test",null,null];
            $('#idGroup').val(dataEdit[1]);
            var getLocs = Object.values(document.getElementsByClassName("clLoc"));
            getLocs.forEach(element => {
                if(dataEdit[0] == $(element).text()){
                    $(element).click();
                }
            });
            getCheckers();
            getProjects();
            $($('#idProject').find(`option[proj-id=${dataEdit[2]}]`)).attr('selected',true).change();
            getItems(dataEdit[2]);
            $($('#idItem').find(`option[item-id=${dataEdit[3]}]`)).attr('selected',true).change();
            getJobs(dataEdit[2],dataEdit[3]);
            $($('#idJRD').find(`option[job-id=${dataEdit[4]}]`)).attr('selected',true).change();

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
            $($('#idTOW').find(`option[tow-id=${dataEdit[7]}]`)).attr('selected',true).change();
            getTOWDesc(dataEdit[7]);
            $($('#idMH').find(`option[mhid=${dataEdit[6]}]`)).attr('selected',true).change();
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
                $($('#idChecking').find(`option[dataid=${dataEdit[11]}]`)).attr('selected',true).change();
                // console.log(`$($('#idChecking').find("option[dataid=${dataEdit[11]}]")).attr('selected',true);`);
            }
        }
    );
    isDrawing();
}

function ifSmallScreen(){//responsive
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

function getCheckers(){//get Checkers Selection
    $.ajaxSetup({async: false});
    var empGrp=$('#idGroup').val();
    $.post("ajax/getCheckers.php",
     {
        empGrp:empGrp,
        empNum:empDetails['empNum']
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
//#region 

        //     reg = Convert.ToDouble(lblRegular.Text);
        //     ot = Convert.ToDouble(lblOT.Text);
        //     leave = Convert.ToDouble(lblLeave.Text);
        //     lblRegular.BackColor = Color.PowderBlue;
        //     lblOT.BackColor = Color.PowderBlue;
        //     lblLeave.BackColor = Color.PowderBlue;


        //     //WFH
        //     if (cboLocation.Text == "WFH")
        //     {
        //         if (leave != 0 || ot != 0)
        //         {
        //             lblRegular.BackColor = Color.Red;
        //             lblOT.BackColor = Color.Red;
        //             lblLeave.BackColor = Color.Red;
        //         }
        //         return;
        //     }
        //     //for 1 - 5 daytype
        //     //regular working day
        //     if (dayType <= 5)
        //     {
        //         if (leave != 0 && ot != 0)
        //         {
        //             lblRegular.BackColor = Color.Red;
        //             lblOT.BackColor = Color.Red;
        //             lblLeave.BackColor = Color.Red;
        //         }
        //         if (ot != 0 && reg < 8)
        //         {
        //             lblRegular.BackColor = Color.Red;
        //             lblOT.BackColor = Color.Red;
        //         }
        //         if (leave != 0)
        //         {
        //             if (leave + reg > 8)
        //             {
        //                 lblRegular.BackColor = Color.Red;
                       
        //             }
        //             if (leave + reg < 8)
        //             {
        //                 lblRegular.BackColor = Color.Red;
        //             }
        //             if (leave > 8)
        //             {
        //                 lblLeave.BackColor = Color.Red;
        //             }
        //         }
        //         else
        //         {
        //             if (reg != 8)
        //             {
        //                 if (reg > 8)
        //                 {

        //                     lblOT.BackColor = Color.Red;
        //                 }
        //                 lblRegular.BackColor = Color.Red;

        //             }

        //         }


        //     }
        //     //for 6-7-8
        //     //saturday and sunday and holiday
        //     if ((dayType > 5) && (dayType <= 8))
        //     {
        //         if (reg != 0)//may laman regular
        //         {
        //             lblRegular.BackColor = Color.Red;
        //         }
        //         else if (leave != 0)//may laman leave
        //         {
        //             lblLeave.BackColor = Color.Red;
        //         }
        //         else if (ot < 4)//4 hrs minimum sabi sa Manual
        //         {
        //             lblOT.BackColor = Color.Red;
        //         }
        //         else
        //         {
        //             lblRegular.BackColor = Color.PowderBlue;
        //             lblLeave.BackColor = Color.PowderBlue;
        //         }
        //     }
        // }




//#endregion
//#endregion