import { Bot, session } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { delPhone, addPhone } from './bot/conversations.js'
import main from './bot/menus.js'
import { deleteMsg, deleteMsgTime, replyAndDel } from './bot/functions.js'
import { Message, User } from '../db.js'

const bot = new Bot(process.env.BOT)
bot.api.setMyCommands([{ command: 'start', description: 'Меню' } ])

// bot.on('message', (ctx, next) => {
// 	if (ctx.msg.text === '/start') {
// 		deleteMsgTime(ctx, ctx.message.chat.id, ctx.message.message_id, 60_000);
// 		return next();
// 	}

// 	// deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
// 	// replyAndDel(ctx, 'Я предназначен только для уведомлений о прибытии ваших заказов');
// 	next();
// })

bot.use(session({ initial: () => ({ init: 0 }) }));
bot.use(conversations());
bot.use(createConversation(delPhone));
bot.use(createConversation(addPhone));
bot.use(main)

bot.command('start', async ctx => {
	deleteMsgTime(ctx, ctx.message.chat.id, ctx.message.message_id, 60_000);
  await ctx.reply('Привет, я бот для отслеживания посылок компании YES !\n\nДобавьте свой номер телефона в формате +79123456789 или +380123456789 и я вам сообщу, когда и куда прибудет ваша посылка!\n\nYES-PVZ.RU', {
		reply_markup: main,
	});
	return;
})

bot.on('message', async ctx => {
	const user = await User.findOne({ telegram: ctx.from.id });
	if (!user) return;
	await Message.create({
		userId: user._id.toString(),
		message: ctx.msg.text
	})
})


bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e.description) {
	  console.error("Error in request:", e.description);
	} else {
	  console.error("Unknown error:", e);
	}
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start()

export default bot;