import React, { useEffect, useState } from 'react';
import * as booksApi from '../../api/books';
import StarRating from '../../components/StarRating.jsx';

export default function BuyerHome({ addToCart, searchQuery }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = searchQuery ? { search: searchQuery, limit: 24 } : { limit: 24, sort: 'popular' };
    booksApi
      .getBooks(params)
      .then((res) => setBooks(res.books))
      .catch((err) => setError(err.friendlyMessage || 'Could not load books'))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <div>
      <div className="panel-header">
        <h1>Welcome to BookMeUp</h1>
        <p>Find your next favorite book from our collection of second-hand books</p>
      </div>
      <div className="panel-content">
        <h2>{searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Books'}</h2>
        <p>
          {searchQuery
            ? `Found ${books.length} books matching your search`
            : 'Discover our handpicked selection of quality second-hand books'}
        </p>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <h3>Loading books...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Couldn't load books</h3>
            <p>{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No books found</h3>
            <p>Try adjusting your search terms or browse our categories</p>
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

                  <div className="book-rating">
                    <StarRating rating={book.ratingAverage} />
                    <span className="rating-value">{book.ratingAverage}/5</span>
                  </div>

                  <div className="book-price">₹{book.finalPrice}</div>

                  <div className="book-actions">
                    <button className="btn-small btn-primary" onClick={() => addToCart(book._id)}>
                      Add to Cart
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
