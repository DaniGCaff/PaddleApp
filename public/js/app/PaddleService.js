angular.module('appControllers')
	.factory('PaddleService', ['$rootScope', function($rootScope) {

    var service = {};
        
	service.courts = [];
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
    }    

	service.reserva = {};
    service.updateReserva = function (data) {
        service.reserva = data;
        $rootScope.$broadcast("reserva:updated", data);
    };

    service.reservaInit = function() {
        $rootScope.$broadcast("reserva:init", service.courts);
    };

	return service;
}]);

