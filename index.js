const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const PORT = process.env.PORT || 3000; // Use the PORT environment variable if set, otherwise default to 3000

async function sendMenu(chatId) {
    const keyboard = {
        inline_keyboard: [
            [{ text: 'Dodoma', callback_data: 'Dodoma' }],
            [{ text: 'Dar es Salaam', callback_data: 'Dar_es_Salaam' }],
            [{ text: 'Arusha', callback_data: 'Arusha' }],
            [{ text: 'Mwanza', callback_data: 'Mwanza' }]
        ]
    };

    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: 'Choose a region:',
            reply_markup: JSON.stringify(keyboard)
        });
    } catch (error) {
        console.error('Error sending menu:', error);
    }
}

// Handle incoming callback queries
app.post('/webhook', async (req, res) => {
    const { message, callback_query } = req.body;

    if (message) {
        // Handle regular messages
        const chatId = message.chat.id;
        const text = message.text.toLowerCase();

        if (text.includes('temperature')) {
            await sendMenu(chatId); // Send menu when user requests temperature
        }
    } else if (callback_query) {
        // Handle callback queries from inline buttons
        const chatId = callback_query.message.chat.id;
        const region = callback_query.data;

        const temperature = await getTemperatureForRegion(region);
        await sendMessage(chatId, `The temperature in ${region} is ${temperature}°C`);
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

// Set keep-alive and timeout values
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds
