import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
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
      const response = await fetch('http://localhost:8081/api/test-entities/test-connection');
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
      const response = await fetch('http://localhost:8081/api/test-entities');
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
      const response = await fetch('http://localhost:8081/api/test-entities', {
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
      await fetch(`http://localhost:8081/api/test-entities/${id}`, {
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
      await fetch('http://localhost:8081/api/test-entities', {
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
    fetchEntities();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spring Boot + React App</h1>
        <p>Testing JawsDB MySQL Connection</p>
      </header>

      <main className="App-main">
        <section className="connection-test">
          <h2>Database Connection Test</h2>
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
          <h2>Create New Entity</h2>
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
          <h2>Entities</h2>
          <button onClick={fetchEntities} disabled={loading}>
            Refresh Entities
          </button>
          <button onClick={deleteAllEntities} disabled={loading}>
            Delete All Entities
          </button>
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
      </main>
    </div>
  );
}

export default App;
