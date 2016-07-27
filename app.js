var authToken = "";

var authReq = {
    method: 'GET',
    url: 'http://10.76.35.197/node/auth'
};


function getAuthCode($scope, $http) {
    console.log("Auth called");
    $scope.authToken = "Loading";
    $http(authReq).then(function success(response) {
        authToken = response.data.access_token;
        $scope.authToken = response.data.access_token;
        getResponse($scope, $http, "");
    }, function error(response) {

    });
}

angular.module('CARD', ['ngPostMessage'])
    .controller('ResponseController', function ($scope, $http) {
        $scope.hideTable = false;
        $scope.results = [];

        $scope.columns = [
            {
                title:"Date"
            },
            {
                title:"Filename"
            },
            {
                title:"URL"
            }
        ]
        ;

        $scope.$root.$on('$messageIncoming', function (event, data) {
            var filter = "card_" + data.name + ":" + data.value;
            document.getElementById("response").innerHTML = filter;
            getResponse($scope, $http, filter);
        });
        angular.element(document).ready(function () {
            getAuthCode($scope, $http);
        });
    });

function getResponse($scope, $http, query) {
    var url = "http://10.76.35.197/node/query";
    if (query === null) query = "";

    $scope.results="";

    var resultsReq = {
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {authCode: authToken, queryString: query}
    };

    $http(resultsReq).then(function success(response) {
        $scope.hideTable = true;
        $scope.results=response.data.results;
        // myFunction(JSON.stringify(response));
    }, function error(response) {
    });
}

function myFunction(responseJSON) {
    document.getElementById("response").innerHTML = responseJSON;
}
