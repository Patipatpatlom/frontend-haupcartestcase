import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">HAUP<span>CAR</span> <span style={{ fontSize: '13px', fontWeight: 400, color: '#888' }}>Admin</span></Link>
    </nav>
  );
}

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
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">จัดการข้อมูลรถ</h1>

        <div className="card">
          <h2>เพิ่มรถใหม่</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>ยี่ห้อรถ (Brand)</label>
                <input name="brand" placeholder="เช่น Toyota" value={formData.brand} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>รุ่น (Model)</label>
                <input name="model" placeholder="เช่น Fortuner" value={formData.model} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังบันทึก...' : '+ เพิ่มรถ'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2>รายการรถทั้งหมด <span className="badge">{cars.length} คัน</span></h2>
          {listError ? (
            <p className="error-text">{listError}</p>
          ) : cars.length === 0 ? (
            <p className="empty-text">ยังไม่มีข้อมูลรถ</p>
          ) : (
            <div className="car-grid">
              {cars.map((car, index) => {
                const carId = car.id || car._id || index;
                const imgQuery = encodeURIComponent(`${car.brand || 'car'} ${car.carModel || car.model || ''}`);
                return (
                  <Link to={`/car/${carId}`} key={carId} className="car-card">
                    <div className="car-card-img-wrap">
                      <img
                        src={`https://loremflickr.com/400/220/${imgQuery},car,automobile?lock=${carId}`}
                        alt={`${car.brand} ${car.carModel}`}
                        className="car-card-img"
                        onError={e => { e.target.src = 'https://loremflickr.com/400/220/car,automobile'; }}
                      />
                    </div>
                    <div className="car-card-body">
                      <div className="car-card-brand">{car.brand || 'N/A'}</div>
                      <div className="car-card-model">{car.carModel || car.model || '-'}</div>
                      <div className="car-card-plate">🚗 {car.licenseplate || car.licensePlate || '-'}</div>
                      {car.remarks && <div className="car-card-remarks">{car.remarks}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
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
    if (window.confirm('ยืนยันการลบรถคันนี้?')) {
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
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">รายละเอียดรถ</h1>

        <div className="card">
          <div className="btn-row">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">← กลับ</button>
            {car && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn btn-blue"
                >
                  {isEditing ? 'ยกเลิกแก้ไข' : '✏️ แก้ไข'}
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'กำลังลบ...' : '🗑 ลบข้อมูล'}
                </button>
              </>
            )}
          </div>

          <hr className="divider" />

          {detailError ? (
            <p className="error-text">{detailError}</p>
          ) : isEditing ? (
            <form onSubmit={handleEditSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>ยี่ห้อรถ (Brand)</label>
                  <input name="brand" placeholder="Brand" value={editFormData.brand} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>รุ่น (Model)</label>
                  <input name="model" placeholder="Model" value={editFormData.model} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'กำลังบันทึก...' : '💾 บันทึก'}
                </button>
              </div>
            </form>
          ) : car ? (
            <pre className="detail-pre">{JSON.stringify(car, null, 2)}</pre>
          ) : (
            <p className="loading-text">กำลังโหลด...</p>
          )}
        </div>
      </div>
    </>
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
