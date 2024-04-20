import { Menu } from "@grammyjs/menu"

const main = new Menu('main-menu')
	.text('➕ Добавить/Изменить номер телефона', async ctx => {
		await ctx.conversation.enter('addPhone')
	}).row()
	.text('❌ Удалить номер телефона', async ctx => {
		await ctx.conversation.enter('delPhone')
	})

export default main


