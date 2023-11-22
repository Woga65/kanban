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
}