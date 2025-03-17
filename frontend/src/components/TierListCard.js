import React from 'react';
import { Link } from 'react-router-dom';

const TierListCard = ({ tierList, onToggleVisibility, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="tierlist-card">
      <div className="tierlist-header">
        <div className="header-content">
          <h3 className="tierlist-name">{tierList.name}</h3>
          <span className="category-name">
            {tierList.category ? tierList.category.name : 'Uncategorized'}
          </span>
          {tierList.challenge && (
            <span className="challenge-badge">
              Week {tierList.challenge.weekNumber}/{tierList.challenge.year}
            </span>
          )}
        </div>
        <div className="visibility-badge">
          {tierList.isPublic ? 'Public' : 'Private'}
        </div>
      </div>
      
      <div className="tierlist-preview">
        {tierList.items && tierList.items.length > 0 ? (
          <div className="preview-items">
            {tierList.items.slice(0, 3).map((item, index) => (
              <div key={index} className="preview-item">
                <span className="item-name">{item.originalItem.name}</span>
                <span className={`tier-badge ${item.tier.name.toLowerCase()}`}>
                  {item.tier.name}
                </span>
              </div>
            ))}
            {tierList.items.length > 3 && (
              <div className="more-items">+{tierList.items.length - 3} more</div>
            )}
          </div>
        ) : (
          <div className="empty-preview">No items in this tier list</div>
        )}
      </div>
      
      <div className="tierlist-footer">
        <div className="tierlist-dates">
          <span className="created-date">
            Created: {formatDate(tierList.createdAt)}
          </span>
          <span className="modified-date">
            Modified: {formatDate(tierList.lastModified)}
          </span>
        </div>
        <div className="tierlist-actions">
          <Link to={`/tierlists/${tierList.tierlistId}`} className="action-btn view-btn">
            View
          </Link>
          <Link to={`/tierlists/${tierList.tierlistId}/edit`} className="action-btn edit-btn">
            Edit
          </Link>
          <button 
            onClick={() => onToggleVisibility(tierList.tierlistId)} 
            className="action-btn visibility-btn"
          >
            {tierList.isPublic ? 'Make Private' : 'Make Public'}
          </button>
          <button 
            onClick={() => onDelete(tierList.tierlistId)} 
            className="action-btn delete-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierListCard; 