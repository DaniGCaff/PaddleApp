angular.module('appControllers')
    .controller('ReservaController', function($http, $location, $scope, AppAuth, $cookies, $routeParams) {
        $scope.AppAuth = AppAuth;
        $scope.seleccionado;
        $scope.operacion = $routeParams.operacion;
        $scope.reservaId = $routeParams.reservaId;
		$scope.reserva = {};

		if($scope.operacion == 'modify') {
			var config = {headers: {'X-Auth-Token': AppAuth.token}};
			$http.get('/reservas/' + $scope.reservaId, config)
			.then(function(court) {
				$scope.court = court.data;
				$("courtMaterial").val(String(court.material)).change();
				$("courtColor").val(court.color);
			}, function(warning) {

            });
		}

        $scope.create = function() {
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.post("/reservas", $scope.reserva, config)
                .then(function(resp) {
                    $location.path("/#/app/admin");
                }, function(warning) {
                    alert(warning.data);
                });
        }

        $scope.update = function() {
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.put("/reservas/" + seleccionado, $scope.reserva, config)
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
    .directive('crudeReservas', function($http, AppAuth) {
        return {
            restrict: 'E',
            templateUrl: '../../views/crudeReservas.html',
            controller: function ($scope, $http, AppAuth) {
                var config = {headers: {'X-Auth-Token': AppAuth.token}}

                $http.get("/reservas", config)
                    .then(function(resp) {
                        $scope.reservas = resp.data.reservas;
                    }, function(warning) {
                        $scope.reservas = [];
                    });
                $(".modifyBtn").filter(".reserva").addClass('disabled');
                $(".deleteBtn").filter(".reserva").addClass('disabled');
            },
            link: function ($scope, $elem, $attr) {
                $scope.$on('notify_selection', function(event, data) {
                    $(".modifyBtn").filter(".court").removeClass('disabled');
                    $(".deleteBtn").filter(".court").removeClass('disabled');
                });
            }
        }
    });
