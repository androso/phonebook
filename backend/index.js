// TODO STEPS
// Add logic to put/update a number of a name already in the phonebook

require("dotenv").config();
const express = require("express");
const App = express();
const PORT = process.env.PORT;
const Person = require("./models/Person");
const morgan = require("morgan");

const cors = require("cors");

morgan.token("content", (request, response) => {
	return `${JSON.stringify(request.body)}`;
});
App.use(express.static("build"));
App.use(cors());
App.use(express.json());
App.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms :content"
	)
);

App.listen(PORT);
App.get("/api", (request, response) => {
	response.send("<h1>Welcome to my API</h1>");
});
App.get("/api/persons", (request, response) => {
	Person.find({}).then((results) => response.json(results));
});
App.get("/api/persons/:id", (request, response, next) => {
	const id = request.params.id;
	Person.findById(id)
		.then((person) => response.json(person))
		.catch((error) => next(error));

	// response.statusMessage = "That person is not in the phonebook";
	// response.status(404).end();
});
App.get("/info", async (request, response) => {
	const personsLength = await Person.count({});
	response.send(`
        <p>Phonebook has info for ${personsLength} people</p>
        <p>${new Date()}</p>
    `);
});

App.delete("/api/persons/:id", async (request, response) => {
	const id = request.params.id;
	await Person.deleteOne({ _id: id });
	response.status(204).end();
});

App.post("/api/persons", async (request, response, next) => {
	const person = request.body;
	if (!person) {
		return response.status(400).json({ error: "data is missing" });
	} else if (!person.name || !person.phoneNumber) {
		return response.status(400).json({ error: "data is not complete" });
	}

	//TODO Add some form of validation to prevent duplicates
	const newPerson = new Person({
		name: person.name,
		phoneNumber: person.phoneNumber,
	});
	await newPerson
		.save()
		.then((savedPerson) =>
			response.status(200).location(`/api/persons/${newPerson.id}`).end()
		)
		.catch((error) => next(error));
});

App.put("/api/persons/:id", async (request, response, next) => {
	const id = request.params.id;
	const newPhoneNumber = request.body.phoneNumber;
	const updatingPerson = await Person.findById(id);

	if (!updatingPerson) {
		response.statusMessage = "That person is not in the phonebook";
		response.status(404).end();
	} else {
		updatingPerson.phoneNumber = newPhoneNumber;
		updatingPerson
			.save()
			.then((updatedPerson) => response.status(204).end())
			.catch((error) => {
				console.log("passing to next");
				next(error);
			});
	}
});
console.log(`App starting at: http://localhost:${PORT}`);

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};
App.use(unknownEndpoint);

const myErrorHandler = (error, request, response, next) => {
	if (error.name === "CastError") {
		return response.status(400).send({ error: "Malformatted ID" });
	} else if (error.name === "ValidationError") {
		console.log("inside the myErrorHandler");
		return response.status(403).send({ error: error.message });
	}
	next(error);
};
App.use(myErrorHandler);
