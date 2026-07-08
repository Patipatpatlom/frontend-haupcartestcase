import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({ brand: '', model: '' });

  const fetchCars = () => {
    fetch('http://localhost:3000/cars')
      .then(response => response.json())
      .then(data => setCars(data.data || []))
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (response.ok) {
        alert('สำเร็จ');
        fetchCars();
        setFormData({ brand: '', model: '' });
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    })
    .catch(error => console.error(error));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create Car</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} />
            <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-submit">Submit</button>
        </form>
      </div>

      <div className="card">
        <h1>Cars List</h1>
        <ul className="car-list">
          {cars.map((car, index) => (
            <li key={index} className="car-item">
              {JSON.stringify(car)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
