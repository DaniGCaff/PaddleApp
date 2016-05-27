angular.module('appControllers')
	.factory('PaddleService', function() {
	
	this.players = [];
	this.courts = [];
	this.reserva = {};

	return this;
});

