$(document).ready(function(){
  initializeDate();
  
})

$(document).on('change','#towSel',function(){
    if(this.value == "Checker"){
        
        $('.checker').removeClass('d-none');
    }else{
        $('.checker').addClass('d-none');
    }
});

//IIIFFFFFUUUUUU AAAAAAAAAAAAAAAAAAGGHHCCKK
// $('.card').addClass('new');//PANG PALIT KULAY


$(document).on('change','#groupSel',function(){
    var getSelValue = $(this).children(":selected").attr("data-id");
    $('#groupSel').children(":selected").attr("data-id");
    $("#idNgSelect option:selected").attr('data-id');//??????????????????????????
    // console.log(getSelValue);
});

$(document).on('click','#btn-reset', function(){
    $("#groupSel,#locationSel,#hour,#minute,#projectSel,#itemSel,#jobreqSel,#towSel,#manHType,#remarks,#towDesc").val("");
    $("").text("");
    $("#one").click();
    $("#revision").attr('checked',false);
    $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8,#p9,#p10,#p11").text("");
    $('#hour,#minute,#mhType,#towSel,#checkSel,#jobreqSel,#itemSel,#projectSel,#locationSel,#groupSel,#dateSel').removeClass('border border-danger');
    $('.checker').addClass('d-none');
});

$(document).on('click','#btn-add',function () {
    var tutri=$('input[name="radio"]:checked').val();
    var grp = $('#groupSel').val();
    var date = $('#dateSel').val();
    var loc = $('#locationSel').val();
    var proj = $('#projectSel').val();
    var item = $('#itemSel').val();
    var jobreq = $('#jobreqSel').val();
    var tow = $('#towSel').val();
    var hour = $('#hour').val();
    var mins = $('#minute').val();
    var revision =  "";
    var mhtype = $('#mhType').val();
    var remarks = $('#remarks').val();
    var checker = $('#checkSel').val();
    var err = "";
   
    
    if(grp == null){
        $('#p1').text("Please select group");
        $('#groupSel').addClass('border border-danger')
        err++;
    }
    if(date==""){
        $('#p2').text("Please select date");
        $('#dateSel').addClass('border border-danger')
        err++;
    }
    if(loc == null){
        $('#p3').text("Please select location");
        $('#locationSel').addClass('border border-danger')
        err++;
    }
    if(proj == null){
        $('#p4').text("Please select project");
        $('#projectSel').addClass('border border-danger')
        err++;
    }
    if(item == null){
        $('#p5').text("Please select item of works");
        $('#itemSel').addClass('border border-danger')
        err++;
    }
    if(jobreq == null){
        $('#p6').text("Please select job request description");
        $('#jobreqSel').addClass('border border-danger')
        err++;
    }
    if($('#revision').is(":checked")){
        revision = 1;
    }
    else{
        revision = 0;
    }
    if(tow == null){
        $('#p11').text("Please select type of work");
        $('#towSel').addClass('border border-danger')
        err++;
    }
    if(tow == 'Checker'){
        if(checker==null){
        $('#p8').text("Please select type of work");
        $('#checkSel').addClass('border border-danger')
        err++;
        }
    }
    
    if(hour>20||hour<0){
        $('#p9').text("Please input valid time");
        $('#hour').addClass('border border-danger')
        err++;
    }
    if(mins>59||mins<0){
        $('#p9').text("Please input valid time");
        $('#minute').addClass('border border-danger')
        err++;
    }
    if(mhtype == null){
        $('#p10').text("Please select manhour type");
        $('#mhType').addClass('border border-danger')
        err++;
    };

    var fd= new FormData();
    fd.append("tutri",tutri);
    fd.append("grp",grp);
    fd.append("date",date);
    fd.append("loc",loc);
    fd.append("proj",proj);
    fd.append("item",item);
    fd.append("jobreq",jobreq);
    fd.append("tow",tow);
    fd.append("revision",revision);
    fd.append("hour",hour);
    fd.append("mins",mins);
    fd.append("mhtype",mhtype);
    fd.append("remarks",remarks);
    fd.append("checker",checker);

    if(err>0){
        return;
    }
    else{
        $.ajax({
            type: "method",
            url: "url",
            data: "fd",
            dataType: "dataType",
            success: function (data) {
                
            }
        });
    }
});

//new Date().getDate() -get current date

function getDays(iVal,dateVal){
    var iYear = iVal.split("-")[0];
    var iMonth = iVal.split("-")[1]-1;
    var thisDay = new Date(`${iYear}-${iMonth - 1}-${dateVal}`);
    var totalDays =  new Date(iYear,iMonth,0).getDate();
    var addString = "<th>Project</th>";
    console.log(thisDay);
    console.log(totalDays);
    for(let x = 1 ; x <= totalDays ; x++){
        addString += `<th>${x.toString().padStart(2,"0")}</th>`;
    }
    $("#idDays").html(addString)
}

function initializeDate(){
    $("#idMonthYear").val(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`)
    getDays($("#idMonthYear").val(),new Date().getDate());
}
function today(){
  var d = new Date();

  var month = d.getMonth()+1;
  var day = d.getDate();

  var output = d.getFullYear() + '-' +
  (month<10 ? '0' : '') + month + '-' +
  (day<10 ? '0' : '') + day;
  $('#dateSel').val(output);
  $('#dateSel').attr('placeholder',output);
}