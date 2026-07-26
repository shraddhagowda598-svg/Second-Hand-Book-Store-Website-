import React, { useEffect, useState } from 'react';
import * as categoriesApi from '../../api/categories';
import * as booksApi from '../../api/books';
import StarRating from '../../components/StarRating.jsx';

export default function BuyerCategories({ addToCart }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    categoriesApi.getCategories().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setLoadingBooks(true);
    booksApi
      .getBooks({ category: selectedCategory._id, limit: 24 })
      .then((res) => setBooks(res.books))
      .finally(() => setLoadingBooks(false));
  }, [selectedCategory]);

  return (
    <div>
      <div className="panel-header">
        <h1>Book Categories</h1>
        <p>Browse books by category - Click on any category to see available books</p>
      </div>
      <div className="panel-content">
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category._id}
              className={`category-card ${selectedCategory?._id === category._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-details">
                <h3 className="category-title">{category.name}</h3>
                <p className="category-description">{category.description || 'Browse this category'}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div style={{ marginTop: '40px' }}>
            <div className="panel-header" style={{ marginBottom: '20px' }}>
              <h2>{selectedCategory.name}</h2>
              <p>{loadingBooks ? 'Loading...' : `${books.length} books found`}</p>
            </div>

            {!loadingBooks && books.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3>No books in this category yet</h3>
                <p>Check back soon, or browse another category</p>
              </div>
            ) : (
              <div className="featured-books-grid">
                {books.map((book) => (
                  <div key={book._id} className="featured-book-card">
                    <div className="book-image-container">
                      <img
                        src={
                          book.images && book.images[0]
                            ? book.images[0]
                            : 'https://placehold.co/300x400?text=No+Image'
                        }
                        alt={book.title}
                        className="book-image"
                      />
                      <div className="book-language">{book.language}</div>
                    </div>
                    <div className="book-details">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <p style={{ fontSize: '14px', color: '#6C757D', marginBottom: '10px', lineHeight: '1.4' }}>
                        {book.description}
                      </p>

                      <div className="book-rating">
                        <StarRating rating={book.ratingAverage} />
                        <span className="rating-value">{book.ratingAverage}/5</span>
                      </div>

                      <div className="book-price">₹{book.finalPrice}</div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6C757D',
                          marginBottom: '15px',
                          padding: '5px',
                          backgroundColor: '#F8F9FA',
                          borderRadius: '4px',
                        }}
                      >
                        📖 Condition: <strong>{book.condition}</strong>
                      </div>

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
        )}

        {!selectedCategory && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6C757D' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
            <h3>Explore Our Book Collection</h3>
            <p style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto 30px' }}>
              Click on any category above to discover amazing books. Each category contains carefully
              selected second-hand books in excellent condition.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
