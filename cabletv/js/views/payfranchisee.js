window.PayFranchiseeView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing PayFranchisee View');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    }

});
