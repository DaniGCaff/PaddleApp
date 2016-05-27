<?php
// Application middleware

// e.g: $app->add(new \Slim\Csrf\Guard);

$container = $app->getContainer();

$app->add(new \Slim\Middleware\JwtAuthentication([
    "header" => "X-Auth-Token",
    "regexp" => "/(.*)$/i",
    "secret" => "supersecreto",
    "rules" => [
        new \Slim\Middleware\JwtAuthentication\RequestPathRule([
            "path" => ["/users", "/courts"],
            "passthrough" => ["/users/login"]
        ]),
        new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
            "passthrough" => ["OPTIONS"]
        ])], 
    "callback" => function ($request, $response, $arguments) use ($container) {
        $container["token"] = $arguments["decoded"];
    }
]));
