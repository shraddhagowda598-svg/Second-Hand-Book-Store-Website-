import React from 'react';

export default function StarRating({ rating = 0 }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="star">
        ★
      </span>
    );
  }
  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star">
        ★
      </span>
    );
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="star" style={{ color: '#E0E0E0' }}>
        ★
      </span>
    );
  }
  return <div className="stars">{stars}</div>;
}
