//

Handlebars.registerHelper('xif', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

//FIXME: move to router than globals
var current_location = null;
var map = null;

function getLocation() {
  //var wid = navigator.geolocation.getCurrentPosition(populate_location, function(error){alert(error.message);}, {enableHighAccuracy:true, timeout:60000});
  var wid = navigator.geolocation.watchPosition(populate_location, function(error){alert(error.message);}, {enableHighAccuracy:true, timeout:60000});
  return wid;
}

function populate_location(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  current_location = new LatLon(latitude, longitude);
  console.log("Got location>>");
  console.log(position);
  app.homeView.updateDistanceTo(current_location);
};

var Shipment = Backbone.Model.extend({});

var TripSheet = Backbone.Collection.extend({
	model: Shipment,
	comparator: function (item) {
		return item.get("customer").distanceTo;
	}
});

var CollectionView = Backbone.View.extend({
	el: $('#collection'),
  collection: null,   //comes from outside - note that name collection doesn't mean anything special
	template: Handlebars.compile($('#collection-template').html()),
	appRouter: null,
	initialize: function(options) {
		this.appRouter = options.appRouter;
		//CHECK: Need to fix this when nothing is there
		//_.bindAll(this, "renderItem", "isContainerEmpty");
	},

	renderItem: function(model){
    if (model.get("status") == 'pending')
      var itemView = new CollectionListItemView({model: model, appRouter: this.appRouter});
	},

	isContainerEmpty: function() {
		return $(this.el).children().length > 0 ? false : true;
	},

	render: function(){
    this.$el.html(this.template());
    //sort is explicitly called because model is updated when location is got
    //so we get the items based on current location sort
    this.collection.sort(); 
		this.collection.each(this.renderItem);
	}

});

var CollectionListItemView = Backbone.View.extend({
	template: Handlebars.compile($('#collection-list-item-template').html()),
	appRouter: null,
	initialize: function(options) {
		this.appRouter = options.appRouter;
    this.model = options.model;
    this.render();
	},
	render: function(){
    //CHECK: this.$el.append doesn't work
    var jsom = this.model.toJSON();
    if (current_location != null)
      jsom.customer.distanceTo = Math.round(current_location.distanceTo(jsom.customer.address.p));
    else
      jsom.customer.distanceTo = 99999;
    $('#collection-item-list').append(this.template(jsom));
	}
});


//***************** Views *********************************

var HomeView = Backbone.View.extend({

	appRouter: null,
  collection: null,

	initialize: function (options) {
		var homeView = this;
		this.appRouter = options.appRouter;
    this.collection =  new TripSheet();

    //following this mode rather than collection.url and collection.fetch
    // that is cleaner, but let us assume that i will've to hand code api input
    // for now.
		$.ajax({
			url: "data/tripsheet_data_0001.json",
			dataType: 'json',
			data: {},
			async: false,

			success: function (data)
			{
        _.each(data.items, function(v){
          //backbone.js computed properties are a nuisance 'coz they don't get into toJSON for hbs
          // so, doing this upfront
          v.customer.address.p = new LatLon(v.customer.address.latitude, v.customer.address.longitude);
          v.numitems = 0;
          _.each(v.lines, function(x){v.numitems += x.quantity;});
          var s = new Shipment(v);
          homeView.collection.push(s);
        });
			}
		});
	},

  render: function() {
      var collectionView = new CollectionView({ collection: this.collection, appRouter: this.appRouter });
      collectionView.render();
  },

  updateDistanceTo: function(fromPoint) {
    //FIXME: we could make this better by simply adding values to distance span than re
    //drawing whole view
    if (fromPoint != null) {
      this.collection.forEach(function(item){
        var jso = item.toJSON();
        var dTo = Math.round(fromPoint.distanceTo(jso.customer.address.p));
        item.get("customer").distanceTo = dTo;
      });
      if (Backbone.history.fragment.indexOf("details") == -1) //absolutely stupid!
        this.render();
    }
  }

});

var DetailsView = Backbone.View.extend({

	template: Handlebars.compile($('#collection-item-template').html()),
	appRouter: null,

	initialize: function (options) {
		this.appRouter = options.appRouter;
    this.model =  options.model;
	},

  render: function() {
    var m = this.model.toJSON();
    var z = 10;
    $("#collection").html(this.template(m));
    map.setView([m.customer.address.latitude, m.customer.address.longitude], z);
    //clear any existing markers because we are reusing the map div for all shipments
    map.eachLayer(function(l){map.removeLayer(l);});
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([m.customer.address.latitude, m.customer.address.longitude]).addTo(map);
    if (current_location != null)
      L.marker([current_location.lat, current_location.lon], {opacity:0.75}).addTo(map);
    map.invalidateSize();
  }

});


// ********* Main App Router **************

var AppRouter = Backbone.Router.extend({

  locWatcher: null,


	homeView: null,

	detailsModel: null,
	detailsView: null,


	routes:{
		"":"home",
		"details/:id": "details"
	},

	initialize: function () {
    locWatcher = getLocation();
	},

	home: function () {
    if (this.homeView == null)
      this.homeView = new HomeView({appRouter : this});
    this.homeView.render();
    var pends = this.homeView.collection.where({"status":"pending"});
    $("#pending-counter").html(pends.length);
	},

	details: function (id) {
    //if someone just jumps into details, homeview will be null
    if (this.homeView == null) 
      this.homeView = new HomeView({appRouter : this});
    this.detailsModel = this.homeView.collection.findWhere({"shipment_id": parseInt(id)});
		this.detailsView = new DetailsView ({model: this.detailsModel, appRouter : this});
		this.detailsView.render();
	}


});

$(document).ready(function () {
	app = new AppRouter();
  map = L.map('map-canvas');
	Backbone.history.start();
});

$('#map-popup').on('shown.bs.modal', function (event) {
  //this is to fix the map popup to redraw. doesn't seem to work though
  map.invalidateSize(true);
  //http://stackoverflow.com/questions/10762984/leaflet-map-not-displayed-properly-inside-tabbed-panel
  //L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
});

$('#undelivered-popup').on('hidden.bs.modal', function (event) {
  //TODO: check and read if reason is selected
  var undelivered_reason = $("#undelivered-popup input[type='radio']:checked").val();
  if (undelivered_reason) {
    $("#undelivered-popup input[type='radio']").prop('checked', false);
    var shipment_id = Backbone.history.fragment.replace("details/",""); //absolutely stupid!
    var detailsModel = app.homeView.collection.findWhere({"shipment_id": parseInt(shipment_id)});
    if (detailsModel != null) {
      detailsModel.set("status", undelivered_reason);
      //TODO: persist this
    }
    app.navigate("", {trigger: true});
  }
});

$('#delivered-popup').on('hidden.bs.modal', function (event) {
  var shipment_id = Backbone.history.fragment.replace("details/",""); //absolutely stupid!
  var detailsModel = app.homeView.collection.findWhere({"shipment_id": parseInt(shipment_id)});
  if (detailsModel != null) {
    detailsModel.set("status", "delivered");
    //TODO: persist this
  }
  app.navigate("", {trigger: true});
});

$("body").on('click','#pay-card', function() { 
  var shipment_id = Backbone.history.fragment.replace("details/",""); //absolutely stupid!
  var detailsModel = app.homeView.collection.findWhere({"shipment_id": parseInt(shipment_id)});
  if (detailsModel != null) {
    detailsModel.set("status", "delivered");
    //TODO: persist this AFTER payment done
    var paymentJson = {'ezetap_amount':detailsModel.get("amount"),
      'ezetap___ref': detailsModel.get("order_id"),
      'ezetap_name': detailsModel.get("customer").name,
      'ezetap_mobile': detailsModel.get("customer").mobile,
      'ezetap_customerEmail': detailsModel.get("customer").email
    }; 
    Ezetap.doCardPayment(JSON.stringify(paymentJson));
    app.navigate("", {trigger: true});
  }
});

$("body").on('click','#pay-cash', function() { 
  var shipment_id = Backbone.history.fragment.replace("details/",""); //absolutely stupid!
  var detailsModel = app.homeView.collection.findWhere({"shipment_id": parseInt(shipment_id)});
  if (detailsModel != null) {
    detailsModel.set("status", "delivered");
    //TODO: persist this AFTER payment done
    var paymentJson = {'ezetap_amount':detailsModel.get("amount"),
      'ezetap___ref': detailsModel.get("order_id"),
      'ezetap_name': detailsModel.get("customer").name,
      'ezetap_mobile': detailsModel.get("customer").mobile,
      'ezetap_customerEmail': detailsModel.get("customer").email
    }; 
    Ezetap.doCashPayment(JSON.stringify(paymentJson));
    app.navigate("", {trigger: true});
  }
});

