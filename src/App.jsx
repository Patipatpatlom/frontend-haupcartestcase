import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

function CarList() {
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({ brand: '', model: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listError, setListError] = useState(null);

  const fetchCars = () => {
    setListError(null);
    fetch('http://localhost:3000/cars')
      .then(response => {
        if (!response.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
        return response.json();
      })
      .then(data => setCars(data.data || []))
      .catch(error => setListError(error.message));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    fetch('http://localhost:3000/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    .catch(error => alert(error.message))
    .finally(() => setIsSubmitting(false));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create Car</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} required />
            <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึก...' : 'Submit'}
          </button>
        </form>
      </div>

      <div className="card">
        <h1>Cars List</h1>
        {listError ? (
          <p style={{ color: 'red' }}>{listError}</p>
        ) : (
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
        )}
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const fetchCar = () => {
    setDetailError(null);
    fetch(`http://localhost:3000/cars/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
        return response.json();
      })
      .then(data => {
        const carData = data.data || data;
        setCar(carData);
        setEditFormData({ brand: carData.brand || '', model: carData.model || '' });
      })
      .catch(error => setDetailError(error.message));
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('ยืนยันการลบ?')) {
      setIsDeleting(true);
      fetch(`http://localhost:3000/cars/${id}`, { method: 'DELETE' })
        .then(response => {
          if (response.ok) {
            alert('ลบสำเร็จ');
            navigate('/');
          } else {
            alert('ลบไม่สำเร็จ');
          }
        })
        .catch(error => alert(error.message))
        .finally(() => setIsDeleting(false));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
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
    .catch(error => alert(error.message))
    .finally(() => setIsSaving(false));
  };

  const handleChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="card">
        <button onClick={() => navigate(-1)} className="btn-submit" style={{ marginBottom: '20px', marginRight: '10px' }}>
          Back
        </button>
        {car && (
          <>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-submit"
              style={{ marginBottom: '20px', marginRight: '10px', backgroundColor: '#2196F3' }}
            >
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            <button
              onClick={handleDelete}
              className="btn-submit"
              style={{ marginBottom: '20px', backgroundColor: '#f44336' }}
              disabled={isDeleting}
            >
              {isDeleting ? 'กำลังลบ...' : 'Delete'}
            </button>
          </>
        )}
        <h1>Car Detail</h1>
        {detailError ? (
          <p style={{ color: 'red' }}>{detailError}</p>
        ) : isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <input name="brand" placeholder="Brand" value={editFormData.brand} onChange={handleChange} required />
              <input name="model" placeholder="Model" value={editFormData.model} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-submit" disabled={isSaving}>
              {isSaving ? 'กำลังบันทึก...' : 'Save'}
            </button>
          </form>
        ) : (
          car ? (
            <pre>{JSON.stringify(car, null, 2)}</pre>
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
