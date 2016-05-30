angular.module('appControllers')
.controller('UserController', function($http, $location, $scope, AppAuth, $cookies, $routeParams) {
	$scope.AppAuth = AppAuth;
	$scope.seleccionado;
	$scope.validated = false;
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

	$scope.isInvalid = function() {
		if($scope.user.username == null ||
			$scope.user.password == null ||
			$scope.user.email == null ||
			$scope.user.name == null ||
			$scope.user.surname == null ||
			$scope.user.phone == null ||
			$scope.user.username.trim().length == 0 ||
		    $scope.user.password.trim().length == 0 ||
		    $scope.user.email.trim().length == 0 ||
		    $scope.user.name.trim().length == 0 ||
		    $scope.user.surname.trim().length == 0 ||
		    $scope.user.phone.trim().length == 0) {
			return true;
		}
		return false;
	};

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
			alert("El usuario y/o la contraseña no son válidos.");
			$scope.callback();
    	});
    }
	
	$scope.create = function() {
		var config = {headers: {'X-Auth-Token': AppAuth.token}};
		$scope.user.roles = ['ROLE_USER'];
		$http.post("/users/create", $scope.user, config)
			.then(function(resp) {
				window.history.back();
			}, function(warning) {
				alert(warning.data);
				$scope.callback();
			});
    };
	
	$scope.validate = function() {
		$http.post("/users/check", $scope.user)
			.then(function(resp) {
				$scope.validated = true;
				$scope.callback();
			}, function(warning) {
				alert("El usuario y/o email ya están en uso.");
				$scope.callback();
			});
	}
	
	$scope.update = function() {
		if($scope.user.enabled) $scope.user.enabled = 1;
		else $scope.user.enabled = 0;

		if($scope.user.admin) $scope.user.roles = ['ROLE_ADMIN', 'ROLE_USER'];
		else $scope.user.roles = ['ROLE_USER'];

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