angular.module('appControllers')
.controller('UserController', function($http, $location, $scope, AppAuth, $cookies, $routeParams) {
	$scope.AppAuth = AppAuth;
	$scope.seleccionado;
	$scope.operacion = $routeParams.operacion;
	$scope.userId = $routeParams.userId;
	$scope.user = {};
	$scope.callback = function() {};

	$scope.injectCallback = function(callback) {
		$scope.callback = callback;
		if ($scope.operacion == 'modify') {
			$scope.modifyView(callback);
		} else {
			$scope.callback();
		}
	}

	$scope.modifyView = function(callback) {
		this.callback = callback;
		if ($scope.operacion == 'modify') {
			var config = {headers: {'X-Auth-Token': AppAuth.token}};
			$http.get('/users/' + $scope.userId, config)
				.then(function (user) {
					$scope.user = user.data;
					if($scope.user.enabled === 'true') $scope.user.enabled = true;
					else $scope.user.enabled = false;

					if($scope.user.roles.indexOf('ROLE_ADMIN') > 0) $scope.user.admin = true;
					else $scope.user.admin = false;
					$scope.callback();
				}, function () {
				});
		}
	}
	
    $scope.login = function() {
    	$http.post("/users/login", {"username":$("#login-username").val(),"password":$("#login-password").val()})
    	.then(function (resp) {
			AppAuth.token = resp.data;
			AppAuth.cargarDatos(function() {
				$location.path("/app/home");
			});
    	}, function (resp) {
			alert(resp.data);
			$scope.callback();
    	});
    }
	
	$scope.create = function() {
		var config = {headers: {'X-Auth-Token': AppAuth.token}};
		$scope.user.roles = ['ROLE_USER'];
    	$http.post("/users", $scope.user, config)
    	.then(function(resp) {
			window.history.back();
    	}, function(warning) {
    		alert(warning.data);
			$scope.callback();
    	});
    }
	
	$scope.update = function() {
		if($scope.enabled) $scope.enabled = 1;
		else $scope.enabled = 0;

		if($scope.admin) $scope.roles = ['ROLE_ADMIN', 'ROLE_USER'];
		else $scope.roles = ['ROLE_USER'];

		var config = {headers: {'X-Auth-Token': AppAuth.token}};
		$http.put("/users/" + $scope.userId, $scope.user, config)
    	.then(function(resp) {
			window.history.back();
    	}, function(warning) {
    		alert(warning.data);
			$scope.callback();
    	});
	}

	$scope.delete = function() {
		var config = {headers: {'X-Auth-Token': AppAuth.token}};
		$http.delete("/users/" + $scope.userId, config)
			.then(function(resp) {
				window.history.back();
			}, function(warning) {
				alert(warning.data);
				$scope.callback();
			});
	}
	
	$scope.$on('selected_event', function(event, data) {
		$scope.$broadcast('notify_selection', 1);
	});
})
.directive('crudeUsuarios', function($http, AppAuth) {
    return {
		restrict: 'E',
		templateUrl: '../../views/crudeUsuarios',
		controller: function ($scope, $http, AppAuth) {
			var config = {headers: {'X-Auth-Token': AppAuth.token}}
			$http.get("/users", config)
			.then(function(resp) {
				$scope.users = resp.data.users;
			}, function(warning) {
				$scope.users = [];
			});
			$(".modifyBtn").filter(".user").addClass('disabled');
			$(".deleteBtn").filter(".user").addClass('disabled');
		},
		link: function ($scope, $elem, $attr) {
			$scope.$on('notify_selection', function(event, data) {
				$(".modifyBtn").filter(".user").removeClass('disabled');
				$(".deleteBtn").filter(".user").removeClass('disabled');
			});
		}
	}
});