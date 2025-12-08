import os
import json
import random
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackContext, CallbackQueryHandler

# Загружаем токен из .env
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# Загружаем данные героев
with open("data/heroes.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

# Загружаем факты
with open("data/facts.json", "r", encoding="utf-8") as f:
    facts = json.load(f)

# Команда /start
async def start(update: Update, context: CallbackContext):
    # URL мини-приложения (нужно заменить на реальный URL после развертывания)
    web_app_url = "https://your-domain.com/heroibelarus-miniapp"  # Замените на реальный URL

    keyboard = [
        [InlineKeyboardButton("🚀 Открыть приложение", web_app=WebAppInfo(url=web_app_url))],
        [InlineKeyboardButton("🎖️ Случайный герой", callback_data="random_hero")],
        [InlineKeyboardButton("💡 Интересный факт", callback_data="random_fact")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "🇧🇾 Привет! Это проект *Героі Беларусі*\n\n"
        "🎓 Изучай героев Беларуси в интерактивном приложении!\n"
        "🧠 Проходи тесты и проверяй знания!\n"
        "❤️ Добавляй героев в избранное!\n\n"
        "Выбери действие:",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

# Обработка кнопок
async def button(update: Update, context: CallbackContext):
    query = update.callback_query
    await query.answer()

    if query.data == "random_hero":
        hero = random.choice(heroes)
        text = f"🎖️ *{hero['name']}*\n{hero['bio']}"
        await query.edit_message_text(text=text, parse_mode="Markdown")

    elif query.data == "random_fact":
        fact = random.choice(facts)
        text = f"💡 *{fact['hero']}*\n{fact['fact']}"
        await query.edit_message_text(text=text, parse_mode="Markdown")

# Основная функция
def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button))

    print("✅ Бот запущен. Нажми Ctrl+C для остановки.")
    app.run_polling()

if __name__ == "__main__":
    main()