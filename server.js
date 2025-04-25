import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'chat-bot-ten-livid.vercel.app'
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Mini Chatbot Backend is live!');
});

app.get('/chat', async (req, res) => {
  try {
    const data = await readFile('db.json', 'utf-8');
    const chats = JSON.parse(data).chats;
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read chats' });
  }
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const data = await readFile('db.json', 'utf-8');
    const json = JSON.parse(data);

    const lowerMsg = message.trim().toLowerCase();

    const foundResponse = json.responses.find(r =>
      lowerMsg.includes(r.trigger.toLowerCase())
    );

    const reply = foundResponse
      ? foundResponse.reply
      : "I'm not sure how to respond to that.";

    const newChat = { id: Date.now(), message, reply };
    if (!json.chats) {
        json.chats = [];
      }
    json.chats.push(newChat);

    await writeFile('db.json', JSON.stringify(json, null, 2));
    res.status(201).json({ reply });
  } catch (err) {
    console.error('Error handling chat:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
