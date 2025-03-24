import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/DatabaseTablesModal.css';

const DatabaseTablesModal = ({ isOpen, onClose }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [populatingRecipes, setPopulatingRecipes] = useState(false);
  const [populateResult, setPopulateResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTables();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tables...');
      
      // Determine the appropriate API URL based on environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? '/api/tables'
        : 'http://localhost:8083/api/tables';
        
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server did not return JSON. Check server logs.');
      }
      
      const data = await response.json();
      console.log('Received tables:', data);
      setTables(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data for table:', tableName);
      
      // Determine the appropriate API URL based on environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `/api/tables/${tableName}`
        : `http://localhost:8083/api/tables/${tableName}`;
        
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch table data: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server did not return JSON. Check server logs.');
      }
      
      const data = await response.json();
      console.log('Received table data:', data);
      setTableData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching table data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAdminToggle = async (userId, currentStatus) => {
    try {
      console.log(`Toggling admin status for user ID: ${userId}, current status: ${currentStatus}`);
      
      // Determine the appropriate API URL based on environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `/api/tables/users/${userId}/admin`
        : `http://localhost:8083/api/tables/users/${userId}/admin`;
        
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to update admin status: ${response.status} ${response.statusText}`);
      }

      // Refresh the table data
      fetchTableData('users');
    } catch (err) {
      console.error('Error updating admin status:', err);
      setError(err.message);
    }
  };
  
  // Function to populate recipes using the data seeder
  const populateRecipes = async (force = false) => {
    try {
      setPopulatingRecipes(true);
      setPopulateResult(null);
      
      // Determine the appropriate API URL based on environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `/api/admin/populate-recipes${force ? '?force=true' : ''}`
        : `http://localhost:8083/api/admin/populate-recipes${force ? '?force=true' : ''}`;
        
      console.log('Using API URL for populating recipes:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Populate recipes response:', data);
      
      setPopulateResult(data);
      
      // If the table is 'recipes', refresh the data
      if (selectedTable === 'recipes') {
        fetchTableData('recipes');
      }
      
      // Refresh tables list to ensure recipes table shows up
      fetchTables();
      
    } catch (err) {
      console.error('Error populating recipes:', err);
      setPopulateResult({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setPopulatingRecipes(false);
    }
  };
  
  // Format database values for display
  const formatValue = (value, key) => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Handle dates
    if (typeof value === 'string' && (
        value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) ||
        key.includes('_at') || 
        key.includes('date')
      )) {
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        return value;
      }
    }
    
    // Handle profile images
    if (key === 'picture_url' && value) {
      try {
        return (
          <img 
            src={value} 
            alt="Profile" 
            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
          />
        );
      } catch (e) {
        return value;
      }
    }
    
    return value.toString();
  };
  
  // Determine columns to display based on table
  const getColumnsToDisplay = (tableName, data) => {
    if (!data || data.length === 0) return [];
    
    // For users table, customize displayed columns
    if (tableName === 'users') {
      const availableColumns = Object.keys(data[0]);
      
      // Define preferred order of columns
      const preferredColumns = [
        'user_id', 
        'username', 
        'email', 
        'oauth_id',
        'oauth_provider',
        'picture_url', 
        'is_admin', 
        'created_at', 
        'last_login'
      ];
      
      // Return columns that exist in the data
      return preferredColumns.filter(col => availableColumns.includes(col));
    }
    
    return Object.keys(data[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="database-tables-modal-wrapper">
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Database Tables</h2>
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="modal-body">
            <div className="admin-actions">
              <button 
                className="populate-recipes-btn"
                onClick={() => populateRecipes()}
                disabled={populatingRecipes}
              >
                {populatingRecipes ? 'Loading API Data...' : 'Load Recipes from API'}
              </button>
              <button 
                className="populate-recipes-force-btn"
                onClick={() => {
                  if (window.confirm('This will delete existing recipes and add new ones from the API. Continue?')) {
                    populateRecipes(true);
                  }
                }}
                disabled={populatingRecipes}
              >
                {populatingRecipes ? 'Loading API Data...' : 'Force Reload API Recipes'}
              </button>
            </div>
            
            {populateResult && (
              <div className={`populate-result ${populateResult.success ? 'success' : 'error'}`}>
                <p>{populateResult.message}</p>
                {populateResult.recordsAdded && (
                  <p>Added {populateResult.recordsAdded} new recipes</p>
                )}
              </div>
            )}
            
            <div className="tables-list">
              <h3>Available Tables</h3>
              {loading && selectedTable === null ? (
                <div className="loading">Loading tables...</div>
              ) : error && selectedTable === null ? (
                <div className="error">{error}</div>
              ) : (
                <div className="tables-grid">
                  {tables.map((table) => (
                    <button
                      key={table}
                      className={`table-button ${selectedTable === table ? 'selected' : ''}`}
                      onClick={() => setSelectedTable(table)}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedTable && (
              <div className="table-data">
                <h3>Table: {selectedTable}</h3>
                {loading ? (
                  <div className="loading">Loading table data...</div>
                ) : error ? (
                  <div className="error">{error}</div>
                ) : tableData.length === 0 ? (
                  <div className="no-data">No data in this table</div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          {getColumnsToDisplay(selectedTable, tableData).map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                          {selectedTable === 'users' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, index) => (
                          <tr key={index}>
                            {getColumnsToDisplay(selectedTable, tableData).map((column) => (
                              <td key={column}>{formatValue(row[column], column)}</td>
                            ))}
                            
                            {selectedTable === 'users' && (
                              <td>
                                <button
                                  className={`admin-toggle-btn ${row.is_admin ? 'remove-admin' : 'make-admin'}`}
                                  onClick={() => handleAdminToggle(row.user_id, row.is_admin)}
                                >
                                  {row.is_admin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTablesModal; 