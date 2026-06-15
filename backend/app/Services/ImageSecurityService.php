<?php

namespace App\Services;

class ImageSecurityService
{
    public function scanBase64Image($base64Data): array
    {
        try {
            $checks = [
                'base64_format' => $this->checkBase64Format($base64Data),
                'mime_type' => false,
                'file_size' => false,
                'suspicious_patterns' => false,
            ];

            if ($checks['base64_format']) {
                $checks['mime_type'] = $this->checkMimeType($base64Data);
                $checks['file_size'] = $this->checkFileSize($base64Data);
                $checks['suspicious_patterns'] = $this->checkSuspiciousPatterns($base64Data);
            }

            $isSafe = !in_array(false, $checks, true);

            return [
                'safe' => $isSafe,
                'checks' => $checks,
                'message' => $isSafe ? 'Imagem segura' : 'Imagem considerada suspeita'
            ];
        } catch (\Exception $e) {
            return [
                'safe' => false,
                'checks' => [
                    'base64_format' => false,
                    'mime_type' => false,
                    'file_size' => false,
                    'suspicious_patterns' => false,
                ],
                'message' => 'Erro na verificação: ' . $e->getMessage()
            ];
        }
    }

    private function checkBase64Format($base64Data): bool
    {
        if (!is_string($base64Data) || empty($base64Data)) {
            return false;
        }

        if (!preg_match('/^data:image\/[a-zA-Z0-9\+]+\;base64,[a-zA-Z0-9\/\+=]+$/', $base64Data)) {
            if (!preg_match('/^data:image\/[^;]+;base64,/', $base64Data)) {
                return false;
            }
        }

        return true;
    }

    private function checkMimeType($base64Data): bool
    {
        if (preg_match('/^data:image\/([^;]+);base64,/', $base64Data, $matches)) {
            $imageType = $matches[1];

            $allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'svg+xml', 'webp', 'avif'];

            return in_array($imageType, $allowedTypes);
        }

        return false;
    }

    private function checkFileSize($base64Data): bool
    {
        try {
            $base64String = preg_replace('/^data:image\/[^;]+;base64,/', '', $base64Data);

            $imageData = base64_decode($base64String, true);

            if ($imageData === false) {
                return false;
            }

            $fileSize = strlen($imageData);

            return $fileSize > 0 && $fileSize <= (10 * 1024 * 1024);
        } catch (\Exception $e) {
            return false;
        }
    }

    private function checkSuspiciousPatterns($base64Data): bool
    {
        try {
            $base64String = preg_replace('/^data:image\/[^;]+;base64,/', '', $base64Data);
            $binaryData = base64_decode($base64String, true);

            if ($binaryData === false) {
                return false;
            }

            if (strpos($base64Data, 'image/svg+xml') !== false) {
                return $this->checkSvgSafety($binaryData);
            }

            return $this->checkImageMagicBytes($binaryData);
        } catch (\Exception $e) {
            return false;
        }
    }

    private function checkSvgSafety($svgContent): bool
    {
        $suspiciousPatterns = [
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload\s*=/i',
            '/onerror\s*=/i',
            '/onclick\s*=/i',
            '/<iframe/i',
            '/<object/i',
            '/<embed/i',
            '/eval\s*\(/i',
            '/alert\s*\(/i',
            '/document\./i',
            '/window\./i',
            '/XMLHttpRequest/i',
            '/fetch\s*\(/i',
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $svgContent)) {
                return false;
            }
        }

        return true;
    }

    private function checkImageMagicBytes($binaryData): bool
    {
        $magicSignatures = [
            'jpg' => "\xFF\xD8\xFF",
            'png' => "\x89PNG\r\n\x1a\n",
            'gif' => "GIF8",
            'webp' => "RIFF",
        ];

        foreach ($magicSignatures as $signature) {
            if (strpos($binaryData, $signature) === 0) {
                return true;
            }
        }

        $imageInfo = @getimagesizefromstring($binaryData);
        return $imageInfo !== false;
    }

    public function getImageInfo($base64Data): array
    {
        try {
            $base64String = preg_replace('/^data:image\/[^;]+;base64,/', '', $base64Data);
            $binaryData = base64_decode($base64String, true);

            if ($binaryData === false) {
                return ['error' => 'Falha ao decodificar base64'];
            }

            $imageInfo = @getimagesizefromstring($binaryData);

            if ($imageInfo === false) {
                return ['error' => 'Não é uma imagem válida'];
            }

            return [
                'width' => $imageInfo[0] ?? 0,
                'height' => $imageInfo[1] ?? 0,
                'mime' => $imageInfo['mime'] ?? 'unknown',
                'size' => strlen($binaryData)
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
