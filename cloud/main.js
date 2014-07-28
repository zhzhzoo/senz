// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:

var createBeaconResult = function (query, response) {
    query.find({
        success: function (results) {
            var result = {'senzes': {}, 'beacons': []};
            for (var i = 0; i < results.length; i++) {
                var b = results[i];
                console.log('senz,' + JSON.stringify(b.get('senz')));
                result.senzes[b.get('senz').id] = b.get('senz');
                b.set('senz', b.get('senz').id);
                result.beacons.push(b);
            }
            response.success(result);
        },
        error: function (error) {
            response.error("lookup failed," + error.message);
        }
    });
}

var queryWithBeacon = function (request, response) {
    var queryBeacons = request.params.beacons,
        queries = [],
        query,
        q;

//    console.log('params,', request.params.beacons);
    for (var i = 0; i < queryBeacons.length; i++) {
        var b = queryBeacons[i];
        q = new AV.Query("Beacon");
        q.equalTo("uuid", b.uuid);
        q.equalTo("major", b.major);
        q.equalTo("minor", b.minor);
        queries.push(q);
//        console.log('?uuid=', b.uuid, ',major=', b.major, ',minor=', b.minor);
    }

    if (queries.length > 0) {
        query = new AV.Query("Beacon");
        for (var i = 0; i < queries.length; i++) {
            var beaconQuery = queries[i];
            AV.Query.or(query, beaconQuery);
        }
        query.include('senz');
        createBeaconResult(query, response);
    } else {
        response.success("Hello world!");
    }
}

var queryWithLocation = function (request, response) {
    var center = new AV.GeoPoint(request.params.location.latitude, request.params.location.longitude);
    var query = new AV.Query("Beacon");
    query.withinMiles('location', center, request.params.location.accuracy);
    createBeaconResult(query, response);
}

AV.Cloud.define("beacons", function (request, response) {
    if (typeof request.params.beacons != 'undefined') {
        queryWithBeacon(request, response);
    } else if (typeof request.params.location != 'undefined') {
        queryWithLocation(request, response);
    } else {
        response.error("no such service");
    }
});
