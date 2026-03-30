<?php

function requestValue(string $key, $default = null)
{
    return $_POST[$key] ?? $_GET[$key] ?? $default;
}

function requireRequestValue(string $key, string $message = 'Required field is missing.')
{
    $value = requestValue($key);

    if ($value === null || $value === '') {
        jsonError($message, 400);
    }

    return $value;
}
