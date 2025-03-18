import React, { useState, useEffect } from 'react';
import '../styles/DatabaseTestModal.css';

function DatabaseTestModal({ isOpen, onClose }) {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [entities, setEntities] = useState([]);
  const [newEntity, setNewEntity] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test database connection
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8083/api/test-entities/test-connection');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (err) {
      setError('Failed to test connection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all entities
  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8083/api/test-entities');
      const data = await response.json();
      setEntities(data);
    } catch (err) {
      setError('Failed to fetch entities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new entity
  const createEntity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8083/api/test-entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntity),
      });
      const data = await response.json();
      setEntities([...entities, data]);
      setNewEntity({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create entity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an entity
  const deleteEntity = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`http://localhost:8083/api/test-entities/${id}`, {
        method: 'DELETE',
      });
      setEntities(entities.filter(entity => entity.id !== id));
    } catch (err) {
      setError('Failed to delete entity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete all entities
  const deleteAllEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('http://localhost:8083/api/test-entities', {
        method: 'DELETE',
      });
      setEntities([]);
    } catch (err) {
      setError('Failed to delete all entities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load entities on component mount
  useEffect(() => {
    if (isOpen) {
      fetchEntities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Database Testing</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <section className="connection-test">
            <h3>Database Connection Test</h3>
            <button onClick={testConnection} disabled={loading}>
              Test Connection
            </button>
            {connectionStatus && (
              <div className="connection-status">
                <p>Status: {connectionStatus.status}</p>
                <p>Message: {connectionStatus.message}</p>
                <p>Entity Count: {connectionStatus.entityCount}</p>
              </div>
            )}
          </section>

          <section className="entity-form">
            <h3>Create New Entity</h3>
            <form onSubmit={createEntity}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={newEntity.name}
                  onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={newEntity.description}
                  onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                Create Entity
              </button>
            </form>
          </section>

          <section className="entity-list">
            <h3>Entities</h3>
            <div className="button-group">
              <button onClick={fetchEntities} disabled={loading}>
                Refresh Entities
              </button>
              <button onClick={deleteAllEntities} disabled={loading}>
                Delete All Entities
              </button>
            </div>
            {entities.length === 0 ? (
              <p>No entities found.</p>
            ) : (
              <ul>
                {entities.map((entity) => (
                  <li key={entity.id}>
                    <strong>{entity.name}</strong>: {entity.description}
                    <button onClick={() => deleteEntity(entity.id)} disabled={loading}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Loading...</div>}
        </div>
      </div>
    </div>
  );
}

export default DatabaseTestModal; 