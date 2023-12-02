<?php

class Router {

    private $routes = [];


    public function post(string $uri, $handler): void
    {
        $this->addHandler($uri, $handler, 'POST');
    }


    public function get(string $uri, $handler): void
    {
        $this->addHandler($uri, $handler, 'GET');
    }


    public function route()
    {
        foreach ($this->routes as $route) {
            if ($this->requestPathMatchesRoute($route['uri'], $route['method'])) {
                return require $route['handler'];
            }
        }
        
        echo JsonHttp::errResp("No handler found (404): <" . $this->requestPath() . ">");
        header("Not found", true, 404);
        exit();
    }


    private function addHandler($uri, $handler, $method): void
    {
        $this->routes[] = [
            'uri' => $uri,
            'handler' => $handler,
            'method' => $method,
        ];
    }


    private function requestMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }


    private function requestPath(): string
    {
        return parse_url($_SERVER['REQUEST_URI'])['path'];
    }


    private function requestPathMatchesRoute($route, $method): bool
    {
        $scriptUri = substr($_SERVER['SCRIPT_FILENAME'], strlen($_SERVER['DOCUMENT_ROOT']));
        $scriptDir = dirname($scriptUri);

        return
            (
                $this->requestPath() === "$scriptUri/$route" ||
                $this->requestPath() === "$scriptDir/$route"
            ) 
            &&
            (
                $this->requestMethod() === $method ||
                $this->requestMethod() === 'OPTIONS'
            );
    }
}