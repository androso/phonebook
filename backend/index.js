// TODO STEPS
// Add logic to put/update a number of a name already in the phonebook

require("dotenv").config();
const express = require("express");
const App = express();
const PORT = process.env.PORT;
const Person = require("./models/Person");
const morgan = require("morgan");
const crypto = require("crypto");
const requestLogger = (request, response, next) => {
	console.log("Method:", request.method);
	console.log("Path:  ", request.path);
	console.log("Body:  ", request.body);
	console.log("---");
	next();
};
const cors = require("cors");
const mongoose = require("mongoose");

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
App.get("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	Person.findById(id).then((person) => response.json(person));

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

App.post("/api/persons", async (request, response) => {
	const person = request.body;
	if (!person) {
		return response.status(400).json({ error: "data is missing" });
	} else if (!person.name || !person.phoneNumber) {
		return response.status(400).json({ error: "data is not complete" });
	}

	//TODO Add some form of validation to prevent duplicates
	// const dataAlreadyExists = alreadyExists(person, persons);

	// if (dataAlreadyExists === "name" || dataAlreadyExists === "phoneNumber") {
	// 	return response
	// 		.status(400)
	// 		.json({ error: `${dataAlreadyExists} is already in the phonebook` });
	// }

	const newPerson = new Person({
		name: person.name,
		phoneNumber: person.phoneNumber,
	});
	await newPerson.save();

	response.status(200).location(`/api/persons/${newPerson.id}`).end();
});

App.put("/api/persons/:id", async (request, response) => {
	//This only updates the phonenumber, do we need to update names? i don't think so
	//TODO It only shows big error when the id is not a valid number for Mongoose, if it's equivalent, then we can handle the error ok.
	// Maybe chechking if the id can convert to ObjectId, if not return false, else continue?
	const id = request.params.id;
	const newPhoneNumber = request.body.phoneNumber;
	const updatingPerson = await Person.findById(id);

	if (!updatingPerson) {
		console.log('Find a way to handle Errors like this one');
		response.statusMessage = "That person is not in the phonebook";
		response.status(404).end();
	} else {
		updatingPerson.phoneNumber = newPhoneNumber;
		await updatingPerson.save();
		response.status(204);
		response.end();
	}
});
console.log(`App starting at: http://localhost:${PORT}`);

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};
App.use(unknownEndpoint);

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
