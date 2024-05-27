const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const WEBHOOK_URL = `${process.env.SERVER_URL}/webhook`;

app.post('/webhook', async (req, res) => {
    const { message } = req.body;

    if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text.toLowerCase();

        if (text.includes('temperature')) {
            const region = text.replace('temperature', '').trim();
            const temperature = await getTemperatureForRegion(region);
            await sendMessage(chatId, `The temperature in ${region} is ${temperature}°C`);
        } else {
            await sendMessage(chatId, 'Please request temperature information by typing "temperature [region]".');
        }
    }

    res.sendStatus(200);
});

async function getTemperatureForRegion(region) {
    // You need to find the latitude and longitude for the region
    // Here is a sample latitude and longitude for Dodoma, Tanzania
    const latitude = -6.1630;
    const longitude = 35.7516;
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;

    try {
        const response = await axios.get(API_URL);
        // Assuming we take the current hour's temperature
        const temperature = response.data.hourly.temperature_2m[0];
        return temperature;
    } catch (error) {
        console.error(error);
        return 'unknown';
    }
}

async function sendMessage(chatId, text) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text,
    });
}

async function setWebhook() {
    try {
        await axios.post(`${TELEGRAM_API}/setWebhook`, {
            url: WEBHOOK_URL,
        });
        console.log('Webhook set');
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
}

app.listen(3000, async () => {
    console.log('Server is running on port 3000');
    await setWebhook();
});
