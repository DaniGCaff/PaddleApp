angular.module('appControllers')
    .controller('CourtController', function($http, $location, $scope, AppAuth, $cookies, $routeParams) {
        $scope.AppAuth = AppAuth;
        $scope.seleccionado;
        $scope.operacion = $routeParams.operacion;
        $scope.courtId = $routeParams.courtId;
		$scope.court = {};

		if($scope.operacion == 'modify') {
			var config = {headers: {'X-Auth-Token': AppAuth.token}};
			$http.get('/courts/' + $scope.courtId, config)
			.then(function(court) {
				$scope.court = court.data;
				$("courtMaterial").val(String(court.material)).change();
				$("courtColor").val(court.color);
			}, function() {});
		}

        $scope.create = function() {
            var data = {material:$("#courtMaterial").val(), color:$("#courtColor").val()};
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.post("/courts", data, config)
                .then(function(resp) {
                    $location.path("/#/app/admin");
                }, function(warning) {
                    alert(warning.data);
                });
        }

        $scope.update = function() {
            var data = {material:$("#courtMaterial").val(), color:$("#courtColor").val()};
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.put("/courts/" + seleccionado, data, config)
                .then(function(resp) {
                    $location.path("/#/app/admin");
                }, function(warning) {
                    alert(warning.data);
                });
        }

        $scope.$on('selected_event', function(event, data) {
            $scope.$broadcast('notify_selection', 1);
        });
    })
    .directive('crudePistas', function($http, AppAuth) {
    return {
        restrict: 'E',
        templateUrl: '../../views/crudePistas.html',
        controller: function ($scope, $http, AppAuth) {
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
			
            $http.get("/courts", config)
                .then(function(resp) {
                    $scope.courts = resp.data.courts;
                }, function(warning) {
                    $scope.courts = [];
                    //alert(warning.data);
                });
            $(".modifyBtn").filter(".court").addClass('disabled');
            $(".deleteBtn").filter(".court").addClass('disabled');
        },
        link: function ($scope, $elem, $attr) {
            $scope.$on('notify_selection', function(event, data) {
                $(".modifyBtn").filter(".court").removeClass('disabled');
                $(".deleteBtn").filter(".court").removeClass('disabled');
            });
        }
    }})
    .directive('listaPistas', function() {
    return {
        restrict: 'E',
        templateUrl: '../../views/listaPistas.html',
        controller: function($scope, $http, AppAuth, PaddleService) {
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.get("/courts", config)
            .then(function(resp) {
                $scope.courts = resp.data.courts;
                for(var i = 0; i < $scope.courts.length; i++) {
                    $scope.courts[i].players = new Array(4);
                    $scope.courts[i].countPlayers = 0;
                    $scope.courts[i].statusColor = {color: "green"};
                    for(var j = 0; j < 4; j++) {
                        $scope.courts[i].players[j] = new Object();
                        $scope.courts[i].players[j].name = '';
                        $scope.courts[i].players[j].id = 0;
                    }
                }
                PaddleService.courts = $scope.courts;
            }, function(warning) {
                $scope.courts = [];
            });
        }
    }});
