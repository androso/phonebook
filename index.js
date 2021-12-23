const express = require("express");
const res = require("express/lib/response");
const App = express();
const PORT = 3001;
const SERVER_URI = `http://localhost:${PORT}`;

const crypto = require('crypto');


App.use(express.json());
let persons = [
    { 
      "id": crypto.randomUUID(),
      "name": "Arto Hellas", 
      "phoneNumber": "040-123456"
    },
    { 
      "id": crypto.randomUUID(),
      "name": "Ada Lovelace", 
      "phoneNumber": "39-44-5323523"
    },
    { 
      "id": crypto.randomUUID(),
      "name": "Dan Abramov", 
      "phoneNumber": "12-43-234345"
    },
    { 
      "id": crypto.randomUUID(),
      "name": "Mary Poppendieck", 
      "phoneNumber": "39-23-6423122"
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
    
    const id = request.params.id;
    
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

App.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
})

App.post('/api/persons', (request, response) => {
    const person = request.body;
    if (!person) {
        return response.status(400).json({"error": "data is missing"});
    } else if (!person.name || !person.phoneNumber) {
        return response.status(400).json({"error": "data is not complete"});
    }
    const dataAlreadyExists = alreadyExists(person, persons);

    if (dataAlreadyExists === "name" || dataAlreadyExists === "phoneNumber") {
        return response.status(400).json({"error": `${dataAlreadyExists} is already in the phonebook`});
    }

    person.id = crypto.randomUUID();
    persons = persons.concat(person); 
})

console.log(`App starting at: http://localhost:${PORT}`);

function alreadyExists(newPerson, persons) {
	for (let person of persons) {
		if (
			person.name.toLowerCase() === newPerson.name.toLowerCase() ||
			person.phoneNumber === newPerson.phoneNumber
		) {
			return `${
				person.phoneNumber === newPerson.phoneNumber ? "phoneNumber" : "name"
			}`;
		}
	}
}