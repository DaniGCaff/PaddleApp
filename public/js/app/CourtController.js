angular.module('appControllers')
    .controller('CourtController', function($http, $location, $scope, AppAuth, $cookies, $routeParams, PaddleService) {
        $scope.AppAuth = AppAuth;
        $scope.seleccionado;
        $scope.operacion = $routeParams.operacion;
        $scope.courtId = $routeParams.courtId;
		$scope.court = {};
        $scope.callback = function() {};

        $scope.injectCallback = function(callback) {
            $scope.callback = callback;
            if ($scope.operacion == 'modify') {
                $scope.modifyView();
            } else {
                $scope.callback();
            }
        }
        
        $scope.modifyView = function() {
            if($scope.operacion === 'modify') {
                var config = {headers: {'X-Auth-Token': AppAuth.token}};
                $http.get('/courts/' + $scope.courtId, config)
                    .then(function(court) {
                        $scope.court = court.data;
                        $scope.court.color = $scope.court.color.toLowerCase();
                        $scope.callback();
                    }, function() {

                    });
            }
        };

        $scope.create = function() {
            var data = {material:$("#courtMaterial").val(), color:$("#courtColor").val()};
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.post("/courts", data, config)
                .then(function(resp) {
                    $location.path("/app/admin");
                }, function(warning) {
                    alert(warning.data);
                    $scope.callback();
                });
        };

        $scope.update = function() {
            var data = {material:$("#courtMaterial").val(), color:$("#courtColor").val()};
            var config = {headers: {'X-Auth-Token': AppAuth.token}}
            $http.put("/courts/" + $scope.courtId, data, config)
                .then(function(resp) {
                    $location.path("/app/admin");
                }, function(warning) {
                    alert(warning.data);
                    $scope.callback();
                });
        };

        $scope.delete = function() {
            var config = {headers: {'X-Auth-Token': AppAuth.token}};
            $http.delete("/courts/" + $scope.courtId, config)
                .then(function(resp) {
                    $location.path("/app/admin");
                }, function(warning) {
                    alert(warning.data);
                    $scope.callback();
                });
        };

        $scope.$on('selected_event', function(event, data) {
            $scope.$broadcast('notify_selection', 1);
        });

        $scope.$watch('court', function(newValue, oldValue) {
            if($scope.court.material != null && $scope.court.color != null) {
                $scope.materialAnterior = $scope.court.material.toLowerCase();
                $scope.colorAnterior = $scope.court.color.toLowerCase();
            }
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
        controller: function($scope, $http, AppAuth, PaddleService, $rootScope) {
            $scope.getCourts = function(courtsInit) {
                var config = {headers: {'X-Auth-Token': AppAuth.token}}
                debugger;
                $http.get("/courts/fecha/" + PaddleService.reserva.fecha + "/franja/" + PaddleService.reserva.franja + "" + PaddleService.stringQuery, config)
                    .then(function (resp) {
                        $scope.courts = resp.data.courts;
                        for(var i = 0; i < $scope.courts.length; i++) {
                            $scope.courts[i].color = $scope.courts[i].color.toLowerCase();
                            $scope.courts[i].players = new Array(4);
                            $scope.courts[i].countPlayers = 0;
                            $scope.courts[i].statusColor = {color: "green"};
                            for(var j = 0; j < 4; j++) {
                                $scope.courts[i].players[j] = new Object();
                                $scope.courts[i].players[j].name = '';
                                $scope.courts[i].players[j].id = 0;
                            }
                        }
                        if(courtsInit != null)
                            courtsInit($scope.courts);
                        PaddleService.courts = $scope.courts;
                        PaddleService.reservaInit();
                    }, function (warning) {
                        $scope.courts = [];
                    });
            }

            $scope.loadCourts = function () {
                if(PaddleService.courts == null) { // O sea cuando queremos crear.... o modificamos la reserva existente.
                    $scope.courts = null;
                    $scope.getCourts();
                } else if(PaddleService.courts.length == 0) { // O sea cuando cargamos una reserva que ya tiene jugadores posicionados
                    $scope.courts = null;
                    $scope.getCourts(function(courts) {
                        var courtsAux = [];
                        var playersAux = [];
                        var config = {headers: {'X-Auth-Token': AppAuth.token}}
                        $http.get('/courts/' + PaddleService.reserva.courtId, config).then(function(loadedCourt) {
                            loadedCourt.data.color = loadedCourt.data.color.toLowerCase();
                            loadedCourt.data.players = new Array(4);
                            loadedCourt.data.countPlayers = 0;
                            loadedCourt.data.statusColor = {color: "green"};
                            for(var j = 0; j < 4; j++) {
                                loadedCourt.data.players[j] = new Object();
                                loadedCourt.data.players[j].name = PaddleService.reserva.players[j];
                                loadedCourt.data.players[j].id = j+1;
                                playersAux.push(loadedCourt.data.players[j]);
                                playersAux[j].estado = 1;
                            }
                            courtsAux.push(loadedCourt.data);
                            for(var i = 0; i < courts.length; i++) {
                                courtsAux.push(courts[i]);
                            }
                            $scope.courts = courtsAux;
                            $rootScope.$broadcast("players:loaded", playersAux);
                        });
                    });
                }
            };
        },
        link: function(scope, $elem, $attr) {

            scope.$on('reserva:updated', function(event, data) {
                scope.loadCourts();
            });
            scope.$on('courts:updated', function(event, data) {
                scope.courts = data;
            })
        }
    }});
