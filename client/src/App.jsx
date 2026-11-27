import { useState, useEffect } from 'react'
import personService from './services/person'
import Notification from './components/Notifcation'

const Filter = (props) => {
  return (
    <form>
      <div>
        filter shown with:
        <input value={props.filter} onChange={props.filterChange} />
      </div>
    </form>
  )
}

const PeopleForm = (props) => {
  return (
    <form>
      <div>
        name: <input value={props.name} onChange={props.nameChange} />
      </div>
      <div>
        number: <input value={props.number} onChange={props.numberChange} />
      </div>
      <div>
        <button type='submit' onClick={props.submit}>
          add
        </button>
      </div>
    </form>
  )
}

const Person = ({ person, handle }) => {
  return (
    <div key={person.id}>
      {person.name} {person.number}
      <button onClick={handle} value={person.id}>
        delete
      </button>
    </div>
  )
}

const Numbers = (props) => {
  const people = props.persons.filter((person) =>
    person.name.toLowerCase().includes(props.filter.toLowerCase()),
  )

  return (
    <>
      {people.map((person) => (
        <Person key={person.id} person={person} handle={props.handleRemoval} />
      ))}
    </>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterName, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState(null)

  useEffect(() => {
    console.log('effect')
    personService.getAll().then((response) => {
      setPersons(response)
    })
  }, [])

  const callNotification = (message, type = null) => {
    setNotification(message)
    setNotificationType(type)
    setTimeout(() => {
      setNotification(null)
      setNotificationType(null)
    }, 5000)
  }

  const AddPerson = (event) => {
    event.preventDefault()
    if (newName) {
      const search = persons.filter(
        (p) => p.name.toLowerCase() === newName.toLowerCase(),
      )
      if (search.length === 0) {
        const nameObject = {
          name: newName,
          number: newNumber,
        }

        personService.create(nameObject).then((response) => {
          setPersons(persons.concat(response))
        })

        callNotification(`Added ${newName}`)

        setNewName('')
        setNewNumber('')
      } else {
        updatePerson(search[0])
      }
    } else {
      callNotification('blank name', 'w')
    }
  }

  const updatePerson = (change) => {
    console.log(change)
    if (
      window.confirm(
        `${change.name} is already added to the phonebook, do you want to replace the old number with the new one?`,
      )
    ) {
      personService
        .update(change.id, { ...change, number: newNumber })
        .then((response) =>
          setPersons(persons.map((p) => (p.id !== change.id ? p : response))),
        )
        .catch(() => {
          setPersons(persons.filter((n) => n.id !== change.id))
          callNotification(
            `Information of ${change.name} has already been removed from the server`,
            'w',
          )
        })

      callNotification(`Updated ${change.name}`)

      setNewName('')
      setNewNumber('')
    }
  }

  const removePerson = (event) => {
    const id = event.target.value
    const person = persons.filter((n) => n.id === id)[0]
    if (window.confirm(`delete ${person.name}`)) {
      personService
        .remove(id)
        .then(() => setPersons(persons.filter((n) => n.id !== id)))

      callNotification(`removed ${person.name}`, 'w')
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification type={notificationType} message={notification} />
      <Filter filter={filterName} filterChange={handleFilterChange} />
      <h2>Add a person:</h2>
      <PeopleForm
        name={newName}
        nameChange={handleNameChange}
        number={newNumber}
        numberChange={handleNumberChange}
        submit={AddPerson}
      />
      <h2>Numbers</h2>
      <Numbers
        persons={persons}
        filter={filterName}
        handleRemoval={removePerson}
      />
    </div>
  )
}

export default App
