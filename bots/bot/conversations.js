import { User } from '../../db.js';
import { InlineKeyboard } from 'grammy'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions.js'

export async function delPhone(conversation, ctx) {
	try {
		let ask = await ctx.reply('Вы уверены?', {
			reply_markup: new InlineKeyboard().text('✅ Да').text('🚫 Отменить')
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data == '🚫 Отменить') return
		if (ctx.update.callback_query?.data == '✅ Да') {
			let user = await User.findOne({ telegram: ctx.from.id });
			if (user) {
				await user.updateOne({ phone: '' });
				replyAndDel(ctx, '✅ Номер удален');
			} else {
				replyAndDel(ctx, 'ℹ️ Вы не зарегистрированы');
			}
		}
	} catch (error) {
		console.log('Bot error:', error)
		replyAndDel(ctx, `Системная ошибка, попробуйте позже`)
	}
}

export async function addPhone(conversation, ctx) {
	try {
		let ask = await ctx.reply('Введите номер телефона', {
			reply_markup: new InlineKeyboard().text('🚫 Отменить')
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data) return
		if (ctx.msg.text.match(/^\+79\d{9}$/) || ctx.msg.text.match(/^\+380\d{9}$/)) {
			const phone = ctx.msg.text;
			const user = await User.findOneAndUpdate({ telegram: ctx.from.id }, { phone }, { upsert: true, new: true });
			replyAndDel(ctx, `✅ Номер ${phone} сохранен, ждите уведомлений о прибытии ваших заказов!`, 6_000);
		} else {
			replyAndDel(ctx, '❌ Неверный формат номера');
		}
		
	} catch (error) {
		console.log('Bot admin error:', error)
		replyAndDel(ctx, `Системная ошибка, попробуйте позже`)
	}
}