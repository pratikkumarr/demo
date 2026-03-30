const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage (replace with database in production)
let goals = [];
let nextId = 1;

// CREATE - Add a new goal
app.post('/goals', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    const goal = { id: nextId++, title, description, createdAt: new Date() };
    goals.push(goal);
    res.status(201).json(goal);
});

// READ - Get all goals
app.get('/goals', (req, res) => {
    res.json(goals);
});

// READ - Get a specific goal
app.get('/goals/:id', (req, res) => {
    const goal = goals.find(g => g.id === parseInt(req.params.id));
    if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
});

// UPDATE - Modify a goal
app.put('/goals/:id', (req, res) => {
    const goal = goals.find(g => g.id === parseInt(req.params.id));
    if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
    }
    if (req.body.title) goal.title = req.body.title;
    if (req.body.description) goal.description = req.body.description;
    res.json(goal);
});

// DELETE - Remove a goal
app.delete('/goals/:id', (req, res) => {
    const index = goals.findIndex(g => g.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Goal not found' });
    }
    const deletedGoal = goals.splice(index, 1);
    res.json(deletedGoal[0]);
});

app.listen(PORT, () => {
    console.log(`Goal Manager server running on port ${PORT}`);
});

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goal-manager')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Database CRUD routes
app.post('/api/goals', async (req, res) => {
    try {
        const goal = new Goal(req.body);
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/goals', async (req, res) => {
    try {
        const goals = await Goal.find();
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/goals/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ error: 'Goal not found' });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/goals/:id', async (req, res) => {
    try {
        const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!goal) return res.status(404).json({ error: 'Goal not found' });
        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/goals/:id', async (req, res) => {
    try {
        const goal = await Goal.findByIdAndDelete(req.params.id);
        if (!goal) return res.status(404).json({ error: 'Goal not found' });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});