import express from 'express';
import bot from './bot.js';
import User from './db.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Sheetbot API');
});

app.post(`/update`, async (req, res) => {
	let users = req.body
	console.log(users);
	if (!users?.length ) {
		res.status(400).send('Invalid data');
		return;
	}
	let status = await sendNotification(users);
	res.send(status);
});

app.listen(2052, () => {
	console.log('Server is running on port 2052');
});

async function sendNotification(users) {
	let status = [];
	try {
		for (const user of users) {
			let reciver = await User.findOne({ phone: user.phone });
			if (!reciver) {
				user.goods.forEach(good => status.push({ row: good.row, status: false }));
				continue;
			}
			let message = `Уважаемый клиент, прибыл заказ ${user.code}:\n`
			user.goods.forEach(good => message += `\n${good.description} - ${good.arrivedAmount} из ${good.totalAmount}`);
			message += `\n\nПункт выдачи: ${user.place}`;
			let response = await bot.api.sendMessage(reciver.chat_id, `Прибыла ваша посылка: ${user.description}\n\nВ количестве: ${user.arrivedAmount} из ${user.totalAmount}\nПункт выдачи: ${user.place}\nКода выдачи: ${user.code}`, { 
				reply_markup: {
					inline_keyboard: [[{ text: 'Ссылка на товар', url: user.link }]]
				}
			});
			if (response) {
				user.goods.forEach(good => status.push({ row: good.row, status: true }));
			} else {
				user.goods.forEach(good => status.push({ row: good.row, status: false }));
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		return status;
	}
	catch (e) {
		console.log(e);
		return status;
	}
}

// // users
// [
// 	{
// 		code:'Н1709', 
// 		place:'Авоська',
// 		phone:'+79900001299',
// 		goods: [
// 			{
// 				totalAmount:1, 
// 				arrivedAmount:'', 
// 				description:"Чехол. кулер для", 
// 				row:5
// 			}
// 		], 
				
// 	},
// 	{
// 		code:'Н1709', 
// 		place:'Авоська',
// 		phone:'+79900001299',
// 		goods: [
// 			{
// 				totalAmount:1, 
// 				arrivedAmount:'', 
// 				description:"Чехол. кулер для", 
// 				row:5
// 			}
// 		], 
				
// 	},
// 	{
// 		code:'Н1710', 
// 		place:'Марина',
// 		phone:'+79900065155',
// 		goods: [
// 			{
// 				totalAmount:1, 
// 				arrivedAmount:'', 
// 				description:"Подгузники Huggies Elite", 
// 				row:6
// 			},
// 			{
// 				totalAmount:1, 
// 				arrivedAmount:'', 
// 				description:"Заколка-краб Zinnat 1", 
// 				row:7
// 			}
// 		], 
				
// 	}
// ]