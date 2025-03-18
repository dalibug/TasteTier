import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/DatabaseTablesModal.css';

const DatabaseTablesModal = ({ isOpen, onClose }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await fetch('http://localhost:8083/api/tables');
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch tables: ${errorData}`);
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
      const response = await fetch(`http://localhost:8083/api/tables/${tableName}`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch table data: ${errorData}`);
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Database Tables</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="tables-list">
            <h3>Available Tables</h3>
            {loading ? (
              <div className="loading">Loading tables...</div>
            ) : error ? (
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
              <h3>{selectedTable} Data</h3>
              {loading ? (
                <div className="loading">Loading table data...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        {tableData.length > 0 && Object.keys(tableData[0]).map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>{value?.toString() || 'null'}</td>
                          ))}
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
  );
};

export default DatabaseTablesModal; 