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
   
      
         //console.log('connected main.js');
        getMyGroups();
        getProjects()
        $('#tContent').sortable({
            placeholder: 'ui-state-highlight',
            update: function(event,ui){
                var prio_array = new Array();
                $('#tContent tr').each(function(){
                    prio_array.push($(this).attr('data-id'));
                });
                $.post("getProjects.php",
                {
                    prio_array:prio_array, 
                    action:'update',
                },function(data){
                    getProjects();
                }
                );
            }
        });
    }
  }})

});

function getProjects(){
    $.post("ajax/getProjects.php",
    {
        empGroup:$('#myGroup').val(),
        action:'fets',
    },
        function (data) {
            $('#tContent').html(data);
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

      }
    );
  }