angular.module('appControllers')
    .controller('PlayerController', function($http, $location, $scope, AppAuth, $cookies, $routeParams, PaddleService, Notificaciones) {
        $scope.PaddleService = PaddleService;
        $scope.players = [];
        $scope.newname = "";
        $scope.selectedPlayer = -1;
        $scope.idSig = 1;
        $scope.courtId = -1;
        $scope.position = -1;

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
            if($scope.players[$scope.selectedPlayer-1] != null) {
                var playerName = $scope.players[$scope.selectedPlayer-1].name;
                $scope.players[$scope.selectedPlayer - 1].estado = 1;
                PaddleService.allocatePlayer($scope.selectedPlayer, playerName, $scope.courtId, $scope.position);
            }
        };

        $scope.sendHomePlayer = function(playerId) {
            $scope.players[playerId - 1].estado = 0;
            PaddleService.sendHomePlayer(playerId);
        };

        $scope.removePlayer = function(playerId) {
            if($scope.players[playerId - 1] != null) {
                if($scope.players[playerId - 1].estado != 0) {
                    $scope.sendHomePlayer(playerId);
                }
                $scope.players.splice(playerId-1, 1);
                notificarAccion("Player removed!");
            }
        };

        $scope.$on('reserva:init', function(data) {
            for(var i = 0; i < $scope.players.length; i++) {
                $scope.players[i].estado = 0;
            }
        });

        $scope.$on('reserva:saved', function(data) {
           $cookies.putObject("players", $scope.players);
            notificarAccion("Datos salvados!");
        });

    })
    .directive('listaPlayers', function() {
        return {
            restrict: 'E',
            templateUrl: '../../views/listaPlayers.html'
        }
    });
