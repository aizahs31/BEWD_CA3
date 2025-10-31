const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
const uuid = require('uuid');
const { v4: uuidv4 } = uuid;
const fs = require('fs');
const path = require('path');

const eventsFilePath = path.join(__dirname, 'data', 'events.json');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

app.use(express.json());

app.post('/api/events', (req, res) => {
    const authApiKey = req.headers['x-api-key'];
    if(!authApiKey){
        return res.status(401).json({error: "Unauthorized"})
    }

    const { eventName, date, location, description, tags } = req.body;
    if (!eventName || !date || !location || !description) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const duplicate = fs.readFileSync(eventsFilePath, 'utf-8');
    if(duplicate){
        const events = JSON.parse(duplicate);
        const exists = events.find(e => e.eventName === eventName && e.date === date);
        if(exists){
            return res.status(409).json({ error: "Duplicate entry" });
        };
    }

    const event = {
        id: uuidv4(),
        eventName,
        date,
        location,
        description,
        tags: tags || []
    };

    fs.readFile(eventsFilePath, 'utf8', (err, data) => {
        let events = [];
        if(!err) {
            events = JSON.parse(data);
        }
        events.push(event);
        fs.writeFile(eventsFilePath, JSON.stringify(events), (err) => {
            if (err) {
                console.error('Error saving event:', err);
                return res.status(500).json({ error: "Failed to save" });
            }
            res.status(201).json(event);
        });
    });
});

app.get('/api/events', (req, res) => {
    fs.readFile(eventsFilePath, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({ error: "Failed to retrieve events" });
        }
        const events = JSON.parse(data);
        res.status(200).json(events);
    });
});

app.put('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    fs.readFile(eventsFilePath, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({ error: "Failed to fetch events"});
        }
        let events = JSON.parse(data);
        const eventIndex = events.findIndex(e => e.id === eventId);
        if(eventIndex === -1){
            return res.status(404).json({ error: "Event not found" });
        }
        const { location, description, tags, date } = req.body;
        fs.readFile(eventsFilePath, 'utf8', (err, data) => {
            let event = JSON.parse(data);
            if(err){
                return res.status(500).json({ error: "Failed to update"})
            }
            if(location !== undefined) events[eventIndex].location = location;
            if(description !== undefined) events[eventIndex].description = description;
            if(tags !== undefined) events[eventIndex].tags = Array.isArray(tags) ? tags.slice(0,10) : events[eventIndex].tags;
            if(date !== undefined) events[eventIndex].date = date;
            res.status(200).json(events[eventIndex]);
            
            if(!err) {
                events = JSON.parse(data);
                events.push(event);
                fs.writeFile(eventsFilePath, JSON.stringify(events), (err) => {
                    if (err) {
                        console.error('Error saving event:', err);
                        return res.status(500).json({ error: "Failed to save" });
                    }
                    res.status(201).json(event);
                });
            }
            
        })
    });
    
});

app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    fs.readFile(eventsFilePath, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({ error: "Failed to fetch events" });
        }
        let events = JSON.parse(data);
        const eventIndex = events.findIndex(e => e.id === eventId);
        if(eventIndex === -1){
            return res.status(404).json({ error: "Event not found" });
        }
        events.splice(eventIndex, 1);
        fs.writeFile(eventsFilePath, JSON.stringify(events), (err) => {
            if(err){
                return res.status(500).json({ error: "Failed to delete event" });
            }
            res.status(204).send();
        });
    });
});

app.listen(PORT, () => {
    console.log('Server running on port', PORT);
})