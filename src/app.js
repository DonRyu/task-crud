import express from 'express';

const app = express();

app.use(express.json());

// Routes will go here later
app.get('/', (req, res) => {
  res.json({ message: 'Task API is running' });
});

export default app;
