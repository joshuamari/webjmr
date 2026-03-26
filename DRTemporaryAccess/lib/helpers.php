<?php

function requestValue(string $key, $default = null)
{
    return $_POST[$key] ?? $_GET[$key] ?? $default;
}

function requireRequestValue(string $key, string $message = 'Required field is missing.')
{
    $value = requestValue($key);

    if (is_string($value)) {
        $value = trim($value);
    }

    if ($value === null || $value === '') {
        jsonError($message, 400);
    }

    return $value;
}

function formatDateTimeDisplay(?string $dateTime): string
{
    if (empty($dateTime)) {
        return '';
    }

    $timestamp = strtotime($dateTime);
    if ($timestamp === false) {
        return '';
    }

    return date('Y-m-d h:i A', $timestamp);
}

function formatRequestedMonthLabel(?string $monthValue): string
{
    if (empty($monthValue)) {
        return '';
    }

    $date = DateTime::createFromFormat('Y-m', $monthValue);
    if (!$date) {
        return '';
    }

    return $date->format('F Y');
}