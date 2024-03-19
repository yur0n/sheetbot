import { Bot } from 'grammy';
import User from './db.js';
const bot = new Bot(process.env.BOT);

bot.command('start', ctx => ctx.reply('Привет, я бот для отслеживания посылок!\n\nОтправьте мне свой номер телефона в формате +79123456789 и я вам сообщу, когда и куда прибудет ваша посылка!'));

bot.on('message', async ctx => {
	if (ctx.msg.text.match(/^\+79\d{9}$/)) {
		try {
			let user = await User.findOne({ phone: ctx.msg.text });
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
		ctx.reply('Мне нужен только ваш номер телефона в формате +79123456789');
	}
});

bot.start();

export default bot;
	