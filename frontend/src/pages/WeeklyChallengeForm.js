import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WeeklyChallengeService from '../services/weeklyChallengeService';
import UserService from '../services/userService';

const WeeklyChallengeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    weekNumber: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    status: 'SCHEDULED',
    description: '',
    categories: []
  });
  
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        setIsAdmin(userResponse.data.isAdmin);
        
        // If not admin, redirect to challenges page
        if (!userResponse.data.isAdmin) {
          navigate('/weekly-challenges');
          return;
        }
        
        // If editing, get challenge details
        if (isEditMode) {
          const challengeResponse = await WeeklyChallengeService.getWeeklyChallengeById(id);
          const challenge = challengeResponse.data;
          
          // Format dates for input fields
          const startDate = new Date(challenge.startDate);
          const endDate = new Date(challenge.endDate);
          
          setFormData({
            weekNumber: challenge.weekNumber,
            year: challenge.year,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status: challenge.status,
            description: challenge.description || '',
            categories: challenge.categories || []
          });
        } else {
          // For new challenges, set default dates (current week)
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
          
          setFormData({
            ...formData,
            weekNumber: getWeekNumber(today),
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: endOfWeek.toISOString().split('T')[0]
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate]);

  // Get week number from date
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    
    // Check if category already exists
    const categoryExists = formData.categories.some(
      cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase()
    );
    
    if (!categoryExists) {
      const newCategoryObj = {
        categoryId: `temp-${Date.now()}`, // Temporary ID for new categories
        name: newCategory.trim()
      };
      
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategoryObj]
      });
    }
    
    setNewCategory('');
  };

  const handleRemoveCategory = (categoryId) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(cat => cat.categoryId !== categoryId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('You do not have permission to perform this action.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare data for API
      const challengeData = {
        ...formData,
        categories: formData.categories.map(cat => {
          // If it's a new category (with temp ID), just send the name
          if (cat.categoryId.toString().startsWith('temp-')) {
            return { name: cat.name };
          }
          // Otherwise send the full category object
          return cat;
        })
      };
      
      let response;
      if (isEditMode) {
        response = await WeeklyChallengeService.updateWeeklyChallenge(id, challengeData);
      } else {
        response = await WeeklyChallengeService.createWeeklyChallenge(challengeData);
      }
      
      // Navigate to the challenge detail page
      navigate(`/weekly-challenges/${response.data.challengeId}`);
    } catch (err) {
      console.error('Error saving challenge:', err);
      setError('Failed to save challenge. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="weekly-challenge-form-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="weekly-challenge-form-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="error">You do not have permission to access this page.</div>
          <Link to="/weekly-challenges" className="back-btn">
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-challenge-form-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <Link to="/weekly-challenges" className="back-btn">
            &larr; Back to Challenges
          </Link>
          <h1 className="page-title">
            {isEditMode ? 'Edit Challenge' : 'Create New Challenge'}
          </h1>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="challenge-form">
          <div className="form-group">
            <label htmlFor="weekNumber">Week Number</label>
            <input
              type="number"
              id="weekNumber"
              name="weekNumber"
              value={formData.weekNumber}
              onChange={handleInputChange}
              min="1"
              max="53"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              min="2000"
              max="2100"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
            {new Date(formData.endDate) <= new Date(formData.startDate) && (
              <div className="field-error">End date must be after start date</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          
          <div className="form-group categories-section">
            <label>Categories</label>
            <div className="categories-container">
              {formData.categories.length > 0 ? (
                <ul className="categories-list">
                  {formData.categories.map(category => (
                    <li key={category.categoryId} className="category-item">
                      <span className="category-name">{category.name}</span>
                      <button
                        type="button"
                        className="remove-category-btn"
                        onClick={() => handleRemoveCategory(category.categoryId)}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-categories">No categories added yet.</p>
              )}
            </div>
            
            <div className="add-category-container">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category..."
                className="category-input"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="add-category-btn"
                disabled={!newCategory.trim()}
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/weekly-challenges')}
              className="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || new Date(formData.endDate) <= new Date(formData.startDate)}
            >
              {submitting ? 'Saving...' : (isEditMode ? 'Update Challenge' : 'Create Challenge')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyChallengeForm; 