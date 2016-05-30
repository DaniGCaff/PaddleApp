angular.module('appControllers')
    .controller('ReservaController', function($http, $location, $scope, $rootScope, AppAuth, $cookies, $routeParams, PaddleService) {
        $scope.AppAuth = AppAuth;
        $scope.seleccionado;
        $scope.operacion = $routeParams.operacion;
        $scope.reservaId = $routeParams.reservaId;
        $scope.reserva = {};

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

        $scope.$on('selected_event', function(event, data) {
            $scope.$broadcast('notify_selection', 1);
        });
    })
    .directive('crudeReservas', function($http, AppAuth) {
        return {
            restrict: 'E',
            templateUrl: '../../views/crudeReservas',
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
            templateUrl: '../../views/crudeReservas',
            controller: function ($scope, $http, AppAuth) {
                $(".createBtn").filter(".reserva").hide();
                $(".modifyBtn").filter(".reserva").hide();
                $(".deleteBtn").filter(".reserva").hide();

                $scope.cargarMisReservas = function() {
                    var config = {headers: {'X-Auth-Token': AppAuth.token}}
                    $http.get("/reservas/user/"+AppAuth.id, config)
                        .then(function(resp) {
                            $scope.reservas = resp.data.reservas;
                        }, function(warning) {
                            $scope.reservas = [];
                        });
                }
            },
            link: function($scope, $elem, $attr) {
                $scope.$on('token:asigned', function(event, data) {
                    $scope.cargarMisReservas();
                });

                if(AppAuth.id != null && AppAuth.status==true) {
                    $scope.cargarMisReservas();
                }
            }
        }
    })
    .directive('toolbarReserva', function() {
        return {
            restrict: 'E',
            templateUrl: '../../views/toolbarReserva',
            scope: {operacionIndicada : '=', reservaId : '='},
            controller: function($scope, $http, AppAuth, PaddleService) {
                $scope.primeraVez = 2;
                $scope.reserva = {};

                $scope.createNewReserva = function () {
                    PaddleService.stringQuery = "/create";
                    $scope.reserva.userId = AppAuth.id;
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
                    $scope.courts = null;
                    $scope.reloadReserva();
                };

                $scope.modifyReserva = function() {
                    PaddleService.stringQuery = "/modify/" + $scope.reservaId;
                    var config = {headers: {'X-Auth-Token': AppAuth.token}};
                    $http.get('/reservas/' + $scope.reservaId, config)
                        .then(function(reserva) {
                            $scope.reserva = reserva.data;
                            $scope.reserva.players = reserva.data.jugadores.split(',');
                            $scope.courts = null;
                            $scope.reloadReserva();
                        }, function(warning) {
                            alert(warning.data);
                        });
                }

                $scope.updateReserva = function() {
                    if($scope.primeraVez <= 0) {
                        $scope.courts = null;
                        $scope.reloadReserva();
                    }
                }

                $scope.reloadReserva = function() {
                    $('.btn').attr("disabled","disabled");
                    $('input').attr("disabled","disabled");
                    PaddleService.reloadReserva($scope.reserva, $scope.courts);
                    $scope.primeraVez--;
                };

                $scope.guardarDatos = function() {
                    PaddleService.guardarDatos();
                };

                $scope.cargarDatos = function() {
                    PaddleService.cargarDatos();
                };

                $scope.confirmarDatos = function() {
                    PaddleService.confirmarDatos();
                };

                $scope.digestDatos = function() {
                    $scope.reserva = PaddleService.reserva;
                }

            },
            link: function(scope, $elem, $attr) {

                scope.$watchGroup(['reserva.franja', 'reserva.fecha'], function(newValues, oldValues, scope) {
                    if(scope.primeraVez == 1) {
                        scope.primeraVez--;
                        return;
                    }

                    if(scope.operacionIndicada == 'modify' && scope.primeraVez == 2) {
                        scope.modifyReserva();
                    } else if(scope.operacionIndicada == 'create' && scope.primeraVez == 2) {
                        scope.createNewReserva();
                    } else if(scope.primeraVez <= 0) {
                        scope.updateReserva();
                    }
                });

                scope.$on('reserva:init', function(evento, data) {
                    $('.btn').removeAttr("disabled");
                    $('input').removeAttr("disabled");
                });

                scope.$on('reserva:loaded', function(evento, data) {
                    scope.digestDatos();
                });
            }
        }
    });
