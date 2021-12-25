const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>');
    process.exit(1);
}

const password = process.argv[2];
const uri = `mongodb+srv://atreides:${password}@cluster0.zrx84.mongodb.net/phonebook-app?retryWrites=true&w=majority`;
mongoose.connect(uri);

const personSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,  
})
const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 5) {
    
    const name = process.argv[3];
    const phoneNumber = process.argv[4];

    const newNote = new Person({
        name: name,
        phoneNumber: phoneNumber
    });

    newNote.save().then(results => {
        console.log(`added ${name} number ${phoneNumber} to phonebook`);
        mongoose.connection.close();
    });

} else if (process.argv.length === 3) {
    // log all the entries in the phonebook
    Person.find({}).then(results => {
        console.log(results);
        mongoose.connection.close();
    })
} else {
    console.log('Please provide the right amount of arguments for your query');
    console.log('To get all data use: node mongo.js <password>');
    console.log('To post data use: node mongo.js <password> <name> <phoneNumber');
    console.log('If you want to post a full name, use "<full Name>"');
    mongoose.connection.close();
}