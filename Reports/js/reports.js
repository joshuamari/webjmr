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
        ifSmallScreen();

        $('.cs-loader').fadeOut(1000);
    });

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

