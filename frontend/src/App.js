import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [branchInfo, setBranchInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const branch = localStorage.getItem('branch');
    if (token && branch) {
      setIsAuthenticated(true);
      setBranchInfo(JSON.parse(branch));
    }
  }, []);

  const handleLogin = (token, branch) => {
    localStorage.setItem('token', token);
    localStorage.setItem('branch', JSON.stringify(branch));
    setIsAuthenticated(true);
    setBranchInfo(branch);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('branch');
    setIsAuthenticated(false);
    setBranchInfo(null);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Dashboard branchInfo={branchInfo} onLogout={handleLogout} />
  );
}

// Login Component
function LoginForm({ onLogin }) {
  const [branchName, setBranchName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { branchName, password });
      onLogin(response.data.token, response.data.branch);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Speada Inventory Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Branch Name</label>
            <select
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
            >
              <option value="">-- Select Branch --</option>
              <option value="Angeles">Angeles</option>
              <option value="Apalit">Apalit</option>
              <option value="Arayat">Arayat</option>
              <option value="Baliuge">Baliuge</option>
              <option value="Balanga">Balanga</option>
              <option value="Bulaon">Bulaon</option>
              <option value="Capas">Capas</option>
              <option value="Concepcion">Concepcion</option>
              <option value="Dau">Dau</option>
              <option value="Dinalupihan">Dinalupihan</option>
              <option value="Florida">Florida</option>
              <option value="Guagua">Guagua</option>
              <option value="Hermosa">Hermosa</option>
              <option value="Lubao">Lubao</option>
              <option value="Mabalacat">Mabalacat</option>
              <option value="Magalang">Magalang</option>
              <option value="Malolos1">Malolos1</option>
              <option value="Malolos2">Malolos2</option>
              <option value="Malolos3">Malolos3</option>
              <option value="Mexico">Mexico</option>
              <option value="Minalin">Minalin</option>
              <option value="Orani">Orani</option>
              <option value="Orion">Orion</option>
              <option value="Pandan">Pandan</option>
              <option value="Pulilan">Pulilan</option>
              <option value="SF1">SF1</option>
              <option value="SF2">SF2</option>
              <option value="Samal">Samal</option>
              <option value="StaAna">StaAna</option>
              <option value="StoTomas">StoTomas</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password <span style={{fontWeight:'normal', color:'#888', fontSize:'13px'}}>(same as branch name)</span></label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="btn-show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ branchInfo, onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setShowAddModal(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setShowAddModal(true);
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadInventory();
    } catch (err) {
      console.error('Failed to delete unit', err);
    }
  };

  const handleSaveUnit = async (unitData) => {
    try {
      const token = localStorage.getItem('token');
      if (editingUnit) {
        await axios.put(`${API_URL}/inventory/${editingUnit.id}`, unitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/inventory`, unitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      loadInventory();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to save unit', err);
      alert('Failed to save unit');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Speada Inventory System</h1>
        <div className="header-info">
          <div className="branch-info">
            <p><strong>{branchInfo.branchName}</strong></p>
          </div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="search-section">
        <h3 style={{ marginBottom: '15px' }}>Search Across All Branches</h3>
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter unit model (e.g., V8, B2, E1)..."
          />
          <button className="btn-search" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {showSearchResults && (
        <SearchResults
          results={searchResults}
          query={searchQuery}
          onClose={() => setShowSearchResults(false)}
        />
      )}

      <div className="inventory-section">
        <div className="section-header">
          <h2>Your Branch Inventory</h2>
          <button className="btn-add" onClick={handleAddUnit}>+ Add Unit</button>
        </div>

        <InventoryTable
          inventory={inventory}
          onEdit={handleEditUnit}
          onDelete={handleDeleteUnit}
        />
      </div>

      {showAddModal && (
        <UnitModal
          unit={editingUnit}
          onSave={handleSaveUnit}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Inventory Table Component
function InventoryTable({ inventory, onEdit, onDelete }) {
  if (inventory.length === 0) {
    return <div className="no-results">No units in inventory. Click "Add Unit" to start.</div>;
  }

  return (
    <div className="inventory-table">
      <table>
        <thead>
          <tr>
            <th>Unit</th>
            <th>Color</th>
            <th>Battery</th>
            <th>Charger</th>
            <th>Tarpal</th>
            <th>Problem</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((unit) => (
            <tr key={unit.id}>
              <td><strong>{unit.unit_name}</strong></td>
              <td>{unit.color}</td>
              <td>{unit.battery}</td>
              <td>
                <span className={unit.has_charger === 'Yes' ? 'badge badge-yes' : 'badge badge-no'}>
                  {unit.has_charger}
                </span>
              </td>
              <td>
                <span className={unit.has_tarpal === 'Yes' ? 'badge badge-yes' : 'badge badge-no'}>
                  {unit.has_tarpal}
                </span>
              </td>
              <td>{unit.problem || '-'}</td>
              <td>
                <button className="btn-icon btn-edit" onClick={() => onEdit(unit)}>Edit</button>
                <button className="btn-icon btn-delete" onClick={() => onDelete(unit.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Search Results Component
function SearchResults({ results, query, onClose }) {
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.branch_name]) {
      acc[result.branch_name] = [];
    }
    acc[result.branch_name].push(result);
    return acc;
  }, {});

  return (
    <div className="search-results">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Search Results for "{query}"</h3>
        <button className="btn-cancel" onClick={onClose} style={{ width: 'auto', padding: '8px 16px' }}>
          Close
        </button>
      </div>

      {results.length === 0 ? (
        <div className="no-results">No units found matching "{query}"</div>
      ) : (
        <>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            Found {results.length} unit(s) in {Object.keys(groupedResults).length} branch(es)
          </p>
          {Object.entries(groupedResults).map(([branchName, units]) => (
            <div key={branchName} className="result-group">
              <h4>{branchName}</h4>
              <div className="inventory-table">
                <table>
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th>Color</th>
                      <th>Battery</th>
                      <th>Charger</th>
                      <th>Tarpal</th>
                      <th>Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit) => (
                      <tr key={unit.id}>
                        <td><strong>{unit.unit_name}</strong></td>
                        <td>{unit.color}</td>
                        <td>{unit.battery}</td>
                        <td>
                          <span className={unit.has_charger === 'Yes' ? 'badge badge-yes' : 'badge badge-no'}>
                            {unit.has_charger}
                          </span>
                        </td>
                        <td>
                          <span className={unit.has_tarpal === 'Yes' ? 'badge badge-yes' : 'badge badge-no'}>
                            {unit.has_tarpal}
                          </span>
                        </td>
                        <td>{unit.problem || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// Unit Modal Component
function UnitModal({ unit, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    unitName: unit?.unit_name || '',
    color: unit?.color || '',
    battery: unit?.battery || '',
    hasCharger: unit?.has_charger || 'Yes',
    hasTarpal: unit?.has_tarpal || 'Yes',
    problem: unit?.problem || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{unit ? 'Edit Unit' : 'Add New Unit'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Unit Model *</label>
            <input
              type="text"
              value={formData.unitName}
              onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
              placeholder="e.g., V8, B2, E1, V10"
              required
            />
          </div>
          <div className="form-group">
            <label>Color *</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g., Red, Yellow, Mint Green"
              required
            />
          </div>
          <div className="form-group">
            <label>Battery *</label>
            <input
              type="text"
              value={formData.battery}
              onChange={(e) => setFormData({ ...formData, battery: e.target.value })}
              placeholder="e.g., 48v/20Ah, 60v/38Ah"
              required
            />
          </div>
          <div className="form-group">
            <label>Has Charger? *</label>
            <select
              value={formData.hasCharger}
              onChange={(e) => setFormData({ ...formData, hasCharger: e.target.value })}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Has Tarpal? *</label>
            <select
              value={formData.hasTarpal}
              onChange={(e) => setFormData({ ...formData, hasTarpal: e.target.value })}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Problem (Optional)</label>
            <input
              type="text"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="e.g., a bit scratch, not brand new"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
