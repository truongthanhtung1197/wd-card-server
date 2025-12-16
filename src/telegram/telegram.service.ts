import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;
  private token = process.env.TELEGRAM_BOT_TOKEN || '';

  onModuleInit() {
    if (!this.token) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
      return;
    }

    // Khởi tạo bot với polling
    this.bot = new TelegramBot(this.token, { polling: true });

    // this.bot.on('message', (msg) => {
    //   this.bot?.sendMessage(
    //     'chatId',
    //     `Message from ${msg.chat.id} (${msg.chat.type}): ${msg.text}`,
    //   );
    // });

    // Xử lý lệnh /id
    this.bot.onText(/\/id\b/, (msg) => {
      const chat = msg.chat;
      const chatId = chat.id;
      const chatType = chat.type;
      //   const from = msg.from
      //     ? `${msg.from.username ?? msg.from.first_name}`
      //     : 'unknown';
      const reply = `Chat ID: ${chatId}\nType: ${chatType}`;
      //   const reply = `Chat ID: ${chatId}\nType: ${chatType}\nFrom: ${from}`;
      this.bot?.sendMessage(chatId, reply);
    });

    this.logger.log('Telegram bot started (polling).');
  }

  onModuleDestroy() {
    if (this.bot) {
      try {
        this.bot.stopPolling();
        this.logger.log('Telegram bot stopped.');
      } catch (err) {
        this.logger.error('Error stopping Telegram bot', err);
      }
    }
  }
}
