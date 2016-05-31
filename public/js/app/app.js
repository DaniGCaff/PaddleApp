var paddleApp = angular.module('paddleApp', ['ngRoute', 'appControllers', 'ngCookies']);

paddleApp.config(['$routeProvider', '$httpProvider',
  function($routeProvider, $httpProvider) {
    $routeProvider.
	  when('/app/reservas/:operacion\/:reservaId?', {
	      templateUrl: 'views/reserva',
	      controller: 'ReservaController'
	  }).
	  when('/app/courts/:operacion\/:courtId?', {
	      templateUrl: 'views/pista',
	      controller: 'CourtController'
	  }).
	  when('/app/users/login/:modo?', {
	      templateUrl: 'views/login',
	      controller: 'UserController'
	  }).
	  when('/app/users/:operacion\/:userId?', {
	      templateUrl: 'views/user',
	      controller: 'UserController'
	  }).
	  when('/app/admin', {
	      templateUrl: 'views/admin',
	      controller: 'SessionController'
	  }).
	  when('/app/home', {
	      templateUrl: 'views/home',
	      controller: 'SessionController'
	  }).
	  when('/', {
	      templateUrl: 'views/home',
	      controller: 'SessionController'
	  }).
      otherwise({
          redirectTo: '/app/home'
      });
    
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
	//$httpProvider.defaults.cache = true;
  }
]);

paddleApp.factory('AppAuth', function($rootScope, $http, $cookies) {
	var authenticated = {status: false, username: "", roles: [], token: ""};

	authenticated.tokenAsigned = function() {
		$rootScope.$broadcast('token:asigned', authenticated.token);
	};
	
	authenticated.cargarDatos = function(callback) {
		var config = {headers: {'X-Auth-Token': authenticated.token}}
		$http.get("/users/me", config).then(function(resp) {
			authenticated.status = true;
			authenticated.id = resp.data.id;
			authenticated.username = resp.data.username;
			authenticated.roles = resp.data.roles;
			$cookies.putObject("AppAuth", authenticated);
			authenticated.tokenAsigned();
			if(callback != null)
				callback();
		}, function() {
			authenticated.status = false;
			$cookies.putObject("AppAuth", authenticated);
			authenticated.tokenAsigned();
			if(callback != null)
				callback();
		});
	}

	return authenticated;
});

paddleApp.factory('Notificaciones', function() {
	notificarAccion = function (accion) {
		var $toastContent = $('<span>'+accion+'</span>');
		Materialize.toast($toastContent, 1000);
	};

	return this;
})

paddleApp.controller('SessionController', function($scope, AppAuth, $cookies, $location, $http) {
	$scope.AppAuth = AppAuth;
	
	$scope.logout = function() {
		$.get("/users/logout", function() {
			AppAuth.status = false;
			$cookies.putObject("AppAuth", AppAuth);
			$location.path("#/app/home");
		});
	};

	if(AppAuth.status == true) {
		AppAuth.cargarDatos();
	} else {
		if($cookies.getObject("AppAuth") != null) {
			var galleta = $cookies.getObject("AppAuth");
			AppAuth.id = galleta.id;
			AppAuth.username = galleta.username;
			AppAuth.roles = galleta.roles;
			AppAuth.token = galleta.token;
			AppAuth.status = galleta.status;
			$cookies.putObject("AppAuth", AppAuth);
			AppAuth.tokenAsigned();
		}
	}
});

angular.module('appControllers', ['ngCookies']);

angular.module('appControllers')
	.directive('ordenable', function() {
		return {
			restrict: 'A',
			controller: function ($scope) {
				$scope.predicate = 'id';
				$scope.rever = true;
				$scope.order = function(field) {
					$scope.predicate = field;
				}
				$scope.reverse = function() {
					$scope.rever = $scope.rever ? false : true;
				}
			}
		}
	})
	.directive('seleccionableTr', function() {
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
	})
	.directive('commonView', function() {
		return {
			scope: { modifyFunction: '&'},
			controller: function($scope) {
				$scope.returnedControl = function() {
					$(".btn").removeAttr("disabled");
				};
			},
			link: function(scope, element, attrs) {
				$(".btn").attr("disabled","disabled");
				scope.modifyFunction({callback: scope.returnedControl});

				$(".btn").on('click', function() {
					$(".btn").attr("disabled","disabled");
				});
			}
		}
	});