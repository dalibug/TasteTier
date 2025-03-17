import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import api from '../services/api';
import UserService from '../services/userService';

// Add CSS for the new components
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    margin: '20px 0',
  },
  loadingSpinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
  errorContainer: {
    padding: '20px',
    margin: '20px 0',
    borderRadius: '8px',
  },
  errorMessage: {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  successMessage: {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  warning: {
    backgroundColor: '#fff8e1',
    color: '#f57c00',
    border: '1px solid #ffe082',
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

function DatabaseTest() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [entities, setEntities] = useState([]);
  const [newEntity, setNewEntity] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' or 'testing'
  const [databaseTables, setDatabaseTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editedRow, setEditedRow] = useState(null);


  // Check if the current user is an admin
  const checkAdminStatus = async () => {
    try {
      const isAdminUser = await UserService.isAdmin();
      setIsAdmin(isAdminUser);
      
      // Also get the current user data
      const userResponse = await UserService.getCurrentUser();
      setCurrentUser(userResponse.data);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    }
  };

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

  // Fetch database tables
  const fetchDatabaseTables = async () => {
    setLoading(true);
    setError(null);
    try {
      // Define the database tables based on the schema
      const tables = [
        { name: 'users', description: 'User accounts and authentication data' },
        { name: 'categories', description: 'Food categories for tier lists' },
        { name: 'tiers', description: 'Tier rankings (S, A, B, C, D, F)' },
        { name: 'items', description: 'Food items to be ranked' },
        { name: 'item_synonyms', description: 'Synonyms for food items (for ML grouping)' },
        { name: 'tier_lists', description: 'User-created tier lists' },
        { name: 'tierlist_items', description: 'Items in tier lists with rankings' },
        { name: 'weekly_challenges', description: 'Weekly challenge data' },
        { name: 'weekly_challenge_categories', description: 'Categories for weekly challenges' },
        { name: 'challenge_results', description: 'Results of weekly challenges' },
        { name: 'challenge_group_members', description: 'Users grouped by similar tastes' },
        { name: 'chat_rooms', description: 'Chat rooms for users with similar tastes' },
        { name: 'chat_messages', description: 'Messages in chat rooms' }
      ];
      
      setDatabaseTables(tables);
    } catch (err) {
      setError('Failed to fetch database tables: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for the selected table
  const fetchTableData = async (tableName = null) => {
    const tableToFetch = tableName || currentTable;
    if (!tableToFetch) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Fetching data for table: ${tableToFetch}`);
      
      let data = [];
      let endpointUsed = '';
      
      // Special handling for users table
      if (tableToFetch === 'users') {
        if (isAdmin) {
          // Admin can see all users
          console.log('Admin user, fetching all users');
          const response = await api.get('/api/users');
          data = response.data;
          endpointUsed = '/api/users';
        } else {
          // Non-admin can only see their own user
          console.log('Non-admin user, fetching current user only');
          if (currentUser) {
            data = [currentUser];
          } else {
            // Try to get the current user
            try {
              const userResponse = await UserService.getCurrentUser();
              if (userResponse.data) {
                setCurrentUser(userResponse.data);
                data = [userResponse.data];
              }
              endpointUsed = '/api/users/me';
            } catch (userError) {
              console.error('Error fetching current user:', userError);
              setError(`Failed to fetch current user: ${userError.message || 'Unknown error'}`);
              data = [];
            }
          }
        }
      } else {
        // For all other tables, use the correct API endpoints
        let endpoint = '';
        
        switch(tableToFetch) {
          case 'categories':
            endpoint = '/api/categories';
            break;
          case 'tiers':
            endpoint = '/api/tiers';
            break;
          case 'items':
            endpoint = '/api/items';
            break;
          case 'item_synonyms':
            endpoint = '/api/item-synonyms';
            break;
          case 'tier_lists':
            endpoint = '/api/tierlists'; // Match the actual table name
            break;
          case 'tierlist_items':
            endpoint = '/api/tierlist-items';
            break;
          case 'weekly_challenges':
            endpoint = '/api/weekly-challenges';
            break;
          case 'weekly_challenge_categories':
            endpoint = '/api/weekly-challenge-categories';
            break;
          case 'challenge_results':
            endpoint = '/api/challenge-results';
            break;
          case 'challenge_group_members':
            endpoint = '/api/challenge-group-members';
            break;
          case 'chat_rooms':
            endpoint = '/api/chat-rooms';
            break;
          case 'chat_messages':
            endpoint = '/api/chat-messages';
            break;
          default:
            console.error(`No endpoint defined for table: ${tableToFetch}`);
            throw new Error(`No endpoint defined for table: ${tableToFetch}`);
        }
        
        console.log(`Fetching data from endpoint: ${endpoint}`);
        try {
          const response = await api.get(endpoint);
          data = response.data;
          endpointUsed = endpoint;
          
          // Debug log to see the structure of the data
          console.log(`Data received from ${endpoint}:`, data);
          if (data && data.length > 0) {
            console.log(`First row properties:`, Object.keys(data[0]));
            console.log(`Sample data:`, data[0]);
          }
        } catch (apiError) {
          // Log detailed error information
          console.error(`Error fetching data from ${endpoint}:`, apiError);
          
          if (apiError.response) {
            console.error(`Response status: ${apiError.response.status}`);
            console.error(`Response data:`, apiError.response.data);
          }
          
          // Try alternative endpoint format if it's a 404
          if (apiError.response && apiError.response.status === 404) {
            console.warn(`Endpoint ${endpoint} not found. Trying alternative endpoint format...`);
            
            // Try alternative endpoint format
            let alternativeEndpoint = '';
            switch(tableToFetch) {
              case 'tier_lists':
                alternativeEndpoint = '/api/tier-lists';
                break;
              case 'tierlist_items':
                alternativeEndpoint = '/api/tierlist/items';
                break;
              case 'weekly_challenges':
                alternativeEndpoint = '/api/challenges/weekly';
                break;
              case 'chat_rooms':
                alternativeEndpoint = '/api/chats/rooms';
                break;
              default:
                // No alternative for this table
                break;
            }
            
            if (alternativeEndpoint) {
              console.log(`Trying alternative endpoint: ${alternativeEndpoint}`);
              try {
                const altResponse = await api.get(alternativeEndpoint);
                data = altResponse.data;
                endpointUsed = alternativeEndpoint;
                
                // Debug log for alternative endpoint
                console.log(`Data received from alternative endpoint ${alternativeEndpoint}:`, data);
                if (data && data.length > 0) {
                  console.log(`First row properties:`, Object.keys(data[0]));
                  console.log(`Sample data:`, data[0]);
                }
              } catch (altError) {
                console.error(`Alternative endpoint ${alternativeEndpoint} also failed:`, altError);
                
                if (altError.response) {
                  console.error(`Response status: ${altError.response.status}`);
                  console.error(`Response data:`, altError.response.data);
                }
                
                throw new Error(`Failed to fetch data for table ${tableToFetch}. Tried endpoints: ${endpoint}, ${alternativeEndpoint}. Error: ${altError.message}`);
              }
            } else {
              throw new Error(`The API endpoint for ${tableToFetch} (${endpoint}) is not implemented yet.`);
            }
          } else if (apiError.response && apiError.response.status === 500) {
            // For 500 errors, provide more detailed error information
            let errorMessage = `Server error (500) when fetching data from ${endpoint}.`;
            
            if (apiError.response.data && apiError.response.data.message) {
              errorMessage += ` Server message: ${apiError.response.data.message}`;
            }
            
            if (apiError.response.data && apiError.response.data.error) {
              errorMessage += ` Error: ${apiError.response.data.error}`;
            }
            
            throw new Error(errorMessage);
          } else {
            throw apiError; // Re-throw other errors to be caught by the outer catch
          }
        }
      }
      
      console.log(`Fetched ${data.length} rows for table ${tableToFetch}`);
      setTableData(data);
      
      if (tableName) {
        setCurrentTable(tableName);
      }
      
      // Show success message
      setSuccess(`Successfully loaded ${data.length} rows from ${tableToFetch} table using endpoint: ${endpointUsed}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error(`Error fetching data for table ${tableToFetch}:`, error);
      setError(`Failed to fetch data for table ${tableToFetch}: ${error.message || 'Unknown error'}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for editing
  const handleEditChange = (key) => (value) => {
    setEditingRow({...editingRow, [key]: value});
  };

  // Handle input change for new row
  const handleNewRowChange = (key) => (value) => {
    setNewRow({...newRow, [key]: value});
  };

  // Render an input field based on the data type
  const renderInputField = (key, value, onChange) => {
    // Skip rendering input for id fields (make them read-only)
    if (key === 'id' || key === 'userId' || key === 'user_id') {
      return <span className="id-field">{value}</span>;
    }
    
    // Render checkbox for boolean values
    if (typeof value === 'boolean' || key === 'is_admin' || key === 'isAdmin') {
      return (
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="edit-checkbox"
        />
      );
    }
    
    // Render textarea for long text
    if (typeof value === 'string' && value && value.length > 100) {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="edit-textarea"
        />
      );
    }
    
    // Render date input for date fields
    if ((key.includes('date') || key.includes('time') || key.endsWith('_at')) && 
        (typeof value === 'string' || value === null || value === undefined)) {
      return (
        <input
          type="datetime-local"
          value={value && typeof value === 'string' ? value.slice(0, 16) : ''}
          onChange={(e) => {
            const val = e.target.value.trim();
            onChange(val === '' ? null : val);
          }}
          className="edit-input"
        />
      );
    }
    
    // Render password field for password
    if (key === 'password' || key === 'new_password') {
      return (
        <input
          type="password"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="edit-input"
          placeholder="Enter password"
        />
      );
    }
    
    // Render select for role field
    if (key === 'role') {
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="edit-select"
        >
          <option value="">Select role</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      );
    }
    
    // Render number input for numeric fields
    if ((key.includes('id') && key !== 'oauth_id') || 
        key.includes('count') || 
        key.includes('order') || 
        key.includes('rank')) {
      return (
        <input
          type="number"
          value={value === null || value === undefined ? '' : value}
          onChange={(e) => {
            const val = e.target.value.trim();
            if (val === '') {
              onChange(null);
            } else {
              const parsed = parseInt(val, 10);
              onChange(isNaN(parsed) ? null : parsed);
            }
          }}
          className="edit-input"
        />
      );
    }
    
    // Default to text input for all other fields
    return (
      <input
        type="text"
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="edit-input"
      />
    );
  };

  // Add a function to navigate back to the previous page
  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Clean user data before sending to API
  const cleanUserData = (userData, isUpdate = false) => {
    console.log('Cleaning user data:', userData);
    console.log('Is update operation:', isUpdate);
    
    // Create a copy of the data to avoid modifying the original
    const cleanedData = { ...userData };
    
    // Extract user ID for logging
    const userId = userData.userId || userData.user_id || userData.id;
    console.log('User ID found in data:', userId);
    
    // Remove undefined values
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === undefined || cleanedData[key] === 'undefined') {
        console.log(`Removing undefined value for field: ${key}`);
        delete cleanedData[key];
      }
    });
    
    // Handle ID fields for updates
    if (isUpdate) {
      console.log('Handling ID fields for update operation');
      
      // For updates, we need to ensure the ID fields are properly set
      if (cleanedData.userId) {
        console.log(`Setting userId field: ${cleanedData.userId}`);
        if (typeof cleanedData.userId === 'string') {
          cleanedData.userId = parseInt(cleanedData.userId, 10);
          console.log(`Converted userId to number: ${cleanedData.userId}`);
        }
      }
      
      if (cleanedData.user_id) {
        console.log(`Setting user_id field: ${cleanedData.user_id}`);
        if (typeof cleanedData.user_id === 'string') {
          cleanedData.user_id = parseInt(cleanedData.user_id, 10);
          console.log(`Converted user_id to number: ${cleanedData.user_id}`);
        }
      }
      
      if (cleanedData.id) {
        console.log(`Setting id field: ${cleanedData.id}`);
        if (typeof cleanedData.id === 'string') {
          cleanedData.id = parseInt(cleanedData.id, 10);
          console.log(`Converted id to number: ${cleanedData.id}`);
        }
      }
    }
    
    // Remove token fields
    if (cleanedData.token) {
      console.log('Removing token field');
      delete cleanedData.token;
    }
    
    // Handle date fields
    Object.keys(cleanedData).forEach(key => {
      if ((key.includes('date') || key.includes('time') || key.endsWith('_at'))) {
        if (!cleanedData[key] || cleanedData[key] === '' || cleanedData[key] === 'undefined') {
          console.log(`Removing empty date field: ${key}`);
          delete cleanedData[key];
        }
      }
    });
    
    // Handle numeric fields
    Object.keys(cleanedData).forEach(key => {
      if ((key.includes('id') && key !== 'oauth_id') || key.includes('count') || key.includes('order')) {
        if (cleanedData[key] === null || cleanedData[key] === '' || cleanedData[key] === 'undefined') {
          console.log(`Removing empty numeric field: ${key}`);
          delete cleanedData[key];
        } else if (typeof cleanedData[key] === 'string') {
          const parsed = parseInt(cleanedData[key], 10);
          if (isNaN(parsed)) {
            console.log(`Removing invalid numeric field: ${key} with value: ${cleanedData[key]}`);
            delete cleanedData[key];
          } else {
            cleanedData[key] = parsed;
            console.log(`Converted ${key} from string to number: ${cleanedData[key]}`);
          }
        }
      }
    });
    
    console.log('Cleaned data:', cleanedData);
    return cleanedData;
  };

  // Handle table selection
  const selectTable = (tableName) => {
    setCurrentTable(tableName);
    fetchTableData(tableName);
    setEditingRow(null);
    setNewRow({});
  };

  // Update a row in the selected table
  const updateRow = async (rowData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Updating row in table ${currentTable}:`, rowData);
      
      let endpoint = '';
      let idField = getIdFieldForTable(currentTable);
      
      // Determine the endpoint and ID field based on the table
      switch(currentTable) {
        case 'users':
          endpoint = `/api/users/${rowData[idField]}`;
          break;
        case 'categories':
          endpoint = `/api/categories/${rowData[idField]}`;
          break;
        case 'tiers':
          endpoint = `/api/tiers/${rowData[idField]}`;
          break;
        case 'items':
          endpoint = `/api/items/${rowData[idField]}`;
          break;
        case 'tier_lists':
          endpoint = `/api/tierlists/${rowData[idField]}`; // Match the actual table name
          break;
        case 'tierlist_items':
          endpoint = `/api/tierlist-items/${rowData[idField]}`;
          break;
        case 'weekly_challenges':
          endpoint = `/api/weekly-challenges/${rowData[idField]}`;
          break;
        case 'weekly_challenge_categories':
          endpoint = `/api/weekly-challenge-categories/${rowData[idField]}`;
          break;
        case 'challenge_results':
          endpoint = `/api/challenge-results/${rowData[idField]}`;
          break;
        case 'challenge_group_members':
          endpoint = `/api/challenge-group-members/${rowData[idField]}`;
          break;
        case 'chat_rooms':
          endpoint = `/api/chat-rooms/${rowData[idField]}`;
          break;
        case 'chat_messages':
          endpoint = `/api/chat-messages/${rowData[idField]}`;
          break;
        default:
          console.error(`No endpoint defined for table: ${currentTable}`);
          throw new Error(`No endpoint defined for table: ${currentTable}`);
      }
      
      console.log(`Updating data at endpoint: ${endpoint}`);
      
      try {
        // Log the data being sent to the API
        console.log('Sending data to API:', rowData);
        
        const response = await api.put(endpoint, rowData);
        
        // Log the response from the API
        console.log('Response from API:', response.data);
        
        // Update the table data with the updated row
        const updatedData = tableData.map(row => 
          row[idField] === rowData[idField] ? response.data : row
        );
        
        setTableData(updatedData);
        setEditingRow(null);
        setSuccess(`Row updated successfully in table ${currentTable}`);
      } catch (apiError) {
        console.error(`Error updating data at ${endpoint}:`, apiError);
        
        if (apiError.response) {
          console.error(`Response status: ${apiError.response.status}`);
          console.error(`Response data:`, apiError.response.data);
        }
        
        // Handle 404 errors more gracefully
        if (apiError.response && apiError.response.status === 404) {
          console.warn(`Endpoint ${endpoint} not found. Trying alternative endpoint format...`);
          
          // Try alternative endpoint format
          let alternativeEndpoint = '';
          switch(currentTable) {
            case 'tier_lists':
              alternativeEndpoint = `/api/tier-lists/${rowData[idField]}`;
              break;
            case 'tierlist_items':
              alternativeEndpoint = `/api/tierlist/items/${rowData[idField]}`;
              break;
            case 'weekly_challenges':
              alternativeEndpoint = `/api/challenges/weekly/${rowData[idField]}`;
              break;
            case 'chat_rooms':
              alternativeEndpoint = `/api/chats/rooms/${rowData[idField]}`;
              break;
            default:
              // No alternative for this table
              break;
          }
          
          if (alternativeEndpoint) {
            console.log(`Trying alternative endpoint: ${alternativeEndpoint}`);
            try {
              // Log the data being sent to the alternative API
              console.log('Sending data to alternative API:', rowData);
              
              const altResponse = await api.put(alternativeEndpoint, rowData);
              
              // Log the response from the alternative API
              console.log('Response from alternative API:', altResponse.data);
              
              // Update the table data with the updated row
              const updatedData = tableData.map(row => 
                row[idField] === rowData[idField] ? altResponse.data : row
              );
              
              setTableData(updatedData);
              setEditingRow(null);
              setSuccess(`Row updated successfully in table ${currentTable}`);
            } catch (altError) {
              console.error(`Alternative endpoint ${alternativeEndpoint} also failed:`, altError);
              
              if (altError.response) {
                console.error(`Response status: ${altError.response.status}`);
                console.error(`Response data:`, altError.response.data);
              }
              
              throw new Error(`Failed to update row in table ${currentTable}. Tried endpoints: ${endpoint}, ${alternativeEndpoint}. Error: ${altError.message}`);
            }
          } else {
            throw new Error(`The API endpoint for updating ${currentTable} (${endpoint}) is not implemented yet.`);
          }
        } else if (apiError.response && apiError.response.status === 500) {
          // For 500 errors, provide more detailed error information
          let errorMessage = `Server error (500) when updating data at ${endpoint}.`;
          
          if (apiError.response.data && apiError.response.data.message) {
            errorMessage += ` Server message: ${apiError.response.data.message}`;
          }
          
          if (apiError.response.data && apiError.response.data.error) {
            errorMessage += ` Error: ${apiError.response.data.error}`;
          }
          
          throw new Error(errorMessage);
        } else {
          throw apiError; // Re-throw other errors to be caught by the outer catch
        }
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(`Error updating row in table ${currentTable}:`, error);
      setError(`Failed to update row: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new row in the selected table
  const createRow = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Creating new row in table ${currentTable}:`, newRow);
      
      let endpoint = '';
      
      // Determine the endpoint based on the table
      switch(currentTable) {
        case 'users':
          endpoint = '/api/users';
          break;
        case 'categories':
          endpoint = '/api/categories';
          break;
        case 'tiers':
          endpoint = '/api/tiers';
          break;
        case 'items':
          endpoint = '/api/items';
          break;
        case 'tier_lists':
          endpoint = '/api/tierlists'; // Match the actual table name
          break;
        case 'tierlist_items':
          endpoint = '/api/tierlist-items';
          break;
        case 'weekly_challenges':
          endpoint = '/api/weekly-challenges';
          break;
        case 'weekly_challenge_categories':
          endpoint = '/api/weekly-challenge-categories';
          break;
        case 'challenge_results':
          endpoint = '/api/challenge-results';
          break;
        case 'challenge_group_members':
          endpoint = '/api/challenge-group-members';
          break;
        case 'chat_rooms':
          endpoint = '/api/chat-rooms';
          break;
        case 'chat_messages':
          endpoint = '/api/chat-messages';
          break;
        default:
          console.error(`No endpoint defined for table: ${currentTable}`);
          throw new Error(`No endpoint defined for table: ${currentTable}`);
      }
      
      console.log(`Creating data at endpoint: ${endpoint}`);
      
      try {
        // Log the data being sent to the API
        console.log('Sending data to API:', newRow);
        
        const response = await api.post(endpoint, newRow);
        
        // Log the response from the API
        console.log('Response from API:', response.data);
        
        // Add the new row to the table data
        setTableData([...tableData, response.data]);
        setNewRow({});
        setShowNewForm(false);
        setSuccess(`New row created successfully in table ${currentTable}`);
      } catch (apiError) {
        console.error(`Error creating data at ${endpoint}:`, apiError);
        
        if (apiError.response) {
          console.error(`Response status: ${apiError.response.status}`);
          console.error(`Response data:`, apiError.response.data);
        }
        
        // Handle 404 errors more gracefully
        if (apiError.response && apiError.response.status === 404) {
          console.warn(`Endpoint ${endpoint} not found. Trying alternative endpoint format...`);
          
          // Try alternative endpoint format
          let alternativeEndpoint = '';
          switch(currentTable) {
            case 'tier_lists':
              alternativeEndpoint = '/api/tier-lists';
              break;
            case 'tierlist_items':
              alternativeEndpoint = '/api/tierlist/items';
              break;
            case 'weekly_challenges':
              alternativeEndpoint = '/api/challenges/weekly';
              break;
            case 'chat_rooms':
              alternativeEndpoint = '/api/chats/rooms';
              break;
            default:
              // No alternative for this table
              break;
          }
          
          if (alternativeEndpoint) {
            console.log(`Trying alternative endpoint: ${alternativeEndpoint}`);
            try {
              // Log the data being sent to the alternative API
              console.log('Sending data to alternative API:', newRow);
              
              const altResponse = await api.post(alternativeEndpoint, newRow);
              
              // Log the response from the alternative API
              console.log('Response from alternative API:', altResponse.data);
              
              // Add the new row to the table data
              setTableData([...tableData, altResponse.data]);
              setNewRow({});
              setShowNewForm(false);
              setSuccess(`New row created successfully in table ${currentTable}`);
            } catch (altError) {
              console.error(`Alternative endpoint ${alternativeEndpoint} also failed:`, altError);
              
              if (altError.response) {
                console.error(`Response status: ${altError.response.status}`);
                console.error(`Response data:`, altError.response.data);
              }
              
              throw new Error(`Failed to create row in table ${currentTable}. Tried endpoints: ${endpoint}, ${alternativeEndpoint}. Error: ${altError.message}`);
            }
          } else {
            throw new Error(`The API endpoint for creating ${currentTable} (${endpoint}) is not implemented yet.`);
          }
        } else if (apiError.response && apiError.response.status === 500) {
          // For 500 errors, provide more detailed error information
          let errorMessage = `Server error (500) when creating data at ${endpoint}.`;
          
          if (apiError.response.data && apiError.response.data.message) {
            errorMessage += ` Server message: ${apiError.response.data.message}`;
          }
          
          if (apiError.response.data && apiError.response.data.error) {
            errorMessage += ` Error: ${apiError.response.data.error}`;
          }
          
          throw new Error(errorMessage);
        } else {
          throw apiError; // Re-throw other errors to be caught by the outer catch
        }
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(`Error creating row in table ${currentTable}:`, error);
      setError(`Failed to create row: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete a row from the selected table
  const deleteRow = async (rowId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Deleting row with ID ${rowId} from table ${currentTable}`);
      
      let endpoint = '';
      let idField = getIdFieldForTable(currentTable);
      
      // Determine the endpoint and ID field based on the table
      switch(currentTable) {
        case 'users':
          endpoint = `/api/users/${rowId}`;
          break;
        case 'categories':
          endpoint = `/api/categories/${rowId}`;
          break;
        case 'tiers':
          endpoint = `/api/tiers/${rowId}`;
          break;
        case 'items':
          endpoint = `/api/items/${rowId}`;
          break;
        case 'tier_lists':
          endpoint = `/api/tierlists/${rowId}`; // Match the actual table name
          break;
        case 'tierlist_items':
          endpoint = `/api/tierlist-items/${rowId}`;
          break;
        case 'weekly_challenges':
          endpoint = `/api/weekly-challenges/${rowId}`;
          break;
        case 'weekly_challenge_categories':
          endpoint = `/api/weekly-challenge-categories/${rowId}`;
          break;
        case 'challenge_results':
          endpoint = `/api/challenge-results/${rowId}`;
          break;
        case 'challenge_group_members':
          endpoint = `/api/challenge-group-members/${rowId}`;
          break;
        case 'chat_rooms':
          endpoint = `/api/chat-rooms/${rowId}`;
          break;
        case 'chat_messages':
          endpoint = `/api/chat-messages/${rowId}`;
          break;
        default:
          console.error(`No endpoint defined for table: ${currentTable}`);
          throw new Error(`No endpoint defined for table: ${currentTable}`);
      }
      
      console.log(`Deleting data at endpoint: ${endpoint}`);
      
      try {
        await api.delete(endpoint);
        
        // Remove the deleted row from the table data
        const updatedData = tableData.filter(row => row[idField] !== rowId);
        setTableData(updatedData);
        setSuccess(`Row deleted successfully from table ${currentTable}`);
      } catch (apiError) {
        console.error(`Error deleting data at ${endpoint}:`, apiError);
        
        if (apiError.response) {
          console.error(`Response status: ${apiError.response.status}`);
          console.error(`Response data:`, apiError.response.data);
        }
        
        // Handle 404 errors more gracefully
        if (apiError.response && apiError.response.status === 404) {
          console.warn(`Endpoint ${endpoint} not found. Trying alternative endpoint format...`);
          
          // Try alternative endpoint format
          let alternativeEndpoint = '';
          switch(currentTable) {
            case 'tier_lists':
              alternativeEndpoint = `/api/tier-lists/${rowId}`;
              break;
            case 'tierlist_items':
              alternativeEndpoint = `/api/tierlist/items/${rowId}`;
              break;
            case 'weekly_challenges':
              alternativeEndpoint = `/api/challenges/weekly/${rowId}`;
              break;
            case 'chat_rooms':
              alternativeEndpoint = `/api/chats/rooms/${rowId}`;
              break;
            default:
              // No alternative for this table
              break;
          }
          
          if (alternativeEndpoint) {
            console.log(`Trying alternative endpoint: ${alternativeEndpoint}`);
            try {
              await api.delete(alternativeEndpoint);
              
              // Remove the deleted row from the table data
              const updatedData = tableData.filter(row => row[idField] !== rowId);
              setTableData(updatedData);
              setSuccess(`Row deleted successfully from table ${currentTable}`);
            } catch (altError) {
              console.error(`Alternative endpoint ${alternativeEndpoint} also failed:`, altError);
              
              if (altError.response) {
                console.error(`Response status: ${altError.response.status}`);
                console.error(`Response data:`, altError.response.data);
              }
              
              throw new Error(`Failed to delete row from table ${currentTable}. Tried endpoints: ${endpoint}, ${alternativeEndpoint}. Error: ${altError.message}`);
            }
          } else {
            throw new Error(`The API endpoint for deleting from ${currentTable} (${endpoint}) is not implemented yet.`);
          }
        } else if (apiError.response && apiError.response.status === 500) {
          // For 500 errors, provide more detailed error information
          let errorMessage = `Server error (500) when deleting data at ${endpoint}.`;
          
          if (apiError.response.data && apiError.response.data.message) {
            errorMessage += ` Server message: ${apiError.response.data.message}`;
          }
          
          if (apiError.response.data && apiError.response.data.error) {
            errorMessage += ` Error: ${apiError.response.data.error}`;
          }
          
          throw new Error(errorMessage);
        } else {
          throw apiError; // Re-throw other errors to be caught by the outer catch
        }
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(`Error deleting row from table ${currentTable}:`, error);
      setError(`Failed to delete row: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Start editing a row
  const startEditing = (row) => {
    console.log('startEditing called with row:', row);
    
    // Check if row is valid
    if (!row || typeof row !== 'object') {
      console.error('Invalid row object:', row);
      setError('Cannot edit row: Invalid row object');
      return;
    }
    
    // Check if row has a valid ID
    if (!row.id && !row.userId && !row.user_id) {
      console.error('Row does not have a valid ID:', row);
      setError('Cannot edit row: Missing ID field');
      return;
    }
    
    // Create a deep copy of the row to avoid modifying the original
    try {
      // First convert to string and then parse to create a deep copy
      const rowString = JSON.stringify(row);
      console.log('Row as string:', rowString);
      
      const rowCopy = JSON.parse(rowString);
      console.log('Row copy after parsing:', rowCopy);
      
      // Ensure ID fields are properly set
      if (currentTable === 'users') {
        console.log('Setting up user ID fields for editing');
        
        // Make sure we have the user ID in all possible fields
        if (rowCopy.userId) {
          console.log(`User has userId: ${rowCopy.userId}`);
          if (!rowCopy.user_id) {
            rowCopy.user_id = rowCopy.userId;
            console.log(`Set user_id to match userId: ${rowCopy.user_id}`);
          }
          if (!rowCopy.id) {
            rowCopy.id = rowCopy.userId;
            console.log(`Set id to match userId: ${rowCopy.id}`);
          }
        } else if (rowCopy.user_id) {
          console.log(`User has user_id: ${rowCopy.user_id}`);
          if (!rowCopy.userId) {
            rowCopy.userId = rowCopy.user_id;
            console.log(`Set userId to match user_id: ${rowCopy.userId}`);
          }
          if (!rowCopy.id) {
            rowCopy.id = rowCopy.user_id;
            console.log(`Set id to match user_id: ${rowCopy.id}`);
          }
        } else if (rowCopy.id) {
          console.log(`User has id: ${rowCopy.id}`);
          if (!rowCopy.userId) {
            rowCopy.userId = rowCopy.id;
            console.log(`Set userId to match id: ${rowCopy.userId}`);
          }
          if (!rowCopy.user_id) {
            rowCopy.user_id = rowCopy.id;
            console.log(`Set user_id to match id: ${rowCopy.user_id}`);
          }
        }
      }
      
      console.log('Setting editingRow state with:', rowCopy);
      setEditingRow(rowCopy);
      console.log('EditingRow state set to:', rowCopy);
      
      // Force a re-render
      setTimeout(() => {
        console.log('Current editingRow state:', editingRow);
      }, 100);
    } catch (error) {
      console.error('Error creating row copy:', error);
      setError(`Cannot edit row: ${error.message}`);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRow(null);
  };

  // Start creating a new row
  const startCreating = () => {
    if (!tableData.length) {
      setError("Cannot create a new row without knowing the table structure. Please ensure the table has at least one row of data.");
      return;
    }
    
    // Create an empty object with the same keys as the first row
    const emptyRow = {};
    Object.keys(tableData[0]).forEach(key => {
      // Skip id field for new rows
      if (key === 'id' || key === 'userId' || key === 'user_id') return;
      
      // Set default values based on field type
      if (key === 'is_admin' || key.startsWith('is_')) {
        emptyRow[key] = false;
      } else if (key.includes('date') || key.includes('time') || key.endsWith('_at')) {
        emptyRow[key] = '';
      } else if (key.includes('count') || key.includes('order') || key.endsWith('_id')) {
        emptyRow[key] = 0;
      } else {
        emptyRow[key] = '';
      }
    });
    
    setNewRow(emptyRow);
    setShowNewForm(true);
  };

  // Cancel creating a new row
  const cancelCreating = () => {
    setNewRow({});
    setShowNewForm(false);
  };

  // Load entities and tables on component mount
  useEffect(() => {
    fetchEntities();
    fetchDatabaseTables();
    
    // Force admin mode for testing
    setIsAdmin(true);
    console.log('Forced admin mode for testing');
    
    // Still check admin status from the server
    checkAdminStatus();
    
    // If a table is already selected, fetch its data
    if (currentTable) {
      fetchTableData();
    }
  }, []);

  // Determine if the user can edit a specific row
  const canEditRow = (row) => {
    console.log('canEditRow called with row:', row);
    console.log('isAdmin:', isAdmin);
    console.log('currentUser:', currentUser);
    console.log('currentTable:', currentTable);
    
    if (isAdmin) {
      console.log('User is admin, can edit row');
      return true;
    }
    
    // For non-admins, they can only edit their own user record
    if (currentTable === 'users' && currentUser && row.id === currentUser.id) {
      console.log('User can edit their own record');
      return true;
    }
    
    console.log('User cannot edit this row');
    return false;
  };

  // Determine if the user can delete a specific row
  const canDeleteRow = (row) => {
    // Only admins can delete records
    return isAdmin;
  };

  // Determine if the user can create new records in the current table
  const canCreateInTable = () => {
    // Only admins can create new records (except for their own user profile)
    return isAdmin;
  };

  // Helper function to check if two rows are the same
  const isSameRow = (row1, row2) => {
    if (!row1 || !row2) return false;
    
    // Check various ID fields
    if (row1.id && row2.id && row1.id === row2.id) return true;
    if (row1.userId && row2.userId && row1.userId === row2.userId) return true;
    if (row1.user_id && row2.user_id && row1.user_id === row2.user_id) return true;
    if (row1.id && row2.userId && row1.id === row2.userId) return true;
    if (row1.id && row2.user_id && row1.id === row2.user_id) return true;
    if (row1.userId && row2.id && row1.userId === row2.id) return true;
    if (row1.userId && row2.user_id && row1.userId === row2.user_id) return true;
    if (row1.user_id && row2.id && row1.user_id === row2.id) return true;
    if (row1.user_id && row2.userId && row1.user_id === row2.userId) return true;
    
    return false;
  };

  // Render the table data
  const renderTableData = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading data...</p>
        </div>
      );
    }
    
    if (error) {
      // Check if the error is about an API not being implemented
      if (error.includes('not implemented yet')) {
        return (
          <div style={{...styles.errorContainer, ...styles.warning}}>
            <p>This feature is currently under development. The API endpoint for this table has not been implemented yet.</p>
            <p>Please check back later or contact the development team for more information.</p>
          </div>
        );
      }
      
      // Check if the error is a 500 server error
      if (error.includes('Server error (500)')) {
        return (
          <div style={styles.errorContainer}>
            <div style={styles.errorMessage}>
              <p><strong>Database Error:</strong> {error}</p>
              <p>This could be due to a database connection issue or a problem with the server configuration.</p>
              <p>Please check the backend logs for more information.</p>
            </div>
          </div>
        );
      }
      
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorMessage}>
            <p>{error}</p>
          </div>
        </div>
      );
    }
    
    if (!tableData || tableData.length === 0) {
      return <p>No data available for this table.</p>;
    }
    
    // Get all unique columns from the data
    const allColumns = Array.from(
      new Set(
        tableData.flatMap(row => Object.keys(row))
      )
    );
    
    // Move ID column to the front
    const idField = getIdFieldForTable(currentTable);
    const columns = [
      idField,
      ...allColumns.filter(col => col !== idField)
    ];
    
    return (
      <div style={styles.tableResponsive}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column}>{formatColumnName(column)}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(column => (
                  <td key={column}>
                    {editingRow === row[idField] ? (
                      <input
                        type="text"
                        value={editedRow[column] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedRow({
                            ...editedRow,
                            [column]: value
                          });
                        }}
                      />
                    ) : (
                      renderCellValue(row[column])
                    )}
                  </td>
                ))}
                <td>
                  {editingRow === row[idField] ? (
                    <div className="action-buttons">
                      <button 
                        className="save-button"
                        onClick={() => updateRow(editedRow)}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setEditingRow(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => {
                          setEditingRow(row[idField]);
                          setEditedRow({...row});
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => deleteRow(row[idField])}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper function to get the ID field for a table
  const getIdFieldForTable = (tableName) => {
    switch(tableName) {
      case 'users':
        return 'user_id';
      case 'categories':
        return 'category_id';
      case 'tiers':
        return 'tier_id';
      case 'items':
        return 'item_id';
      case 'item_synonyms':
        return 'synonym_id';
      case 'tier_lists':
        return 'tierlist_id';
      case 'tierlist_items':
        return 'item_id';
      case 'weekly_challenges':
        return 'challenge_id';
      case 'weekly_challenge_categories':
        return 'weekly_category_id';
      case 'challenge_results':
        return 'result_id';
      case 'challenge_group_members':
        return 'group_member_id';
      case 'chat_rooms':
        return 'room_id';
      case 'chat_messages':
        return 'message_id';
      default:
        return 'id';
    }
  };

  // Helper function to render cell values properly
  const renderCellValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="null-value">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'boolean-true' : 'boolean-false'}>
          {value ? 'true' : 'false'}
        </span>
      );
    }
    
    if (typeof value === 'object') {
      return <span className="object-value">{JSON.stringify(value)}</span>;
    }
    
    return String(value);
  };
  
  // Helper function to format column names for display
  const formatColumnName = (column) => {
    // Convert camelCase or snake_case to Title Case with spaces
    return column
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
  };

  // Helper function to convert camelCase to snake_case
  const camelToSnake = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  };

  // Helper function to convert snake_case to camelCase
  const snakeToCamel = (str) => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  // Helper function to convert object keys from camelCase to snake_case
  const convertObjectKeysToCamelCase = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const newKey = snakeToCamel(key);
      newObj[newKey] = obj[key];
    });
    
    return newObj;
  };

  // Helper function to convert object keys from snake_case to camelCase
  const convertObjectKeysToSnakeCase = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const newKey = camelToSnake(key);
      newObj[newKey] = obj[key];
    });
    
    return newObj;
  };

  return (
    <div className="admin-database-page" >
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <div className="header-top">
            <button 
              className="back-button"
              onClick={handleGoBack}
              title="Go back to previous page"
            >
              &larr; Back
            </button>
            <h1>Database Management</h1>
          </div>
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveTab('tables')}
            >
              Database Tables
            </button>
            <button 
              className={`tab-button ${activeTab === 'testing' ? 'active' : ''}`}
              onClick={() => setActiveTab('testing')}
            >
              Database Testing
            </button>
          </div>
        </div>

        {activeTab === 'tables' && (
          <div className="database-tables-view">
            <div className="tables-sidebar">
              <h2>Database Tables</h2>
              <ul className="table-list">
                {databaseTables.map((table) => (
                  <li 
                    key={table.name} 
                    className={currentTable === table.name ? 'selected' : ''}
                    onClick={() => selectTable(table.name)}
                  >
                    <span className="table-name">{table.name}</span>
                    <span className="table-description">{table.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="table-data-view">
              {currentTable ? (
                <>
                  <div className="table-header">
                    <h2>Table: {currentTable}</h2>
                    {canCreateInTable() && (
                      <button 
                        className="admin-button"
                        onClick={startCreating}
                        disabled={loading || !tableData.length}
                      >
                        Add New {currentTable.slice(0, -1)}
                      </button>
                    )}
                  </div>
                  
                  {showNewForm && (
                    <div className="new-row-form">
                      <h3>Create New {currentTable.slice(0, -1)}</h3>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Form fields for new row */}
                            {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                              <tr key={key}>
                                <td>{key}</td>
                                <td>{renderInputField(key, newRow[key], handleNewRowChange(key))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        <div className="form-actions">
                          <button 
                            className="admin-button" 
                            onClick={createRow}
                            disabled={loading}
                          >
                            Create
                          </button>
                          <button 
                            className="admin-button cancel" 
                            onClick={cancelCreating}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {renderTableData()}
                </>
              ) : (
                <div className="select-table-prompt">
                  <p>Select a table from the sidebar to view its data.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="database-testing-view">
            <div className="testing-section connection-test">
              <h2>Database Connection Test</h2>
              <div className="action-buttons">
                <button className="admin-button" onClick={testConnection} disabled={loading}>
                  Test Connection
                </button>
              </div>
              {connectionStatus && (
                <div className="connection-status">
                  <p><strong>Status:</strong> {connectionStatus.status}</p>
                  <p><strong>Message:</strong> {connectionStatus.message}</p>
                  <p><strong>Entity Count:</strong> {connectionStatus.entityCount}</p>
                </div>
              )}
            </div>

            <div className="testing-grid">
              <div className="testing-section entity-form">
                <h2>Create New Test Entity</h2>
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
                  <button className="admin-button" type="submit" disabled={loading}>
                    Create Entity
                  </button>
                </form>
              </div>

              <div className="testing-section entity-list">
                <h2>Test Entities</h2>
                <div className="action-buttons">
                  <button className="admin-button" onClick={fetchEntities} disabled={loading}>
                    Refresh Entities
                  </button>
                  <button className="admin-button delete" onClick={deleteAllEntities} disabled={loading}>
                    Delete All Entities
                  </button>
                </div>
                {entities.length === 0 ? (
                  <p className="no-data-message">No test entities found.</p>
                ) : (
                  <ul className="entity-items">
                    {entities.map((entity) => (
                      <li key={entity.id} className="entity-item">
                        <div className="entity-content">
                          <strong>{entity.name}</strong>
                          <p>{entity.description}</p>
                        </div>
                        <button 
                          className="delete-button" 
                          onClick={() => deleteEntity(entity.id)} 
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button 
              className="close-error-btn"
              onClick={() => setError(null)}
              title="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div style={styles.successMessage}>
            <strong>Success:</strong> {success}
            <button 
              className="close-success-btn"
              onClick={() => setSuccess(null)}
              title="Dismiss message"
              style={{
                background: 'none',
                border: 'none',
                color: '#2e7d32',
                fontSize: '20px',
                cursor: 'pointer',
                float: 'right',
                marginTop: '-5px'
              }}
            >
              ×
            </button>
          </div>
        )}
        {loading && <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>}
      </div>
    </div>
  );
}

export default DatabaseTest; 