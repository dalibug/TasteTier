import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowsRotate, faBug } from '@fortawesome/free-solid-svg-icons';
import UserTierLists from './UserTierLists';
import '../styles/TierLists.css';

const UserTierListsModal = ({ isOpen, onClose, onRefresh, isAdmin, onDebug }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tier-lists-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <h2 className="modal-title">Your Saved Tier Lists</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button className="refresh-btn" onClick={onRefresh}>
            <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
          </button>
          
          {isAdmin && (
            <button 
              className="debug-btn" 
              onClick={onDebug}
              style={{ marginLeft: '10px', background: '#dc3545' }}
            >
              <FontAwesomeIcon icon={faBug} /> Debug
            </button>
          )}
        </div>
        
        <div className="modal-body">
          <UserTierLists />
        </div>
      </div>
    </div>
  );
};

export default UserTierListsModal; 