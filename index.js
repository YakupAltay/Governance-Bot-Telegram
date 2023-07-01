import { TelegramToken } from "./config/env.js";
import { setupTelegram } from "./services/telegram.js";

if (!TelegramToken) {
    console.error('TELEGRAM_TOKEN is not set');
    process.exit(1);
}

console.log('Starting...');

console.log('Setting up Telegram...');
await setupTelegram(TelegramToken);