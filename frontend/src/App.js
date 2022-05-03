import { useEffect, useState } from "react";
import axios from "axios";
import { catchErrors } from "./utils";
import Notification from "./components/Notification";
import "./App.css";

const serverURI = "/api";

const App = () => {
	//Initial States
	const [persons, setPersons] = useState([]);
	const [newName, setNewName] = useState("");
	const [newPhoneNumber, setNewPhoneNumber] = useState("");
	const [validPersons, setValidPersons] = useState(persons);
	const [alreadyRemoved, setAlreadyRemoved] = useState({
		status: false,
		message: "",
	});
	const [isSuccess, setIsSuccess] = useState(false);
	const [generalError, setGeneralError] = useState("");

	useEffect(() => {
		const fetchInitialData = async () => {
			const personsData = await axios.get(`${serverURI}/persons`);
			setPersons(personsData.data);
			setValidPersons(personsData.data);
		};
		catchErrors(fetchInitialData);
	}, []);

	//Helper Functions & Event Handlers
	const searchPerson = (event) => {
		//setValidPersons to only those who pass the test of including event.target;
		const searchQuery = event.target.value.toLowerCase();
		const possibleMatches = persons.filter((person) =>
			person.name.toLowerCase().includes(searchQuery)
		);
		setValidPersons(possibleMatches);
	};

	const submitPerson = (event) => {
		event.preventDefault();
		let newPerson = {
			name: newName,
			phoneNumber: newPhoneNumber,
		};

		// if (alreadyExists(newPerson, persons) === "name") {
		// 	if (
		// 		window.confirm(
		// 			`${newName} is already in the phonebook, replace the old number with a new one?`
		// 		)
		// 	) {
		// 		updateNumber(newPerson);
		// 		return true;
		// 	} else {
		// 		return false;
		// 	}
		// } else if (alreadyExists(newPerson, persons) === "phoneNumber") {
		// 	alert(`${newPhoneNumber} is already in the phonebook!`);
		// 	return false;
		// }

		const sendPerson = async () => {
			// We shouldn't retrieve the object just posted based on REST principles, thus we get the location of the person we just sent and
			// update our states.
			const { headers } = await axios
				.post(`${serverURI}/persons`, newPerson)
				.catch((error) => {
					setGeneralError(error.response.data);
					setTimeout(() => {
						setGeneralError("");
					}, 4000);
					setNewName("");
					setNewPhoneNumber("");
				});
			if (headers) {
				newPerson = await (await axios.get(headers.location)).data;
				setPersons([...persons, newPerson]);
				setValidPersons((prevValid) => [...prevValid, newPerson]);
				setNewName("");
				setNewPhoneNumber("");
				setIsSuccess(true);
				setTimeout(() => {
					setIsSuccess(false);
				}, 3000);
			}
		};
		catchErrors(sendPerson);
	};

	const deletePerson = (id, personName) => {
		const deleteFromServer = async () => {
			const { data } = await axios.delete(`${serverURI}/persons/${id}`);
			const updatedPersonsList = persons.filter((person) => person.id !== id);
			setPersons(updatedPersonsList);
			setValidPersons(updatedPersonsList);
		};

		//get an arr with all persons minues the one we just deleted
		if (window.confirm(`Delete ${personName}?`)) {
			const failure = catchErrors(deleteFromServer);
		}
	};
	const updateNumber = async (newPerson) => {
		const replacingPerson = persons.find(
			(person) => newPerson.name.toLowerCase() === person.name.toLowerCase()
		);
		// console.log(newPerson, replacingPerson);

		const setNumber = async () => {
			await axios.put(`/api/persons/${replacingPerson.id}`, newPerson);
			const dbPersons = await (await axios.get(`${serverURI}/persons`)).data;

			setPersons([...dbPersons]);
			setValidPersons([...dbPersons]);
			setNewName("");
			setNewPhoneNumber("");
		};
		const failure = await catchErrors(setNumber);
		if (failure) {
			setAlreadyRemoved({
				state: true,
				message: `${replacingPerson.name} has already been removed, please refresh`,
			});
			setTimeout(() => {
				setAlreadyRemoved({
					state: false,
					message: "",
				});
			}, 3000);
		}
	};
	return (
		<div>
			<h2>Phonebook</h2>
			{alreadyRemoved.state && (
				<Notification type="error" message={alreadyRemoved.message} />
			)}
			{isSuccess && (
				<Notification
					type="success"
					message={"Person was added succesfully!"}
				/>
			)}
			{generalError.error && (
				<Notification type="error" message={generalError.error} />
			)}
			<FilterInput searchPerson={searchPerson} />
			<h2>Add a new</h2>
			<form>
				<AddPerson
					submitPerson={submitPerson}
					setNewPhoneNumber={setNewPhoneNumber}
					setNewName={setNewName}
					newName={newName}
					newPhoneNumber={newPhoneNumber}
				/>
			</form>
			<h2>Numbers</h2>
			<ul>
				<PersonsList validPersons={validPersons} deletePerson={deletePerson} />
			</ul>
		</div>
	);
};

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
function FilterInput({ searchPerson }) {
	return (
		<label htmlFor="searchBox">
			filter by name:
			<input
				type="text"
				id="searchBox"
				onChange={(event) => searchPerson(event)}
			/>
		</label>
	);
}
function AddPerson({
	submitPerson,
	setNewName,
	setNewPhoneNumber,
	newName,
	newPhoneNumber,
}) {
	return (
		<>
			<div>
				name:
				<input
					value={newName}
					onChange={(event) => setNewName(event.target.value)}
				/>
				Number:
				<input
					value={newPhoneNumber}
					onChange={(event) => setNewPhoneNumber(event.target.value)}
					type="number"
				/>
			</div>
			<div>
				<button type="submit" onClick={submitPerson}>
					add
				</button>
			</div>
		</>
	);
}
function PersonsList({ validPersons, deletePerson }) {
	return validPersons.map((person) => (
		<li key={person.id}>
			{person.name} || {person.phoneNumber}
			<button
				className="phonebook-list__delete"
				onClick={() => {
					deletePerson(person.id, person.name);
				}}
			>
				Delete
			</button>
		</li>
	));
}
export default App;
