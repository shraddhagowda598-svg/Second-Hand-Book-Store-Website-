import React, { useEffect, useState } from 'react';
import * as booksApi from '../../api/books';
import * as categoriesApi from '../../api/categories';

const initialState = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  category: '',
  language: 'English',
  condition: 'Good',
  description: '',
  price: '',
  discount: '0',
  stock: '1',
};

export default function SellerAddBook({ onSaved }) {
  const [bookData, setBookData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!bookData.title.trim() || !bookData.author.trim() || !bookData.category) {
      setMessage('Please fill in title, author, and category.');
      return;
    }
    if (!bookData.price || isNaN(bookData.price) || parseFloat(bookData.price) <= 0) {
      setMessage('Please enter a valid price.');
      return;
    }
    if (images.length === 0) {
      setMessage('Please upload at least one book image.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(bookData).forEach(([key, value]) => formData.append(key, value));
      images.forEach((img) => formData.append('images', img));

      await booksApi.createBook(formData);
      setMessage('Book submitted for admin approval!');
      setBookData(initialState);
      setImages([]);
      setPreviews([]);
      if (onSaved) onSaved();
    } catch (err) {
      setMessage(err.friendlyMessage || 'Could not add book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Add a Book</h1>
        <p>List a second-hand book for sale — new listings need admin approval before they go live</p>
      </div>
      <div className="panel-content">
        <form onSubmit={handleSubmit} className="checkout-form-grid">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" name="title" value={bookData.title} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Author</label>
            <input className="form-input" name="author" value={bookData.author} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Publisher</label>
            <input className="form-input" name="publisher" value={bookData.publisher} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">ISBN</label>
            <input className="form-input" name="isbn" value={bookData.isbn} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" name="category" value={bookData.category} onChange={handleInputChange} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-input" name="language" value={bookData.language} onChange={handleInputChange}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Condition</label>
            <select className="form-input" name="condition" value={bookData.condition} onChange={handleInputChange}>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Acceptable">Acceptable</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input className="form-input" type="number" name="price" value={bookData.price} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Discount (%)</label>
            <input className="form-input" type="number" name="discount" value={bookData.discount} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input className="form-input" type="number" name="stock" value={bookData.stock} onChange={handleInputChange} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" rows={4} value={bookData.description} onChange={handleInputChange} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Book Images (up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="preview" style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                ))}
              </div>
            )}
          </div>
          {message && (
            <div style={{ gridColumn: '1 / -1', color: message.includes('approval') ? '#28A745' : '#D9534F' }}>
              {message}
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
