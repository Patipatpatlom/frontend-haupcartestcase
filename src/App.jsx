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
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ brand: '', model: '' });

  const fetchCar = () => {
    fetch(`http://localhost:3000/cars/${id}`)
      .then(response => response.json())
      .then(data => {
        const carData = data.data || data;
        setCar(carData);
        setEditFormData({ brand: carData.brand || '', model: carData.model || '' });
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('ยืนยันการลบ?')) {
      fetch(`http://localhost:3000/cars/${id}`, { method: 'DELETE' })
        .then(response => {
          if (response.ok) {
            alert('ลบสำเร็จ');
            navigate('/');
          } else {
            alert('ลบไม่สำเร็จ');
          }
        })
        .catch(error => console.error(error));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/cars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData)
    })
    .then(response => {
      if (response.ok) {
        alert('แก้ไขสำเร็จ');
        setIsEditing(false);
        fetchCar();
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    })
    .catch(error => console.error(error));
  };

  const handleChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">
      <div className="card">
        <button onClick={() => navigate(-1)} className="btn-submit" style={{ marginBottom: '20px', marginRight: '10px' }}>
          Back
        </button>
        {car && (
          <>
            <button onClick={() => setIsEditing(!isEditing)} className="btn-submit" style={{ marginBottom: '20px', marginRight: '10px', backgroundColor: '#2196F3' }}>
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            <button onClick={handleDelete} className="btn-submit" style={{ marginBottom: '20px', backgroundColor: '#f44336' }}>
              Delete
            </button>
          </>
        )}
        <h1>Car Detail</h1>
        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <input name="brand" placeholder="Brand" value={editFormData.brand} onChange={handleChange} />
              <input name="model" placeholder="Model" value={editFormData.model} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-submit">Save</button>
          </form>
        ) : (
          car ? (
            <div>
              <pre>{JSON.stringify(car, null, 2)}</pre>
            </div>
          ) : (
            <p>Loading...</p>
          )
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
