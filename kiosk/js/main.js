
var Patient = Backbone.Model.extend({});
var PatientsCollection = Backbone.Collection.extend({
   model: Patient
});

var patients = new PatientsCollection;

patients.add( new Patient({id:"0001", name:"Peter Parker", gender:"Male", age:30, mobile:"9945116043",
  pending:[
    {service:"Consultation Fee", amount: 250},
    {service:"Blood Test", amount: 500},
    {service:"X-Ray", amount: 600}
  ]
  }) );
patients.add( new Patient({id:"0002", name:"Mary Jane", gender:"Female", age:29, mobile:"9945116043",
pending:[
  {service:"Consultation Fee", amount: 250},
  {service:"Scan", amount: 1500}
]}) );

patients.add( new Patient({id:"0003", name:"Clark Kent", gender:"Male", age:30, mobile:"9945116043",
  pending:[
    {service:"Consultation Fee", amount: 250},
    {service:"Blood Test", amount: 500},
    {service:"X-Ray", amount: 600},
    {service:"Room Rent", amount: 10000},
    {service:"Cafeteria", amount: 5000}
  ]
  }) );
patients.add( new Patient({id:"0004", name:"Lois Lane", gender:"Female", age:29, mobile:"9945116043",
pending:[
  {service:"Consultation Fee", amount: 250},
  {service:"Scan", amount: 1600}
]}) );
window.Router = Backbone.Router.extend({

    routes: {
        "": "home",
        "quickpay": "quickpay",
        "custinfo?customer_id=:customer_id": "custinfo",
        "remotepay?ref=:ref&amount=:amount": "remotepay",
        "txnhistory": "txnhistory"
    },

    initialize: function () {
      //TODO: potentially, the side bar binding will go here?
      //FIXME: this is boilerplate code again and again. we should have a util function
      this.homeView = new HomeView(); this.homeView.render();
      this.quickPayView = new QuickPayView(); this.quickPayView.render();
      this.txnHistoryView = new TxnHistoryView(); this.txnHistoryView.render();
    },


    home: function () {
      this.homeView.delegateEvents();
      $("#content").html(this.homeView.el);
    },

    quickpay: function () {
      this.quickPayView.delegateEvents();
      $("#content").html(this.quickPayView.el);
    },

    custinfo: function (customer_id) {
      var p = patients.get(customer_id);
      if (p == undefined) {
        alertify.error("Could not find patient with that id");
        app.navigate("./#", {trigger:true});
      } else {
        custinfoView = new CustInfoView();
        custinfoView.model = p.toJSON();
        total_amount = 0;
        _.each(custinfoView.model.pending, function(li){
          total_amount += li.amount;
        })
        custinfoView.model["total_amount"] = total_amount * 1.00;
        custinfoView.render();
        $("#content").html(custinfoView.el);
      }
    },

    remotepay: function (ref, amount, agent) {
        remotePayView = new RemotePayView();
        remotePayView.model = {"ref": ref, "amount": amount, "agent": agent};
        remotePayView.render();
        $("#content").html(remotePayView.el);
    },

    txnhistory: function () {
      this.txnHistoryView.delegateEvents();
      $("#content").html(this.txnHistoryView.el);
    }


});

templateLoader.load(["HomeView", "QuickPayView", "CustInfoView", "RemotePayView", "TxnHistoryView"],
    function () {
        app = new Router();
        Backbone.history.start();
    });


function getPaymentJson() {
  //instead of dumping the form, you can collect values one by one as well.
  //this is just for example
  var dump = $('#data_collection').serializeArray(),
             len = dump.length,
             json = {};
  for (i=0; i<len; i++) {
    key = dump[i].name;
    if (0==key.indexOf("ezetap_")) // Ezetap looks at only specific keys; all those need to start with ezetap_
      json[key] = dump[i].value.trim();
  }
  //ensure amounts are numeric
  json.ezetap_amount = parseFloat(json.ezetap_amount);
  if (json.ezetap_additionalamount) json.ezetap_additionalamount = parseFloat(json.ezetap_additionalamount);
  else delete json['ezetap_additionalamount'];
  if (json.ezetap_amount < 1) {
    //example of sending an error toast
    sendToast("Amount cannot be less than 1.00", false);
    $('#ezetap_amount').focus();
    return;
  }
  return json;
}

function payByCard() {
  //Note that the button name to be passed HAS to be ezetap_btn_card_payment
  var paymentJson = getPaymentJson();
  if (paymentJson) {  //if json is empty or false, don't call ezetap
    try {
      Ezetap.doCardPayment(JSON.stringify(paymentJson));
    } catch(e) {
      console.log("Card Payment Ex - " + JSON.stringify(paymentJson));
      console.log("Card Payment Ex - " + e.message);
    }
  }
}

function payByCash() {
  var paymentJson = getPaymentJson();
  if (paymentJson) {  //if json is empty or false, don't call ezetap
    try {
      Ezetap.doCashPayment(JSON.stringify(paymentJson));
    } catch(e) {
      console.log("Cash Payment Ex - " + JSON.stringify(paymentJson));
      console.log("Cash Payment Ex - " + e.message);
    }
  }
}

$(document).ready(function() {
  if (typeof Ezetap == "undefined") { // check the bridge; enable payment only if it is inside Ezetap mPOS
    //FIXME: this doesn't see to disable
    $(".EzePayCard").attr('disabled','true');
    $(".EzePayCash").attr('disabled','true');
  }
});
