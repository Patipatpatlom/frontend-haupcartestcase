import { useState, useEffect } from 'react';

function App() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/cars')
      .then(response => response.json())
      .then(data => setCars(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Cars List</h1>
      <ul>
        {cars.map((car, index) => (
          <li key={index}>
            {JSON.stringify(car)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
