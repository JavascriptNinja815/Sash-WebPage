var x = readCookie('ppkcookie')
// alert(x);
if (x) {
//    debugger;
    window.location.href = "http://82.196.6.137";
  }
else {
      window.onload = function() {
          /*sash-firebase info*/
        // var config = {
        //   apiKey: "AIzaSyAs4mb7BhQMYe8ntiyT5jXBozGeGiVScDo",
        //   authDomain: "sash-f621c.firebaseapp.com",
        //   databaseURL: "https://sash-f621c.firebaseio.com",
        //   projectId: "sash-f621c",
        //   storageBucket: "sash-f621c.appspot.com",
        //   messagingSenderId: "213097256501"
        // };
        var config = {
          apiKey: "AIzaSyC4vCQQP1gvZ7dOyGNfGDHRC5dCY6ApJng",
          authDomain: "phone-verify-4e439.firebaseapp.com",
          databaseURL: "https://phone-verify-4e439.firebaseio.com",
          projectId: "phone-verify-4e439",
          storageBucket: "phone-verify-4e439.appspot.com",
          messagingSenderId: "985497965314"
        };
        window.confirmationResult = null;
        firebase.initializeApp(config);
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('login_btn', {
          'size': 'invisible',
          'callback': function(response) {
            onSignInSubmitReturn();
          }
        });
      }
}
function onSignInSubmitReturn(){

}
function onSignInSubmit() {
  var phoneNumber = getPhoneNumberFromUserInput();
  var ref = firebase.database().ref('development').child('accounts');
  var isExist = false;
  ref.once("value").then(function(snapshot) {
    snapshot.forEach(function(childSnap){
      if (snapshot.child(childSnap.key + "/profile/telephone").val() == phoneNumber) {
        isExist = true;
      }
    });
    if (isExist == true){
      replaceForm();
      display_sms_input();
      /*sms sending*/
      var detect_phoneNumber = parse();
      var appVerifier = window.recaptchaVerifier;
      firebase.auth().signInWithPhoneNumber(detect_phoneNumber, appVerifier)
        .then(function (confirmationResult) {
          window.confirmationResult = confirmationResult;
      }).catch(function (error) {
      });
    }else display_dismatch();
  });
  return false;
}
function getPhoneNumberFromUserInput() {
  return document.getElementById('tel_num').value;
}
function onVerifyCodeSubmit() {
  var code = getCodeFromUserInput();
  if(confirmationResult)  {
      confirmationResult.confirm(code).then(function (result) {
        var user = result.user;
        createCookie('ppkcookie','testcookie',2);
        verification_success();
      }).catch(function (error) {
        eraser();
        display_sms_error();
        document.getElementById('verify_btn').setAttribute('disabled', true);
        display_return_btn();
        document.getElementById("return_btn").addEventListener("click", myFunction);
      });
    }
  return false;
}
function myFunction() {
      window.location = "http://82.196.6.137/sash";
}
function parse(){
  var number = getPhoneNumberFromUserInput();
  if (number.split("",1) == '0')
     return ('+'+'966'+number.substring(1));
  else
    return number;
}
function replaceForm() {
  document.getElementById("info_input").style.display = 'none';
  document.getElementById("authFrm").style.display = 'block';
  document.getElementById("header_letter_login").style.display = 'none';
  document.getElementById("header_letter_verify").style.display = 'block';
}
function display_dismatch(){
  document.getElementById('phone_error').style.display = 'block';
}
function display_sms_input(){
  document.getElementById('sms_input').style.display = 'block';
}
function display_sms_error(){
  document.getElementById('sms_error').style.display = 'block';
}
function display_return_btn(){
  document.getElementById('return_btn').style.display = 'block';
}
function verification_success(){
  document.getElementById('sms_input').style.display = 'none';
  document.getElementById('sms_success').style.display = 'block';
  window.location.href = "http://82.196.6.137";
}
function eraser(){
  document.getElementById('sms_input').style.display = 'none';
}
function getCodeFromUserInput(){
  return document.getElementById("auth_code_input").value;
}

function createCookie(name,value,time) {
    var expires = "";
    if (time) {
        var date = new Date();
        date.setTime(date.getTime() + (time*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
 function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    //console.log(ca);
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}