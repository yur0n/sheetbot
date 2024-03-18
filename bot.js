import { Bot } from 'grammy';
import User from './db.js';
const bot = new Bot('6831064485:AAFxWCd3yZUFI9yuBtQQ4Q7YPB6McuTAq8U');

bot.command('start', ctx => ctx.reply('Привет, я бот для отслеживания посылок! Отправьте мне свой номер телефона в формате +79123456789 и я вам сообщу, когда ваша посылка доберется до места назначения!'));

bot.on('message', async ctx => {
	if (ctx.msg.text.match(/^\+79\d{9}$/)) {
		try {
			let user = await User.findOne({ chat_id: ctx.from.id });
			if (user) {
				ctx.reply('Вы уже зарегистрированы!');
			} else {
				let newUser = new User({ chat_id: ctx.from.id, phone: ctx.msg.text });
				await newUser.save();
				ctx.reply('Спасибо, ждите уведомления о статусе вашей посылки!');
			}
		}
		catch (e) {
			console.log(e);
			ctx.reply('Произошла ошибка, попробуйте позже');
		}
	} else {
		ctx.reply('Мне нужен только ваш номер телефона в формате +79123456789!');
	}
});

bot.start();

export default bot;
	