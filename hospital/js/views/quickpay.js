window.QuickPayView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing QuickPay View');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    }

});
