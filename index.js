const express = require("express");
const res = require("express/lib/response");
const App = express();
const PORT = 3001;
const SERVER_URI = `http://localhost:${PORT}`;

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


App.listen(PORT);
App.get("/", (request, response) => {
	response.redirect(`${SERVER_URI}/api`);
});
App.get("/api", (request, response) => {
	response.send("<h1>Welcome to my API</h1>");
});
App.get("/api/persons", (request, response) => {
    response.json(persons);
});
App.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);

    if (person) {
       return response.json(person);
    }
    
    response.statusMessage = "That person is not in the phonebook";
    response.status(404).end();
});
App.get("/info", (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `)
});

console.log(`App starting at: http://localhost:${PORT}`);
