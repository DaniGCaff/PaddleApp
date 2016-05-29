<?php
// Routes

$app->get('/', function($request, $response, $args) use ($app) {
    return $response->withStatus(302)->withHeader('Location', '/index.html');
});

// <editor-fold desc="RUTAS DE /users">
$app->get('/users/me', function($request, $response, $args) use($app) {
	$responseData = [
		"id" => $app->getContainer()->get("token")->id,
		"username" => $app->getContainer()->get("token")->username,
		"roles" => $app->getContainer()->get("token")->roles
	];
	return $response->withJson($responseData);
});

$app->post('/users/login', function($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'POST /users/login' route");

    $parsedBody = $request->getParsedBody();
    if(array_key_exists('username', $parsedBody) and array_key_exists('password', $parsedBody)) {
        $user = User::where("username", "=", $parsedBody["username"])->where("password", "=", $parsedBody["password"])->first();
        if($user != null) {
            $roles = $user->getRoles->lists('role');

            $now = new DateTime();
            $future = new DateTime("now +2 hours");

            $jti = \Tuupola\Base62::encode(random_bytes(16));
            $payload = [
                "iat" => $now->getTimeStamp(),
                "exp" => $future->getTimeStamp(),
                "jti" => $jti,
                "roles" => $roles,
				"username" => $user->username,
				"id" => $user->id
            ];
            $secret = "supersecreto";
            $token = \Firebase\JWT\JWT::encode($payload, $secret, "HS256");
            $data = $token;

            return $response->withStatus(201)
                ->withHeader("Content-Type", "application/json")
                ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
        } else {
            $newResponse = $response->withStatus(404);
            return $newResponse;
        }
    } else {
        $newResponse = $response->withStatus(422);
        return $newResponse;
    }

});

$app->get('/users/{userId}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /users/{userId}' route");

    if(!in_array("ROLE_USER", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $user = User::find($args['userId']);
    if($user != null) {
        $user['roles'] = $user->getRoles()->lists('role');
        unset($user->getRoles);
        $newResponse = $response->withJson($user);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->get('/users', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /users' route");

    if(!in_array("ROLE_USER", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $users = User::all();
    $allUsers = array();
    if(count($users) > 0) {
        foreach($users as $user) {
            $aux = $user;
            $aux["roles"] = $user->getRoles->lists('role');
            unset($aux->getRoles);
            $allUsers[] = $aux;
        }
        $data = array("users" =>$allUsers);
        $newResponse = $response->withJson($data);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->post('/users', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'POST /users' route");

    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $parsedBody = $request->getParsedBody();
    if(!array_key_exists('username', $parsedBody) or !array_key_exists('email', $parsedBody) or !array_key_exists('password', $parsedBody)) {
        $newResponse = $response->withStatus(422);
    } else {
        if(User::where('username','=',$parsedBody['username'])->count() > 0) {
            $newResponse = $response->withStatus(400);
        } else if(User::where('email','=',$parsedBody['email'])->count() > 0) {
            $newResponse = $response->withStatus(400);
        } else {
            $user = new User;

            $user->username = $parsedBody['username'];
            $user->email = $parsedBody['email'];
            $user->password = $parsedBody['password'];
            if(array_key_exists("enabled", $parsedBody))
                $user->enabled = $parsedBody['enabled'];

            $syncRoles = array();
            if(array_key_exists("roles", $parsedBody)) {
                foreach($parsedBody['roles'] as $role)
                    $syncRoles[] = Role::where('role','=',$role)->first()->id;
            }
            $user->save();
            $user->getRoles()->sync($syncRoles);
            $user->save();
            $user['roles'] = $user->getRoles()->lists('role');
            unset($user->getRoles);
            $newResponse = $response->withJson($user);
        }
    }
    return $newResponse;
});

$app->put('/users/{userId}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'PUT /users/{userId}' route");

    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $parsedBody = $request->getParsedBody();

    $user = User::find($args['userId']);
    if($user != null) {
        if (array_key_exists("username", $parsedBody)) {
            if($user->username != $parsedBody['username']) {
                if (User::where('username', '=', $parsedBody['username'])->count() > 0) {
                    $newResponse = $response->withStatus(400);
                    return $newResponse;
                }
                $user->username = $parsedBody['username'];
            }
        }

        if (array_key_exists("email", $parsedBody)) {
            if($user->email != $parsedBody['email']) {
                if (User::where('email', '=', $parsedBody['email'])->count() > 0) {
                    $newResponse = $response->withStatus(400);
                    return $newResponse;
                }
                $user->email = $parsedBody['email'];
            }
        }

        if (array_key_exists("password", $parsedBody))
            $user->password = $parsedBody['password'];

        if (array_key_exists("enabled", $parsedBody) && in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
            $user->enabled = $parsedBody['enabled'];

        $user->save();
        $syncRoles = array();
        foreach ($parsedBody['roles'] as $role)
            $syncRoles[] = Role::where('role', '=', $role)->first()->id;

        $user->getRoles()->sync($syncRoles);
        $user->save();
        $user['roles'] = $user->getRoles()->lists('role');
        unset($user->getRoles);
        $newResponse = $response->withJson($user);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->delete('/users/{userId}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'DELETE /users/{userId}' route");
    
    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $user = User::find($args['userId']);
    if($user != null) {
        $user->delete();
        $newResponse = $response->withStatus(204);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->options('/users', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'OPTIONS /users' route");

    $newResponse = $response->withAddedHeader('Allow', 'DELETE, GET, POST, PUT, OPTIONS');
    return $newResponse;
});
// </editor-fold>

// <editor-fold desc="RUTAS DE /courts">
$app->get('/courts/{courtId}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /courts/{courtId}' route");

    if(!in_array("ROLE_USER", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $court = Court::find($args['courtId']);
    if($court != null) {
        $newResponse = $response->withJson($court);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->get('/courts/fecha/{fecha}/franja/{franja}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /courts/fecha/{fecha}/franja/{franja}' route");

    if(!in_array("ROLE_USER", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $courts = Court::where("enabled","=","TRUE")->get();
    $courtsDisponibles = array();
    foreach($courts as $court) {
        $court->reservas = $court->getReservas()->where("franja",'=',$args['franja'])->where('fecha','=',$args['fecha'])->get();
        if(count($court->reservas) == 0)
            $courtsDisponibles[] = $court;
    }
    if($courts != null) {
        $courts = array("courts"=>$courtsDisponibles);
        $newResponse = $response->withJson($courts);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->get('/courts', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /courts' route");

    if(!in_array("ROLE_USER", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $courts = Court::all();
    $allCourts = array();
    if(count($courts) > 0) {
        foreach($courts as $court) {
            $aux = $court;
            $allCourts[] = $aux;
        }
        $data = array("courts" =>$allCourts);
        $newResponse = $response->withJson($data);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->map(['PUT', 'POST'], '/courts[/{courtId}]', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'POST /courts' route");

    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $parsedBody = $request->getParsedBody();

    if($request->isPost())
        $court = new Court;
    else
        $court = Court::find($args['courtId']);

    if($court == null) {
        $newResponse = $response->withStatus(404);
    } else {
        if(!array_key_exists('material', $parsedBody) or !array_key_exists('color', $parsedBody)) {
            $newResponse = $response->withStatus(422);
        } else {
            if(!Court::isValidMaterial($parsedBody['material']) or !Court::isValidColor($parsedBody['color'])) {
                $newResponse = $response->withStatus(422);
            } else {
                $court->material = $parsedBody['material'];
                $court->color = $parsedBody['color'];
                if(array_key_exists("enabled", $parsedBody))
                    $court->enabled = $parsedBody['enabled'];

                $court->save();
                $newResponse = $response->withJson($court);
            }
        }
    }
    return $newResponse;
});

$app->options('/courts', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'OPTIONS /courts' route");

    $newResponse = $response->withAddedHeader('Allow', 'DELETE, GET, POST, PUT, OPTIONS');
    return $newResponse;
});

$app->delete('/courts/{courtId}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'DELETE /court/{courtId}' route");

    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $court = Court::find($args['courtId']);
    if($court != null) {
        $court->delete();
        $newResponse = $response->withStatus(204);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});
// </editor-fold>

// <editor-fold desc="RUTAS DE /reservas">
$app->get('/reservas[/user/{userId}]', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /reservas' route");

    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    if(array_key_exists("userId", $args))
        $reservas = Reserva::where("userId","=",$args['userId'])->get();
    else
        $reservas = Reserva::all();
    if(count($reservas) > 0) {
        foreach($reservas as $reserva) {
            $reserva->nombreUsuario = $reserva->hasUser()->select("username")->first()->username;
        }
        $data = array("reservas" =>$reservas);
        $newResponse = $response->withJson($data);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});

$app->get('/reservas/{reservaId}', function ($request, $response, $args) use($app) {
    // Sample log message
    $this->logger->info("PADDLE APP - 'GET /reservas/{reservaId}' route");

    if(!in_array("ROLE_ADMIN", $app->getContainer()->get("token")->roles))
        return $response->withStatus(403);

    $reserva = Reserva::find($args['reservaId']);
    if($reserva != null) {
        $newResponse = $response->withJson($reserva);
    } else {
        $newResponse = $response->withStatus(404);
    }
    return $newResponse;
});
// </editor-fold>