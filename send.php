<?php
declare(strict_types=1);

/*
 * Obsługa formularzy kontaktowych i wyceny (PL + UA).
 * POST  -> walidacja, wysyłka maila, przekierowanie 303 na ?s=<status>
 * GET   -> strona z wynikiem (ok / invalid / error / rate)
 */

const MAIL_TO = 'dima@hproperties.pl';
const MAIL_FROM = 'no-reply@hproperties.pl';
const MAIL_FROM_NAME = 'H.Properties - formularz';
const COMPANY_PHONE = '572 910 341';
const MIN_SECONDS_BETWEEN_SUBMITS = 20;

const TEXTS = [
    'pl' => [
        'lang' => 'pl',
        'ok_title' => 'Dziękujemy za wiadomość',
        'ok_text' => 'Twoja wiadomość została wysłana. Skontaktujemy się z Tobą najszybciej, jak to możliwe.',
        'invalid_title' => 'Uzupełnij formularz',
        'invalid_text' => 'Imię, telefon i wiadomość są wymagane, a numer telefonu musi być poprawny. Wróć do formularza i spróbuj ponownie.',
        'rate_title' => 'Chwileczkę',
        'rate_text' => 'Przed chwilą wysłano już wiadomość z tej przeglądarki. Odczekaj kilkanaście sekund i spróbuj ponownie.',
        'error_title' => 'Nie udało się wysłać wiadomości',
        'error_text' => 'Wystąpił błąd po naszej stronie. Zadzwoń pod numer ' . COMPANY_PHONE . ' lub napisz na ' . MAIL_TO . '.',
        'back' => 'Wróć na stronę',
        'home' => 'Strona główna',
        'home_href' => '/',
    ],
    'ua' => [
        'lang' => 'uk',
        'ok_title' => 'Дякуємо за повідомлення',
        'ok_text' => 'Ваше повідомлення надіслано. Ми зв’яжемося з вами якнайшвидше.',
        'invalid_title' => 'Заповніть форму',
        'invalid_text' => 'Ім’я, телефон і повідомлення є обов’язковими, а номер телефону має бути правильним. Поверніться до форми й спробуйте ще раз.',
        'rate_title' => 'Зачекайте хвилинку',
        'rate_text' => 'З цього браузера щойно вже надіслано повідомлення. Зачекайте кілька секунд і спробуйте ще раз.',
        'error_title' => 'Не вдалося надіслати повідомлення',
        'error_text' => 'Сталася помилка з нашого боку. Зателефонуйте за номером ' . COMPANY_PHONE . ' або напишіть на ' . MAIL_TO . '.',
        'back' => 'Повернутися на сторінку',
        'home' => 'Головна сторінка',
        'home_href' => '/ua/',
    ],
];

function clean_line(string $value, int $max): string
{
    $value = preg_replace('/[\r\n\t\0]+/', ' ', $value) ?? '';
    $value = trim(preg_replace('/\s{2,}/u', ' ', $value) ?? '');
    return mb_substr($value, 0, $max);
}

function clean_text(string $value, int $max): string
{
    $value = str_replace(["\r\n", "\r", "\0"], ["\n", "\n", ''], $value);
    return mb_substr(trim($value), 0, $max);
}

function referer_path(): string
{
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if ($referer === '') {
        return '/';
    }

    $parts = parse_url($referer);
    if (!is_array($parts) || empty($parts['path'])) {
        return '/';
    }

    $host = $parts['host'] ?? '';
    $current = preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
    if ($host !== '' && strcasecmp($host, (string) $current) !== 0) {
        return '/';
    }

    $path = $parts['path'];
    if ($path[0] !== '/' || str_starts_with($path, '//') || !preg_match('#^/[A-Za-z0-9._~/%-]*$#', $path)) {
        return '/';
    }

    return $path;
}

function is_ua_path(string $path): bool
{
    return $path === '/ua' || str_starts_with($path, '/ua/');
}

function redirect(string $status, string $lang, string $back): void
{
    $query = http_build_query(['s' => $status, 'l' => $lang, 'b' => $back]);
    header('Location: /send.php?' . $query, true, 303);
    exit;
}

function render(string $status, string $lang, string $back): void
{
    $t = TEXTS[$lang] ?? TEXTS['pl'];
    $key = in_array($status, ['ok', 'invalid', 'rate', 'error'], true) ? $status : 'error';
    $title = $t[$key . '_title'];
    $text = $t[$key . '_text'];

    $backHref = ($back !== '' && $back[0] === '/' && !str_starts_with($back, '//') && preg_match('#^/[A-Za-z0-9._~/%-]*$#', $back))
        ? $back
        : $t['home_href'];
    $backLabel = $backHref === $t['home_href'] ? $t['home'] : $t['back'];

    http_response_code($key === 'ok' ? 200 : ($key === 'error' ? 500 : ($key === 'rate' ? 429 : 422)));
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');

    $e = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    ?>
<!DOCTYPE html>
<html lang="<?= $e($t['lang']) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title><?= $e($title) ?> | H.Properties</title>
    <link rel="icon" href="/dist/img/favicon.png">
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 2rem;
            background: #f4f6fa;
            color: #081a32;
            font-family: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        .box {
            width: 100%;
            max-width: 52rem;
            padding: 4rem 3rem;
            background: #fff;
            border-radius: 1.6rem;
            box-shadow: 0 1rem 4rem rgba(8, 26, 50, 0.1);
            text-align: center;
        }
        h1 { margin: 0 0 1.2rem; font-size: 2.6rem; line-height: 1.2; }
        p { margin: 0 0 2.8rem; font-size: 1.6rem; line-height: 1.6; }
        a {
            display: inline-block;
            padding: 1.4rem 3rem;
            background: #112f59;
            color: #fff;
            border-radius: 0.8rem;
            font-weight: 600;
            text-decoration: none;
        }
        html { font-size: 62.5%; }
    </style>
</head>
<body>
    <main class="box">
        <h1><?= $e($title) ?></h1>
        <p><?= $e($text) ?></p>
        <a href="<?= $e($backHref) ?>"><?= $e($backLabel) ?></a>
    </main>
</body>
</html>
    <?php
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    $lang = ($_GET['l'] ?? 'pl') === 'ua' ? 'ua' : 'pl';
    $status = is_string($_GET['s'] ?? null) ? $_GET['s'] : '';
    $back = is_string($_GET['b'] ?? null) ? $_GET['b'] : '';

    if ($status === '') {
        header('Location: ' . TEXTS[$lang]['home_href'], true, 302);
        exit;
    }

    render($status, $lang, $back);
}

$back = referer_path();
$lang = is_ua_path($back) ? 'ua' : 'pl';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $currentHost = preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
    if (!is_string($originHost) || strcasecmp($originHost, (string) $currentHost) !== 0) {
        http_response_code(403);
        exit;
    }
}

$honeypot = $_POST['company'] ?? '';
if (is_string($honeypot) && trim($honeypot) !== '') {
    redirect('ok', $lang, $back);
}

$name = clean_line(is_string($_POST['name'] ?? null) ? $_POST['name'] : '', 100);
$phone = clean_line(is_string($_POST['phone'] ?? null) ? $_POST['phone'] : '', 30);
$message = clean_text(is_string($_POST['message'] ?? null) ? $_POST['message'] : '', 5000);

$types = [];
if (isset($_POST['property_types']) && is_array($_POST['property_types'])) {
    foreach (array_slice($_POST['property_types'], 0, 15) as $type) {
        if (is_string($type)) {
            $type = clean_line($type, 160);
            if ($type !== '') {
                $types[] = $type;
            }
        }
    }
}

$phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';
$phoneValid = preg_match('/^[+()\d\s.-]+$/', $phone) === 1
    && strlen($phoneDigits) >= 7
    && strlen($phoneDigits) <= 15;

if ($name === '' || $message === '' || !$phoneValid) {
    redirect('invalid', $lang, $back);
}

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
]);
$now = time();
$last = (int) ($_SESSION['last_submit'] ?? 0);
if ($now - $last < MIN_SECONDS_BETWEEN_SUBMITS) {
    session_write_close();
    redirect('rate', $lang, $back);
}

$page = ($_SERVER['HTTP_REFERER'] ?? '') !== '' ? clean_line($_SERVER['HTTP_REFERER'], 300) : '-';

$lines = [
    'Nowa wiadomość z formularza na stronie H.Properties',
    '',
    'Imię i nazwisko: ' . $name,
    'Telefon: ' . $phone,
    'Rodzaj nieruchomości / oferta: ' . ($types !== [] ? implode(', ', $types) : '-'),
    'Język strony: ' . ($lang === 'ua' ? 'ukraiński' : 'polski'),
    'Strona: ' . $page,
    'Data: ' . date('Y-m-d H:i:s'),
    '',
    'Wiadomość:',
    $message,
    '',
];
$body = implode("\r\n", array_map(
    static fn(string $line): string => str_replace("\n", "\r\n", $line),
    $lines
));

$subject = 'Nowe zapytanie ze strony: ' . $name;
$encodedSubject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
$fromName = mb_encode_mimeheader(MAIL_FROM_NAME, 'UTF-8', 'B', "\r\n");

$headers = [
    'From: ' . $fromName . ' <' . MAIL_FROM . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail(MAIL_TO, $encodedSubject, $body, implode("\r\n", $headers), '-f' . MAIL_FROM);

if (!$sent) {
    error_log('send.php: mail() failed');
    session_write_close();
    redirect('error', $lang, $back);
}

$_SESSION['last_submit'] = $now;
session_write_close();
redirect('ok', $lang, $back);
