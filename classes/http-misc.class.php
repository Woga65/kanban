<?php

class HttpMisc {
    private function __construct() {}

    public static function getAcceptedLanguages()
    {
        $langs = array();
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            preg_match_all('/([a-z]{1,8}(-[a-z]{1,8})?)\s*(;\s*q\s*=\s*(1|0\.[0-9]+))?/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $lang_parse);
            if (count($lang_parse[1])) {
                $langs = array_combine($lang_parse[1], $lang_parse[4]);
                foreach ($langs as $lang => $val) {
                    $langs[$lang] = ($val === '') ? 1 : $val;
                }
                arsort($langs, SORT_NUMERIC);
            }
        }

        return array_keys($langs);
    }


    public static function allowMethods($methods = ['GET'])
    {
        $methods = array_map('strtoupper',$methods);

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header("Access-Control-Allow-Methods: " . implode(",", $methods));
            header("Access-Control-Allow-Headers: content-type");
            exit();
        }

        if (!in_array($_SERVER['REQUEST_METHOD'], $methods)) {
            header("Allow: " . implode(",", $methods), true, 405);
            exit();
        }
    }
}