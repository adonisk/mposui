
var Txn = Backbone.Model.extend({});

var TxnList = Backbone.Collection.extend({
	model: Txn,
	comparator: function (item) {
		return item.get("id");
	}
});

/*** views ***/

var HomeView = Backbone.View.extend({
	el: $('#collection'),
	template: Handlebars.compile($('#collection-template').html()),
	appRouter: null,
	initialize: function (options) {
		this.appRouter = options.appRouter;
    this.collection = new TxnList();
    this.jsom = {};
    this.getCollectionData(this);
	},
	isContainerEmpty: function() {
		return $(this.el).children().length > 0 ? false : true;
	},
  render: function() {
    this.jsom.txns=this.collection.toJSON();
    this.$el.html(this.template(this.jsom));
  }

  ,getCollectionData: function(view) {
    if (typeof Ezetap != 'undefined') {
      $.ajax({
        url: 'http://d.eze.cc/api/1.0/txn/list',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'username':'9843298431',
          'password':'1ni1ni',
          'startDate':'2015-07-20'
        }),
        async: false,
        success: function (data) {
          console.log(JSON.stringify(data));
          view.jsom.netAmount = data.netAmount;
          view.jsom.count = data.count;
          _.each(data.txns, function(v){
            var t = new Txn(v);
            var m = moment(v.postingDate);
            t.set("nicePostingDate",m.format("ddd, MMM Do YYYY, h:mm a"));
            view.collection.push(t);
          });
          view.render();
        }
      });
    } else {
      //for local dev mode
      $.ajax({
        url: "tmp/txnhist.json",
        dataType: 'json',
        data: {},
        async: false,

        success: function (data) {
          view.jsom.netAmount = data.netAmount;
          view.jsom.count = data.count;
          _.each(data.txns, function(v){
            var t = new Txn(v);
            var m = moment(v.postingDate);
            t.set("nicePostingDate",m.format("ddd, MMM Do YYYY, h:mm a"));
            view.collection.push(t);
          });
          view.render();
        }
      });
    }
  }
});

var SaleCardView = Backbone.View.extend({
	el: $('#collection'),
	template: Handlebars.compile($('#salecard-template').html()),
	appRouter: null,
	initialize: function (options) {
		this.appRouter = options.appRouter;
    this.render();
	},
  render: function() {
    this.$el.html(this.template());
  }
});
var SaleCashView = Backbone.View.extend({
	el: $('#collection'),
	template: Handlebars.compile($('#salecash-template').html()),
	appRouter: null,
	initialize: function (options) {
		this.appRouter = options.appRouter;
    this.render();
	},
  render: function() {
    this.$el.html(this.template());
  }
});
var SaleCashBackView = Backbone.View.extend({
	el: $('#collection'),
	template: Handlebars.compile($('#salecashback-template').html()),
	appRouter: null,
	initialize: function (options) {
		this.appRouter = options.appRouter;
    this.render();
	},
  render: function() {
    this.$el.html(this.template());
  }
});
var SaleRPView = Backbone.View.extend({
	el: $('#collection'),
	template: Handlebars.compile($('#salerp-template').html()),
	appRouter: null,
	initialize: function (options) {
		this.appRouter = options.appRouter;
    this.render();
	},
  render: function() {
    this.$el.html(this.template());
  }
});

/*** /views ***/
var AppRouter = Backbone.Router.extend({
  routes: {
    "": "home",
    "salecard": "saleCard",
    "salecash": "saleCash",
    "salecashback": "saleCashBack",
    "salerp": "saleRP"
  },

  homeView: null,
  saleCardView: null,
  saleCashView: null,
  saleCashBackView: null,
  saleRPView: null,

	home: function () {
    $(".fixed-action-btn").show(); //because it doesn't show when put inside template
    if (this.homeView == null)
      this.homeView = new HomeView({appRouter : this});
    else
      this.homeView.render();
	},

  saleCard: function() {
    $(".fixed-action-btn").hide();
    if (this.saleCardView == null)
      this.saleCardView = new SaleCardView({appRouter : this});
    else
      this.saleCardView.render();
  },

  saleCash: function() {
    $(".fixed-action-btn").hide();
    if (this.saleCashView == null)
      this.saleCashView = new SaleCashView({appRouter : this});
    else
      this.saleCashView.render();
  },

  saleCashBack: function() {
    $(".fixed-action-btn").hide();
    if (this.saleCashBackView == null)
      this.saleCashBackView = new SaleCashBackView({appRouter : this});
    else
      this.saleCashBackView.render();
  },

  saleRP: function() {
    $(".fixed-action-btn").hide();
    if (this.saleRPView == null)
      this.saleRPView = new SaleRPView({appRouter : this});
    else
      this.saleRPView.render();
  }
});

$(document).ready(function () {
  var app = new AppRouter;
  Backbone.history.start();

  $(document).on("submit", "#salecard-form", function(e){
    e.preventDefault();
    var paymentJson = {
      'ezetap_amount': parseFloat($("#salecard_amount").val()),
      'ezetap__ref': $("#salecard-order_id").val()
    }; 
    if(Ezetap)
      Ezetap.doCardPayment(JSON.stringify(paymentJson));
    else
      alert("Call SDK with "+ JSON.stringify(paymentjson));
    app.navigate("", true);
  });
  $(document).on("submit", "#salecash-form", function(e){
    e.preventDefault();
    var paymentJson = {
      'ezetap_amount': parseFloat($("#salecash-amount").val()),
      'ezetap__ref': $("#salecash-order_id").val()
    }; 
    if(Ezetap)
      Ezetap.doCashPayment(JSON.stringify(paymentJson));
    else
      alert("Call SDK with "+ JSON.stringify(paymentjson));
    app.navigate("", true);
  });
  $(document).on("submit", "#salecashback-form", function(e){
    e.preventDefault();
    var paymentJson = {
      'ezetap_amount': parseFloat($("#salecashback-amount").val()),
      'ezetap__ref': $("#salecashback-order_id").val(),
      'ezetap_amountCashBack': parseFloat($("#salecashback-amount-cb").val())
    }; 
    if(Ezetap)
      Ezetap.doCardPayment(JSON.stringify(paymentJson));
    else
      alert("Call SDK with "+ JSON.stringify(paymentjson));
    app.navigate("", true);
  });
  $(document).on("submit", "#salerp-form", function(e){
    e.preventDefault();
    var paymentJson = {
      'amount': parseFloat($("#salerp-amount").val()),
      'extRef': $("#salerp-order_id").val(),
      'dueOn': 0,
      'mobile': $("#salerp-payee").val(),
      'agent': $("#salerp-agent").val()
    }; 
    $.ajax({
      type: "GET",
      contentType: "application/json",
      url:  "http://d.eze.cc/cnp/AMEXTEST/schedule",
      data: paymentJson,
      success: function(data) {
        var msg = "Payment request " +  data.shortUrlCode + " for Rs. " + data.amount + " sent to " + data.mobileNumber ;
        var action = '<a href=&quot;http://d.eze.cc/cnp/AMEXTEST/pay/' + data.shortUrlCode + '&quot; class=&quot;btn btn-flat yellow-text&quot;>pay</a>' ;
        toast(msg, 4000, action);
      },
      error: function (jqXHR, textStatus, errorThrown) {
          alert(jqXHR + " : " + textStatus + " : " + errorThrown);
      }
    });
  });

});
