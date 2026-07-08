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
  const [editFormData, setEditFormData] = useState({ brand: '', carModel: '', licenseplate: '', remarks: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const getDefaultImg = (carData) => {
    const q = encodeURIComponent(`${carData.brand || 'car'} ${carData.carModel || ''}`);
    return `https://loremflickr.com/800/400/${q},car,automobile?lock=${id}`;
  };

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
        setEditFormData({
          brand: carData.brand || '',
          carModel: carData.carModel || '',
          licenseplate: carData.licenseplate || '',
          remarks: carData.remarks || '',
          imageUrl: localStorage.getItem(`car_img_${id}`) || ''
        });
        const savedImg = localStorage.getItem(`car_img_${id}`);
        setImageUrl(savedImg || getDefaultImg(carData));
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
            localStorage.removeItem(`car_img_${id}`);
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
    const { imageUrl: imgVal, ...bodyData } = editFormData;
    fetch(`http://localhost:3000/cars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
    .then(response => {
      if (response.ok) {
        if (imgVal) {
          localStorage.setItem(`car_img_${id}`, imgVal);
          setImageUrl(imgVal);
        } else {
          localStorage.removeItem(`car_img_${id}`);
        }
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

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="detail-img-wrap">
            <img
              src={imageUrl}
              alt={car ? `${car.brand} ${car.carModel}` : 'car'}
              className="detail-img"
              onError={e => { e.target.src = 'https://loremflickr.com/800/400/car,automobile'; }}
            />
          </div>

          <div style={{ padding: '24px' }}>
            <div className="btn-row">
              <button onClick={() => navigate(-1)} className="btn btn-secondary">← กลับ</button>
              {car && (
                <>
                  <button onClick={() => setIsEditing(!isEditing)} className="btn btn-blue">
                    {isEditing ? 'ยกเลิก' : '✏️ แก้ไข'}
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger" disabled={isDeleting}>
                    {isDeleting ? 'กำลังลบ...' : '🗑 ลบ'}
                  </button>
                </>
              )}
            </div>

            <hr className="divider" />

            {detailError ? (
              <p className="error-text">{detailError}</p>
            ) : isEditing ? (
              <form onSubmit={handleEditSubmit}>
                <div className="detail-fields">
                  <div className="form-group">
                    <label>ยี่ห้อรถ (Brand)</label>
                    <input name="brand" value={editFormData.brand} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>รุ่น (Model)</label>
                    <input name="carModel" value={editFormData.carModel} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>ป้ายทะเบียน</label>
                    <input name="licenseplate" value={editFormData.licenseplate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>หมายเหตุ (Remarks)</label>
                    <input name="remarks" value={editFormData.remarks} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>🖼 URL รูปภาพ (ถ้าไม่ใส่จะใช้รูปอัตโนมัติ)</label>
                    <input name="imageUrl" placeholder="https://example.com/car.jpg" value={editFormData.imageUrl} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ marginTop: '16px' }}>
                  {isSaving ? 'กำลังบันทึก...' : '💾 บันทึก'}
                </button>
              </form>
            ) : car ? (
              <div className="detail-fields">
                <div className="detail-field">
                  <div className="detail-field-label">ยี่ห้อ</div>
                  <div className="detail-field-value">{car.brand || '-'}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">รุ่น</div>
                  <div className="detail-field-value">{car.carModel || '-'}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">ป้ายทะเบียน</div>
                  <div className="detail-field-value">{car.licenseplate || '-'}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">หมายเหตุ</div>
                  <div className="detail-field-value">{car.remarks || '-'}</div>
                </div>
              </div>
            ) : (
              <p className="loading-text">กำลังโหลด...</p>
            )}
          </div>
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
