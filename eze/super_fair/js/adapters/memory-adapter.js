app.adapters.attraction = (function () {

    var findById = function (id) {
            var deferred = $.Deferred();
            var attraction = null;
            var l = attractions.length;
            for (var i = 0; i < l; i++) {
                if (attractions[i].id === id) {
                    attraction = attractions[i];
                    break;
                }
            }
            deferred.resolve(attraction);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = attractions.filter(function (element) {
                var fullName = element.Name;
                return fullName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        attractions = [
            {"id": 1, "Name": "Temple of Doom", "priceForAdult": 100, "priceForChild": 10, "title":"A magical ride through the innards of the sacred temple!"},
            {"id": 2, "Name": "Men In Black", "priceForAdult": 120, "priceForChild": 20, "title":"Drive the flying Mercedes to stay ahead of the aliens"},
            {"id": 3, "Name": "Alice in Wonderland", "priceForAdult": 60, "priceForChild": 5, "title":"A timeless classic in pink"},
            {"id": 4, "Name": "Back to the Future", "priceForAdult": 140, "priceForChild": 30, "title":"Join doc and Marty to go back in time on the DeLorean!"}
        ];

    // The public API
    return {
        findById: findById,
        findByName: findByName
     };

    
}());