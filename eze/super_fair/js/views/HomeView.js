app.views.HomeView = Backbone.View.extend({

    initialize: function () {
        this.searchResults = new app.models.AttractionCollection();
        this.searchresultsView = new app.views.AttractionListView({model: this.searchResults});
    },

    render: function () {
        this.$el.html(this.template());
        $('.content', this.el).append(this.searchresultsView.render().el);
        this.searchResults.fetch({reset: true, data: {name: ""}});
        return this;
    },

    events: {
        "keyup .search-key":    "search",
        "keypress .search-key": "onkeypress"
    },

    search: function (event) {
        var key = $('.search-key').val();
        this.searchResults.fetch({reset: true, data: {name: key}});
    },

    onkeypress: function (event) {
        if (event.keyCode === 13) { // enter key pressed
            event.preventDefault();
        }
    },
 

});