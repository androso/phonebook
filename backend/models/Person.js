const mongoose = require("mongoose");
const DB_URI = process.env.DBATREIDES_URI;
const uniqueValidator = require("mongoose-unique-validator");

mongoose
	.connect(DB_URI)
	.then((results) => console.log("Connected to MongoDB"))
	.catch((error) => {
		console.log("Something went wrong, couldn't connect to DB");
		console.error(error);
	});

const personSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true, minLength: 3},
	phoneNumber: { type: String, required: true, unique: true, minLength: 8},
});

personSchema.plugin(uniqueValidator);
personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		(returnedObject.id = returnedObject._id.toString()),
			delete returnedObject._id;
		delete returnedObject.__v;
	},
});

module.exports = mongoose.model("Person", personSchema);
