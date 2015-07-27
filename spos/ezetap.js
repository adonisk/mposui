/**
 * assumes bunch of things
 *
 * buttons have link a, with class kb
 * clear, backspace and paycard have ids as such
 * amount also has its own id. it is assumed to be a text field 
 */
$(".kb").click(function(e) {
  var pressed = $(this).text().trim();
  var amount = getAmount();
  var txtamount = amount.replace(".", "");
  var res = "";
  res = txtamount.concat(pressed);
  setAmount(res);
});

$("#backspace").click(function(e) {
  var amount = getAmount();
  if (amount!="") {
    var res = amount.slice(0, amount.length-1);
    if (res=="0.0" || res=="0." || res=="") res = "0.00";
    setAmount(res);
  }
});
$("#clear").click(function(e) {
  setAmount("");
});

function setAmount(a) {
  var res = a.replace(".", "");
  //this never has a decimal. we add a decimal at the -3 position
  if (parseFloat(res)==0.00 || res=="" ) {
    $("#amount").val("");
    $("#paycard").prop("disabled", true);
    return;
  };
  if (res.length >= 3) {
    res = res.slice(0, res.length-2).concat(".", res.slice(res.length-2, res.length));
  } else {
    res = ".".concat(res);
  }
  $("#amount").val(res);
  $("#paycard").prop("disabled", false);
}

function getAmount() {
  var amount = $("#amount").val().trim();
  return amount;
}

$("#paycard").click(function(e){
  var paymentJson = {};
  paymentJson.ezetap_amount = parseFloat(getAmount()).toFixed(2);
  setAmount(paymentJson.ezetap_amount);
  if (paymentJson) {  //if json is empty or false, don't call ezetap
    try {
      Ezetap.doCardPayment(JSON.stringify(paymentJson));
    } catch(e) {
      console.log("Card Payment Ex - " + JSON.stringify(paymentJson));
      console.log("Card Payment Ex - " + e.message);
    }
  }
});

$(document).ready(function(){
  $("#paycard").prop("disabled", true);
  //alertify.success("Please prepare device!");
});
