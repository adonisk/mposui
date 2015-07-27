app.models.Attraction = Backbone.Model.extend({

    initialize:function () {
    },

    sync: function(method, model, options) {
        if (method === "read") {
            app.adapters.attraction.findById(parseInt(this.id)).done(function (data) {
                options.success(data);
            });
        }
    }

});

app.models.AttractionCollection = Backbone.Collection.extend({

    model: app.models.Attraction,

    sync: function(method, model, options) {
        if (method === "read") {
            app.adapters.attraction.findByName(options.data.name).done(function (data) {
                options.success(data);
            });
        }
    }

});
