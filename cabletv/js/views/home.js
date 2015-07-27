window.HomeView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing Home View');
    },

    events: {
      'click [id="get-customer-details"]': 'getcustdetails'
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },

    getcustdetails : function(event) {
      //doing this since regular form get does a reload
      // and goes to ?customer_id=:.../#customer_id - this can't be routed
      // so we trap click event and force feed a route
      var customer_id = $("#customer_id").val();
      if (_.isEmpty(customer_id)) {
        alertify.error("Please enter customer id");
        $("#customer_id").focus();
      } else {
        app.navigate("custinfo?customer_id="+customer_id, {trigger:true});
      }
      event.preventDefault();
    }

});
