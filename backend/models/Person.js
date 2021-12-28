const mongoose = require("mongoose");
const DB_URI = process.env.DBATREIDES_URI;

//We connect to the database
//We create a Schema w the values & type of values to be stored in a Document
//We then create a model
//We export that model

mongoose
	.connect(DB_URI)
	.then((results) => console.log("Connected to MongoDB"))
	.catch((error) => {
		console.log("Something went wrong, couldn't connect to DB");
		console.error(error);
	});

const personSchema = new mongoose.Schema({
	name: String,
	phoneNumber: String,
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model("Person", personSchema);

