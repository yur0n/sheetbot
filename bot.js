import { Bot, GrammyError, HttpError } from 'grammy';
import User from './db.js';
const bot = new Bot(process.env.BOT);

bot.command('start', ctx => ctx.reply('Привет, я бот для отслеживания посылок компании YES !\nОтправьте мне свой номер телефона в формате +79123456789 или +380123456789 и я вам сообщу, когда и куда прибудет ваша посылка!'));
bot.on('message', async ctx => {
	if (ctx.msg.text.match(/^\+79\d{9}$/) || ctx.msg.text.match(/^\+380\d{9}$/)) {
		try {
			let user = await User.findOne({ phone: ctx.msg.text });
			if (user) {
				ctx.reply('Вы уже зарегистрированы!');
			} else {
				let newUser = new User({ chat_id: ctx.from.id, phone: ctx.msg.text });
				await newUser.save();
				ctx.reply('Спасибо, ждите уведомлений о прибытии ваших заказов!');
			}
		}
		catch (e) {
			console.log(e);
			ctx.reply('Произошла ошибка, попробуйте позже');
		}
	} else {
		ctx.reply('Я предназначен только для уведомлений о прибытии ваших заказов. Все, что мне нужно это ваш номер телефона в формате +79123456789 или +380123456789');
	}
});

bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) { 
	  console.error("GrammyError:", e.description);
	}
	if (e.description) {
	  console.error("Error in request:", e.description);
	} else if (e instanceof HttpError) {
	  console.error("Could not contact Telegram:", e);
	} else {
	  console.error("Unknown error:", e);
	}
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();

export default bot;
	