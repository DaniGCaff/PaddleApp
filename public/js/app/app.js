var paddleApp = angular.module('paddleApp', ['ngRoute', 'appControllers', 'ngCookies']);

paddleApp.config(['$routeProvider', '$httpProvider',
  function($routeProvider, $httpProvider) {
    $routeProvider.
	  when('/app/reservas/:operacion\/:reservaId?', {
	      templateUrl: 'views/reserva.html',
	      controller: 'ReservaController'
	  }).
	  when('/app/courts/:operacion\/:courtId?', {
	      templateUrl: 'views/pista.html',
	      controller: 'CourtController'
	  }).
	  when('/app/users/login', {
	      templateUrl: 'views/login.html',
	      controller: 'UserController'
	  }).
	  when('/app/users/:operacion\/:userId?', {
	      templateUrl: 'views/user.html',
	      controller: 'UserController'
	  }).
	  when('/app/admin', {
	      templateUrl: 'views/admin.html',
	      controller: 'SessionController'
	  }).
	  when('/app/home', {
	      templateUrl: 'views/home.html',
	      controller: 'SessionController'
	  }).
	  when('/', {
	      templateUrl: 'views/home.html',
	      controller: 'SessionController'
	  }).
      otherwise({
          redirectTo: '/app/home'
      });
    
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }
]);

paddleApp.factory('AppAuth', function() {
	var authenticated = {status: false, username: "", roles: [], token: ""};
	
	return authenticated;
});

paddleApp.factory('Notificaciones', function() {
	notificarAccion = function (accion) {
		var $toastContent = $('<span>'+accion+'</span>');
		Materialize.toast($toastContent, 1000);
	}

	return this;
})

paddleApp.controller('SessionController', function($scope, AppAuth, $cookies, $location, $http) {
	$scope.AppAuth = AppAuth;
	
	$scope.logout = function() {
		AppAuth.status = false;
		$cookies.putObject("AppAuth", AppAuth);
		$location.path("#/app/home");
	};
	
	if(AppAuth.status == true) {
		var config = {headers: {'X-Auth-Token': AppAuth.token}}
		$http.get("/users/me", config).then(function(resp) {
			AppAuth.id = resp.data.id;
			AppAuth.username = resp.data.username;
			AppAuth.roles = resp.data.roles;
			$cookies.putObject("AppAuth", AppAuth);
		}, function() {
			AppAuth.status = false;
		});
	} else {
		if($cookies.getObject("AppAuth") != null) {
			var galleta = $cookies.getObject("AppAuth");
			AppAuth.username = galleta.username;
			AppAuth.roles = galleta.roles;
			AppAuth.token = galleta.token;
			AppAuth.status = galleta.status;
		}
	}
}); 

angular.module('appControllers', ['ngCookies']);

angular.module('appControllers')
	.directive('ordenable', function($http, AppAuth) {
		return {
			restrict: 'A',
			controller: function ($scope) {
				$scope.predicate = 'id';
				$scope.rever = false;
				$scope.order = function(field) {
					$scope.predicate = field;
				}
				$scope.reverse = function() {
					$scope.rever = $scope.rever ? false : true;
				}
			}
		}
	})
	.directive('seleccionableTr', function($http, AppAuth) {
		return {
			restrict: 'A',
			link: function ($scope, $elem, $attr) {
				$elem.on('click', function() {
					$scope.$parent.seleccionado = $elem.context.id;
					$elem.siblings('tr').removeClass('active');
					$elem.addClass('active');
					$scope.$parent.$emit('selected_event', $elem.context.id);
					$scope.$apply();
				})
			}
		}
	});