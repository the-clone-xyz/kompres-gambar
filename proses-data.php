<?php

require "vendor/autoload.php";

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

// Konfigurasi
$uploadDir = __DIR__ . "/images/";
$baseUrl = "http://localhost/kompres-images/images/"; // Ganti sesuai domainmu

$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
$kualitas = isset($_POST["kualitas"]) ? max(10, min((int) $_POST["kualitas"], 100)) : 60;

// Validasi input file
if (!isset($_FILES["gambar"]) || $_FILES["gambar"]["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "❌ Gagal mengunggah gambar."]);
    exit;
}

$originalName = basename($_FILES["gambar"]["name"]);
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$tempFile = $_FILES["gambar"]["tmp_name"];
$originalSize = $_FILES["gambar"]["size"];
$mime = mime_content_type($tempFile);

if (!in_array($ext, $allowedExtensions) || !in_array($mime, $allowedMimeTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "❌ Format file tidak didukung."]);
    exit;
}

$check = getimagesize($tempFile);
if ($check === false) {
    http_response_code(400);
    echo json_encode(["error" => "❌ File bukan gambar valid."]);
    exit;
}

// Penamaan file aman dan unik
$timestamp = time();
$filenameOriginal = "asli_" . $timestamp . "." . $ext;
$filenameCompressed = "kompres_" . $timestamp . "." . $ext;

$originalPath = $uploadDir . $filenameOriginal;
$compressedPath = $uploadDir . $filenameCompressed;

if (!move_uploaded_file($tempFile, $originalPath)) {
    http_response_code(500);
    echo json_encode(["error" => "❌ Gagal menyimpan gambar asli."]);
    exit;
}

// Kompresi
try {
    $manager = new ImageManager(new Driver());
    $image = $manager->read($originalPath);
    $image->save($compressedPath, quality: $kualitas);

    $compressedSize = filesize($compressedPath);
    $compressionRate = round((($originalSize - $compressedSize) / $originalSize) * 100, 2);

    echo json_encode([
        "originalPath" => $baseUrl . $filenameOriginal,
        "compressedPath" => $baseUrl . $filenameCompressed,
        "originalSize" => $originalSize,
        "compressedSize" => $compressedSize,
        "compressionRate" => $compressionRate
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "❌ Terjadi kesalahan saat mengompres gambar."]);
}
