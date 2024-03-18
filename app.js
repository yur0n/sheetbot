import express from 'express';
import bot from './bot.js';
import User from './db.js';

const app = express();
app.use(express.json());

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

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});

async function sendNotification(users) {
	let status = [];
	try {
		for (const phone of users) {
			let reciver = await User.findOne({ phone });
			if (!reciver) {
				status.push({ phone: phone, status: false });
				continue;
			}
			let message = await bot.api.sendMessage(reciver.chat_id, 'Прибыла ваша посылка и ожидает вас в месте назначения!');
			if (message) {
				status.push({ phone: phone, status: true });
			} else {
				status.push({ phone: phone, status: false });
			}
			await new Promise(resolve => setTimeout(resolve, 200));
		}
		return status;
	}
	catch (e) {
		console.log(e);
		return status;
	}
}
	