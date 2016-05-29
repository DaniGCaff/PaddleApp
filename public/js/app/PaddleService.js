angular.module('appControllers')
	.factory('PaddleService', ['$rootScope', '$cookies', '$http', '$location', 'AppAuth', function($rootScope, $cookies, $http, $location, AppAuth) {

    var service = {};
        
	service.courts = [];
    service.reserva = {};
    service.stringQuery = "";    
        
    service.existenDatos = ($cookies.getObject('reserva') != null);
        
    service.allocatePlayer = function(playerId, playerName, courtId, position) {
        if(service.courts[courtId - 1] != null) {
            if(service.courts[courtId - 1].players[position - 1] != null ) {
                if(service.courts[courtId - 1].players[position - 1].id == 0) {
                    service.courts[courtId - 1].players[position - 1].name = playerName;
                    service.courts[courtId - 1].players[position - 1].id = playerId;
                    service.courts[courtId - 1].countPlayers++;
                    notificarAccion("Player allocated in court!");

                    if(service.courts[courtId - 1].countPlayers == 4) {
                        service.courts[courtId - 1].statusColor = {color: "red"};
                    } else if(service.courts[courtId - 1].countPlayers < 4 && service.courts[courtId - 1].countPlayers > 1) {
                        service.courts[courtId - 1].statusColor = {color: "orange"};
                    } else {
                        service.courts[courtId - 1].statusColor = {color: "green"};
                    }
                }
            }
        }
        $rootScope.$broadcast("courts:updated", service.courts);
    };
        
    service.sendHomePlayer = function(playerId) {
        for(var court in service.courts) {
            for(var player in service.courts[court].players) {
                if(service.courts[court].players[player].id == playerId) {
                    service.courts[court].players[player].id = 0;
                    service.courts[court].players[player].name = '';
                    service.courts[courtId - 1].countPlayers--;
                    notificarAccion("Player sent out of court!");
                    $rootScope.$broadcast("courts:updated", service.courts);
                    break;
                }
            }
        }
    };    

    service.reloadReserva = function (data, dataCourts) {
        service.reserva = data;
        service.courts = dataCourts;
        $rootScope.$broadcast("reserva:updated", data);
    };

    service.reservaInit = function() {
        $rootScope.$broadcast("reserva:init", service.courts);
    };

    service.guardarDatos = function() {
        $cookies.putObject('reserva', service.reserva);
        $cookies.putObject('courts', service.courts);
        $rootScope.$broadcast("reserva:saved", service.reserva);
    };
        
    service.cargarDatos = function() {
        if($cookies.getObject('reserva') == null || $cookies.getObject('courts')) return;
        
        service.reserva = $cookies.getObject('reserva');
        service.courts = $cookies.getObject('courts');
        $cookies.remove('reserva');
        $cookies.remove('courts');
        service.reloadReserva(service.reserva, service.courts);
        $rootScope.$broadcast('reserva:loaded', service.reserva);
    };

    service.confirmarDatos = function() {
        var reservasValidas = [];
        for(var i = 0; i < service.courts.length; i++) {
            debugger;
            if(service.courts[i].countPlayers == 4) {
                var reservaValida = {};
                reservaValida.userId = service.reserva.userId;
                reservaValida.fecha = service.reserva.fecha;
                reservaValida.franja = service.reserva.franja;
                reservaValida.courtId = service.courts[i].id;
                var serializedPlayers = "";
                debugger;
                for(var j = 0; j < 4; j ++) {
                    if(j == 0)
                        serializedPlayers = String(service.courts[i].players[j].name);
                    else
                        serializedPlayers += "," + String(service.courts[i].players[j].name);
                }
                reservaValida.jugadores = serializedPlayers;
                reservasValidas.push(reservaValida);
            }
        }

        if(reservasValidas.length > 0) {
            for(var i = 0; i < reservasValidas.length; i++) {
                var config = {headers: {'X-Auth-Token': AppAuth.token}}
                $http.post('/reservas', reservasValidas, config). then(function(data) {
                    $location.path("/#/app/home");
                }, function (warning) {
                    alert(warning.data);
                });
            }
        } else {
            alert("No hay reservas completas que confirmar.");
        }
    }

	return service;
}]);

