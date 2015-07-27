window.TxnHistoryView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing TxnHistory View');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    }

});
