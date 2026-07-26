import React, { useEffect, useState } from 'react';
import * as booksApi from '../../api/books';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SellerMyBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    booksApi
      .getBooks({ seller: user._id, status: 'all', limit: 100 })
      .then((res) => setBooks(res.books))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await booksApi.deleteBook(id);
      load();
    } catch (err) {
      alert(err.friendlyMessage || 'Could not delete book');
    }
  };

  const statusColor = { pending: '#F0AD4E', approved: '#28A745', rejected: '#D9534F' };

  return (
    <div>
      <div className="panel-header">
        <h1>My Books</h1>
        <p>Manage your book listings</p>
      </div>
      <div className="panel-content">
        {loading ? (
          <p>Loading your books...</p>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No books listed yet</h3>
            <p>Use "Add Book" to list your first book</p>
          </div>
        ) : (
          <div className="featured-books-grid">
            {books.map((book) => (
              <div key={book._id} className="featured-book-card">
                <div className="book-image-container">
                  <img
                    src={book.images && book.images[0] ? book.images[0] : 'https://placehold.co/300x400?text=No+Image'}
                    alt={book.title}
                    className="book-image"
                  />
                  <div className="book-language">{book.language}</div>
                </div>
                <div className="book-details">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <div className="book-price">₹{book.finalPrice}</div>
                  <p style={{ fontSize: '13px', marginBottom: '10px' }}>Stock: {book.stock}</p>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: statusColor[book.status], color: 'white' }}
                  >
                    {book.status}
                  </span>
                  {book.status === 'rejected' && book.rejectionReason && (
                    <p style={{ fontSize: '12px', color: '#D9534F', marginTop: '6px' }}>
                      Reason: {book.rejectionReason}
                    </p>
                  )}
                  <div className="book-actions" style={{ marginTop: '10px' }}>
                    <button className="btn-small btn-outline" onClick={() => handleDelete(book._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
