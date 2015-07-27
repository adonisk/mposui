app.routers.AppRouter = Backbone.Router.extend({

    routes: {
        "":                         "home",
        "attractions/:id":          "attractionDetails"
    },

    initialize: function () {
        app.slider = new PageSlider($('body'));
    },

    home: function () {
        // Since the home view never changes, we instantiate it and render it only once
        if (!app.homeView) {
            app.homeView = new app.views.HomeView();
            app.homeView.render();
        } else {
            app.homeView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.homeView.$el);
    },

    attractionDetails: function (id) {
        var attraction = new app.models.Attraction({id: id});
        attraction.fetch({
            success: function (data) {
                // TODO: Note that we could also 'recycle' the same instance of AttractionFullView
                // instead of creating new instances
                app.slider.slidePage(new app.views.AttractionView({model: data}).render().$el);
            }
        });
    }

    
});