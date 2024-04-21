import { Menu } from "@grammyjs/menu"

const main = new Menu('main-menu')
	.text('➕ Добавить/Изменить номер телефона', async ctx => {
		await ctx.conversation.enter('addPhone')
	}).row()
	.text('❌ Удалить номер телефона', async ctx => {
		await ctx.conversation.enter('delPhone')
	}).row()
	.url('💬 Связаться с менеджером', 'https://t.me/WB_OZON_YES')

export default main


