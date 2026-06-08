<?php
class Logger {
    public static function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
        
        // 输出到标准错误（Docker日志收集）
        file_put_contents('php://stderr', $logMessage, FILE_APPEND);
    }

    public static function info($message) {
        self::log($message, 'INFO');
    }

    public static function error($message) {
        self::log($message, 'ERROR');
    }
}
