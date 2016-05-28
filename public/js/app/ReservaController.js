angular.module('appControllers')
    .controller('ReservaController', function($http, $location, $scope, $rootScope, AppAuth, $cookies, $routeParams, PaddleService) {
        $scope.AppAuth = AppAuth;
        $scope.seleccionado;
        $scope.operacion = $routeParams.operacion;
        $scope.reservaId = $routeParams.reservaId;
        $scope.reserva = {};

        if(new Date().getMonth()+1 < 10)
            var mes = "0" + (new Date().getMonth()+1);

        if((new Date()).getHours() > 20) {
            $scope.reserva.franja = 8;
            $scope.reserva.fecha = new Date().getFullYear() + "-" + mes + "-" + new Date().getDate();
        } else if((new Date()).getHours() < 8) {
            $scope.reserva.franja = 8;
            $scope.reserva.fecha = new Date().getFullYear() + "-" + mes + "-" + new Date().getDate();
        } else {
            $scope.reserva.franja = new Date().getHours();
            $scope.reserva.fecha = new Date().getFullYear() + "-" + mes + "-" + new Date().getDate();
        }

        PaddleService.updateReserva($scope.reserva);

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
        };

        $scope.update = function() {
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.put("/reservas/" + $scope.seleccionado, $scope.reserva, config)
                .then(function(resp) {
                    $location.path("/#/app/admin");
                }, function(warning) {
                    alert(warning.data);
                });
        };

        $scope.delete = function() {
            var config = {headers: {'X-Auth-Token': AppAuth.token}};
            $http.delete("/reservas/" + $scope.seleccionado, config)
                .then(function(resp) {
                    window.history.back();
                }, function(warning) {
                    alert(warning.data);
                });
        };

        $scope.$watch('reserva.fecha', function(newValue, oldValue) {
            PaddleService.updateReserva($scope.reserva);
        });

        $scope.$watch('reserva.franja', function(newValue, oldValue) {
            PaddleService.updateReserva($scope.reserva);
        });

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
                    $(".modifyBtn").filter(".reserva").removeClass('disabled');
                    $(".deleteBtn").filter(".reserva").removeClass('disabled');
                });
            }
        }
    })
    .directive('crudeMisreservas', function($http, AppAuth) {
        return {
            restrict: 'E',
            templateUrl: '../../views/crudeReservas.html',
            controller: function ($scope, $http, AppAuth) {
                $(".createBtn").filter(".reserva").hide();
                $(".modifyBtn").filter(".reserva").hide();
                $(".deleteBtn").filter(".reserva").hide();
            },
            link: function($scope, $elem, $attr) {
                $scope.$on('token:asigned', function(event, data) {
                    var config = {headers: {'X-Auth-Token': AppAuth.token}}
                    $http.get("/reservas/user/"+AppAuth.id, config)
                        .then(function(resp) {
                            $scope.reservas = resp.data.reservas;
                        }, function(warning) {
                            $scope.reservas = [];
                        });
                });
            }
        }
    });
