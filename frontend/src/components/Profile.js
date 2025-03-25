import { FaEdit, FaTrash } from 'react-icons/fa';

const Profile = () => {
  const [editingTierList, setEditingTierList] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    recipes: []
  });

  const handleEditClick = (tierList) => {
    setEditingTierList(tierList);
    setEditFormData({
      title: tierList.title,
      description: tierList.description || '',
      recipes: [...tierList.recipes]
    });
  };

  const handleEditClose = () => {
    setEditingTierList(null);
    setEditFormData({
      title: '',
      description: '',
      recipes: []
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tierlists/${editingTierList._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        // Update the tier list in the state
        setTierLists(tierLists.map(tl => 
          tl._id === editingTierList._id ? { ...tl, ...editFormData } : tl
        ));
        handleEditClose();
      }
    } catch (error) {
      console.error('Error updating tier list:', error);
    }
  };

  const handleDeleteRecipe = (recipeId) => {
    setEditFormData(prev => ({
      ...prev,
      recipes: prev.recipes.filter(recipe => recipe._id !== recipeId)
    }));
  };

  const handleUpdateRecipeTier = (recipeId, newTier) => {
    setEditFormData(prev => ({
      ...prev,
      recipes: prev.recipes.map(recipe => 
        recipe._id === recipeId ? { ...recipe, tier: newTier } : recipe
      )
    }));
  };

  return (
    <div id="profile-container">
      <div id="profile-tierlists-section">
        <h2>My Tier Lists</h2>
        <div id="profile-tierlists-grid">
          {tierLists.map((tierList) => (
            <div key={tierList._id} id={`tierlist-card-${tierList._id}`} className="tierlist-card">
              <div className="tierlist-header">
                <div className="header-content">
                  <h3>{tierList.title}</h3>
                  <p>{tierList.description}</p>
                </div>
                <div className="tierlist-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteTierList(tierList._id)}
                  >
                    <FaTrash />
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditClick(tierList)}
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
              <div className="tierlist-items">
                <div className="items-grid">
                  {tierList.recipes.map((recipe) => (
                    <div key={recipe._id} className="tierlist-item">
                      <span className="recipe-name">{recipe.name}</span>
                      <span className={`tier-badge tier-badge-${recipe.tier.toLowerCase()}`}>
                        {recipe.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingTierList && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h2 className="edit-modal-title">Edit Tier List</h2>
              <button className="edit-modal-close" onClick={handleEditClose}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="edit-form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="edit-form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="recipe-list">
                <h3>Recipes</h3>
                {editFormData.recipes.map((recipe) => (
                  <div key={recipe._id} className="recipe-list-item">
                    <span className="recipe-name">{recipe.name}</span>
                    <div className="recipe-actions">
                      <select
                        value={recipe.tier}
                        onChange={(e) => handleUpdateRecipeTier(recipe._id, e.target.value)}
                      >
                        <option value="S">S Tier</option>
                        <option value="A">A Tier</option>
                        <option value="B">B Tier</option>
                        <option value="C">C Tier</option>
                        
                      </select>
                      <button
                        className="delete-recipe-btn"
                        onClick={() => handleDeleteRecipe(recipe._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="edit-form-actions">
                <button type="button" className="cancel-btn" onClick={handleEditClose}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 