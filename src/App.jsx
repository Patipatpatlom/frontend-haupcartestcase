import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

function CarList() {
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
          {cars.map((car, index) => {
            const carId = car.id || car._id || index;
            return (
              <li key={carId} className="car-item">
                <Link to={`/car/${carId}`}>
                  {JSON.stringify(car)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/cars/${id}`)
      .then(response => response.json())
      .then(data => setCar(data.data || data))
      .catch(error => console.error(error));
  }, [id]);

  return (
    <div className="container">
      <div className="card">
        <button onClick={() => navigate(-1)} className="btn-submit" style={{ marginBottom: '20px' }}>
          Back
        </button>
        <h1>Car Detail</h1>
        {car ? (
          <div>
            <pre>{JSON.stringify(car, null, 2)}</pre>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CarList />} />
        <Route path="/car/:id" element={<CarDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
