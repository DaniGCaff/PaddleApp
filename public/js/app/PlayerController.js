angular.module('appControllers')
    .controller('PlayerController', function($http, $location, $scope, AppAuth, $cookies, $routeParams, PaddleService, Notificaciones) {
        $scope.PaddleService = PaddleService;
        $scope.players = [];
        $scope.newname = "";
        $scope.selectedPlayer = -1;
        $scope.idSig = 1;

        $scope.selectPlayer = function(playerid) {
            $scope.selectedPlayer = playerid;
        }

        $scope.addPlayer = function () {
            if ($scope.newPlayerName.length > 0) {
                if ($("#panel-bienvenida").is(":visible")) {
                    $("#panel-bienvenida").fadeOut(200);
                }
                $scope.players.push({id: $scope.idSig, name: $scope.newPlayerName, estado: 0});
                $scope.newPlayerName = '';
                $scope.idSig++;
                notificarAccion("Player added!");
            }
        };

        $scope.renombrarPlayer = function () {
            if ($scope.players[parseInt($scope.selectedPlayer) - 1] != null) {
                $scope.players[parseInt($scope.selectedPlayer) - 1].name = $scope.newname;
                notificarAccion("Player renamed!");
            }
        };

        $scope.allocatePlayer = function() {
            var courtId = $("#allocate-courtid").val();
            var position = $("#allocate-incourtpos").val();
            var playerId = $("#playerid").val();
            if($scope.players[playerId-1] != null) {
                var playerName = $scope.players[playerId-1].name;
                if($scope.courts[courtId - 1] != null) {
                    if($scope.courts[courtId - 1].players[position - 1] != null ) {
                        if($scope.courts[courtId - 1].players[position - 1].id == 0) {
                            $scope.courts[courtId - 1].players[position - 1].name = playerName;
                            $scope.courts[courtId - 1].players[position - 1].id = playerId;
                            $scope.courts[courtId - 1].countPlayers++;
                            $scope.players[playerId - 1].estado = 1;
                            notificarAccion("Player allocated in court!");

                            if($scope.courts[courtId - 1].countPlayers == 4) {
                                $scope.courts[courtId - 1].statusColor = {color: "red"};
                            } else if($scope.courts[courtId - 1].countPlayers < 4 && $scope.courts[courtId - 1].countPlayers > 1) {
                                $scope.courts[courtId - 1].statusColor = {color: "orange"};
                            } else {
                                $scope.courts[courtId - 1].statusColor = {color: "green"};
                            }
                        }
                    }
                }
            }
        }

        $scope.sendHomePlayer = function(playerId) {
            for(court in $scope.courts) {
                for(player in $scope.courts[court].players) {
                    if($scope.courts[court].players[player].id == playerId) {
                        $scope.courts[court].players[player].id = 0;
                        $scope.courts[court].players[player].name = '';
                        $scope.courts[courtId - 1].countPlayers--;
                        $scope.players[playerId - 1].estado = 0;
                        notificarAccion("Player sent out of court!");
                        break;
                    }
                }
            }
        }

        $scope.removePlayer = function(playerId) {
            if($scope.players[playerId - 1] != null) {
                if($scope.players[playerId - 1].estado != 0) {
                    $scope.sendHomePlayer(playerId);
                }
                $scope.players.splice(playerId-1, 1);
                notificarAccion("Player removed!");
            }
        }

    })
    .directive('listaPlayers', function() {
        return {
            restrict: 'E',
            templateUrl: '../../views/listaPlayers.html',
            controller: function($scope, $http, AppAuth, PaddleService) {

            }
        }
    });
