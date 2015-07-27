window.CustInfoView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing CustInfoView View');

    },

    events: {
      'click [id="request-relative"]': 'remotePayStart'
    },

    render:function () {
        $(this.el).html(this.template(this.model));
        return this;
    },

    remotePayStart: function() {
      var amount = $("#ezetap_amount").val();
      var ref = $("#ezetap___ref").val();
      app.navigate("#remotepay?ref="+ref + "&amount="+amount, {trigger:true});
      event.preventDefault();
    }

});
