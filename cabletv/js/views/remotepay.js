window.RemotePayView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing RemotePay View');
    },

    events: {
      'click [id="sendtorelative"]': 'scheduleevent'
    },

    render:function () {
        $(this.el).html(this.template(this.model));
        return this;
    },

    scheduleevent : function (e) {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url:  "http://d.eze.cc/cnp/COLASIA/schedule",
            data: $("#schedule-event").serialize(),
            success: function(data) {
              var msg = "Payment request " +  data.shortUrlCode + " for Rs. " + data.amount + " sent to " + data.mobileNumber;
              $("#response-message").html(msg);
              $("#response-area").show();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(jqXHR + " : " + textStatus + " : " + errorThrown);
            }
        });
        e.preventDefault();
    }

});
