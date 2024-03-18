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

app.listen(8080, () => {
	console.log('Server is running on port 3000');
});

async function sendNotification(users) {
	let status = [];
	try {
		for (const user of users) {
			let reciver = await User.findOne({ phone: user.phone });
			if (!reciver) {
				status.push({ row: user.row, status: false });
				continue;
			}
			let message = await bot.api.sendMessage(reciver.chat_id, `Прибыла ваша посылка ${user.description} (${user.code}) на пункт ${user.place} в количестве ${user.amount}`, { 
				reply_markup: {
					inline_keyboard: [[{ text: 'Ссылка на товар', url: user.link }]]
				}
			});
			if (message) {
				status.push({ row: user.row, status: true });
			} else {
				status.push({ row: user.row, status: false });
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
	