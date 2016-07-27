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
        getInitialResponse($scope, $http, "");
    }, function error(response) {

    });
}

angular.module('CARD', ['ngPostMessage'])
    .controller('ResponseController', function ($scope, $http) {
        $scope.hideTable = false;
        $scope.results = [];
        $scope.pagedItems = [];
        $scope.numberOfPages = 0;
        $scope.currentPage = 0;
        $scope.itemsPerPage = 0;
        $scope.total = 0;
        $scope.gap = 5;
        $scope.query="";

        $scope.columns = [
            {
                title: "Date"
            },
            {
                title: "Filename"
            },
            {
                title: "URL"
            }
        ]
        ;

        $scope.$root.$on('$messageIncoming', function (event, data) {
            var filter = "card_" + data.name + ":" + data.value;
            document.getElementById("response").innerHTML = filter;
            $scope.query = filter;
            getInitialResponse($scope, $http, filter);
        });
        angular.element(document).ready(function () {
            getAuthCode($scope, $http);
        });

        $scope.range = function (size, start, end) {
            var ret = [];
            console.log(size, start, end);

            if (size < end) {
                end = size;
                start = size - $scope.gap;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            console.log(ret);
            return ret;
        };

        $scope.prevPage = function () {
            if ($scope.currentPage > 0) {
                if(checkIfDataExists($scope,$scope.currentPage-1)) $scope.currentPage--;
                else getRegularResponse($scope,$http,$scope.query, $scope.currentPage-1);
            }
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.numberOfPages-1) {
                if(checkIfDataExists($scope,$scope.currentPage+1)) $scope.currentPage++;
                else getRegularResponse($scope,$http,$scope.query, $scope.currentPage+1);
            }
        };

        $scope.setPage = function () {
            if(checkIfDataExists($scope,this.n)) $scope.currentPage = this.n;
            else getRegularResponse($scope,$http,$scope.query, this.n);
        };
    });

function getInitialResponse($scope, $http, query) {
    var url = "http://10.76.35.197/node/query";
    if (query === null) query = "";

    $scope.results = "";

    var resultsReq = {
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function (obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {authCode: authToken, queryString: query}
    };

    $http(resultsReq).then(function success(response) {
        $scope.hideTable = true;
        $scope.results = response.data.results;
        var res = response.data.results;
        $scope.total = response.data.hitCount;
        $scope.itemsPerPage = response.data.offset;
        console.log("Per page: "+$scope.itemsPerPage);
        console.log("Total: "+$scope.total);
        $scope.pagedItems[0] = res;
        // myFunction(JSON.stringify(response));
        setPagingLength($scope);
    }, function error(response) {
    });
}

function getRegularResponse($scope, $http, query, pageNumber) {
    var url = "http://10.76.35.197/node/query";
    if (query === null) query = "";

    var resultsReq = {
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function (obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {authCode: authToken, queryString: query, pageNo: pageNumber}
    };

    $http(resultsReq).then(function success(response) {
        $scope.hideTable = true;
        // $scope.results = response.data.results;
        var res = response.data.results;
        // $scope.total = response.data.hitCount;
        // $scope.itemsPerPage = response.data.offset;
        console.log("Per page: "+$scope.itemsPerPage);
        console.log("Total: "+$scope.total);
        $scope.pagedItems[pageNumber] = res;
        $scope.currentPage = pageNumber;
        // setPagingLength($scope);
    }, function error(response) {
    });
}

function setPagingLength($scope){
    $scope.numberOfPages = Math.ceil($scope.total/$scope.itemsPerPage);
    console.log("Number Of Pages: "+$scope.numberOfPages);
}

function checkIfDataExists($scope, page){
    console.log("Selected page: "+ page +" Existing data: "+$scope.pagedItems[page]);
    if($scope.pagedItems[page]===undefined) {
        console.log("Doesn't Exist")
        return false;
    }
    else {
        console.log("Exist")
        return true;
    }
}