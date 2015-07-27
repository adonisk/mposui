var app = {
    views: {},
    models: {},
    routers: {},
    utils: {},
    adapters: {}
};

$(document).on("ready", function () {
    app.router = new app.routers.AppRouter();
    app.utils.templates.load(["HomeView", "AttractionView", "AttractionListItemView"],
        function () {
            app.router = new app.routers.AppRouter();
            Backbone.history.start();
        });



});

function recalculateTotal() {
    numAdults = parseInt($("#num-adults").val());
    if (isNaN(numAdults)) numAdults = 0;
    numChildren = parseInt($("#num-children").val());
    if (isNaN(numChildren)) numChildren = 0;
    
    chargeAdult = parseInt($("#adults-charge").text());
    chargeChild = parseInt($("#children-charge").text());

    totalAmount = (numAdults * chargeAdult) + (numChildren * chargeChild);

    $("#eze_amount").val(totalAmount); //TODO: this should really be bound rather than set/get etc

}


function payByCard(){
    WebView.doPayment("btn_card_pymt");
}
function payByCash(){
    WebView.doPayment("btn_cash_pymt");
}
