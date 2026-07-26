import React, { useEffect, useState } from 'react';
import * as booksApi from '../../api/books';

export default function AdminManageBooks() {
  const [books, setBooks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    booksApi
      .getBooks({ status: filterStatus === 'all' ? 'all' : filterStatus, limit: 100 })
      .then((res) => setBooks(res.books))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleApprove = async (id) => {
    await booksApi.approveBook(id);
    load();
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:') || 'Did not meet listing guidelines';
    await booksApi.rejectBook(id, reason);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book listing?')) return;
    await booksApi.deleteBook(id);
    load();
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Manage Books</h1>
        <p>Approve, reject, or remove book listings</p>
      </div>
      <div className="panel-content">
        <div className="form-group" style={{ maxWidth: '250px' }}>
          <label className="form-label">Filter by status</label>
          <select className="form-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        {loading ? (
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No books here</h3>
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
                </div>
                <div className="book-details">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <p style={{ fontSize: '13px' }}>Seller: {book.seller?.name}</p>
                  <div className="book-price">₹{book.finalPrice}</div>
                  <span className="status-badge">{book.status}</span>
                  <div className="book-actions" style={{ marginTop: '10px', flexWrap: 'wrap' }}>
                    {book.status !== 'approved' && (
                      <button className="btn-small btn-primary" onClick={() => handleApprove(book._id)}>
                        Approve
                      </button>
                    )}
                    {book.status !== 'rejected' && (
                      <button className="btn-small btn-outline" onClick={() => handleReject(book._id)}>
                        Reject
                      </button>
                    )}
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
