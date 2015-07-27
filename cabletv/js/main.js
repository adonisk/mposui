
var Customer = Backbone.Model.extend({});
var CustomerCollection = Backbone.Collection.extend({
   model: Customer
});

var customers = new CustomerCollection;

customers.add( new Customer({id:"0001", name:"Satheesh V", address:"Sham Nagar, Ludhiana - 141002",  mobile:"09945116043",
  pending:[
    {service:"Basic Service Tier", amount: 250},
    {service:"Silver Package", amount: 100},
    {service:"Balance", amount: 50}
  ]
  }) );
customers.add( new Customer({id:"0002", name:"Pallove Das", address:"Super Market Street, Ludhiana - 141002", mobile:"09686601073",
pending:[
    {service:"Basic Service Tier", amount: 250},
    {service:"Gold Package", amount: 150},
    {service:"Balance", amount: 10}
]}) );

window.Router = Backbone.Router.extend({

    routes: {
        "": "home",
        "quickpay": "quickpay",
        "custinfo?customer_id=:customer_id": "custinfo",
        "remotepay?ref=:ref&amount=:amount": "remotepay",
        "txnhistory": "txnhistory",
        "payfranchisee": "payfranchisee"
    },

    initialize: function () {
      //TODO: potentially, the side bar binding will go here?
      //FIXME: this is boilerplate code again and again. we should have a util function
      this.homeView = new HomeView(); this.homeView.render();
      this.quickPayView = new QuickPayView(); this.quickPayView.render();
      this.txnHistoryView = new TxnHistoryView(); this.txnHistoryView.render();
      this.payFranchiseeView = new PayFranchiseeView(); this.payFranchiseeView.render();
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
      var p = customers.get(customer_id);
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
    },

    payfranchisee: function () {
      this.payFranchiseeView.delegateEvents();
      $("#content").html(this.payFranchiseeView.el);
    }


});

templateLoader.load(["HomeView", "QuickPayView", "CustInfoView", "RemotePayView", "TxnHistoryView", "PayFranchiseeView"],
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
