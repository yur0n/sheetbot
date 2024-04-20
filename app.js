import express from 'express';
import bot from './bots/bot.js';
import bodyParser from 'body-parser-easy';
import User from './db.js';

const port = process.env.PORT || 2052;
const app = express();
app.use(express.json());
app.use(bodyParser());

app.get('/', (req, res) => {
	res.send('Sheetbot API');
});
app.post(`/update`, async (req, res) => {
	let users = req.body
	if (!users?.length ) {
		res.status(400).send('Invalid data');
		return;
	}
	let status = await sendNotification(users);
	res.send(status);
});

app.listen(port, () => {
	console.log('Server is running on port ' + port);
});

async function sendNotification(users) {
	let status = [];
	try {
		for (const user of users) {
			let reciver;
			try {
				reciver = await User.findOne({ phone: '+' + user.phone });
			} catch (e) {
				user.goods.forEach(good => status.push({ row: good.row, status: false }));
				continue;
			}
			if (!reciver) {
				user.goods.forEach(good => status.push({ row: good.row, status: false }));
				continue;
			}
			let message = `Уважаемый клиент, прибыл заказ ${user.code}:\n`
			user.goods.forEach(good => {
				message += `\n${good.description} - ${good.arrivedAmount} шт`;
				if (good.arrivedAmount < good.totalAmount) {
					message += ` из ${good.totalAmount}`;
				}
			});
			message += `\n\nПункт выдачи: ${user.place}\n\nВаш yes-pvz.ru`;
			try {
				await bot.api.sendMessage(reciver.chat_id, message);
				user.goods.forEach(good => status.push({ row: good.row, status: true }));
			} catch (e) {
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

export default app;
