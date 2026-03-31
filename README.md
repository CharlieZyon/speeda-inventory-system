# Speada E-Bike Inventory System v1.0

A clean and modern inventory management system for Speada e-bike chain stores. This system allows multiple branches to manage their inventory and search across all branches for specific e-bike models.

## Features

- **User Authentication**: Each branch can signup with their phone number and password
- **Branch Inventory Management**: Add, edit, and delete e-bike units with details like model, color, battery, accessories, and problems
- **Cross-Branch Search**: Search for specific unit models across all branches
- **Responsive Design**: Works on both PC and mobile devices (Android & iPhone)
- **Clean UI**: Professional interface matching your spreadsheet layout

## Technology Stack

- **Backend**: Node.js, Express, SQLite, JWT Authentication
- **Frontend**: React, Axios
- **Database**: SQLite (easy to setup, no external database required)

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Backend Dependencies

1. Open Terminal/Command Prompt
2. Navigate to the backend folder:
   ```bash
   cd speada-inventory-system/backend
   ```
3. The dependencies are already installed, but if needed:
   ```bash
   npm install
   ```

### Step 2: Install Frontend Dependencies

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Dependencies are already installed, but if needed:
   ```bash
   npm install
   ```

### Step 3: Start the Backend Server

1. Navigate to backend folder:
   ```bash
   cd speada-inventory-system/backend
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. You should see: "Speada Inventory API running on http://localhost:5000"
4. **Keep this terminal window open**

### Step 4: Start the Frontend

1. Open a **NEW** Terminal/Command Prompt window
2. Navigate to frontend folder:
   ```bash
   cd speada-inventory-system/frontend
   ```
3. Start the React app:
   ```bash
   npm start
   ```
4. The app will automatically open in your browser at http://localhost:3000

## How to Use

### First Time Setup

1. **Create Branch Account**:
   - Click "Create New Branch Account"
   - Enter Branch Name (e.g., "Dinalupihan", "Orani")
   - Enter Phone Number (e.g., "9693435570")
   - Create a Password
   - Click "Sign Up"

2. **Add Your Inventory**:
   - Click "+ Add Unit" button
   - Fill in the details:
     - Unit Model (e.g., V8, B2, E1, V10)
     - Color (e.g., Red, Yellow, Mint Green)
     - Battery (e.g., 48v/20Ah, 60v/38Ah)
     - Has Charger? (Yes/No)
     - Has Tarpal? (Yes/No)
     - Problem (optional, e.g., "a bit scratch", "not brand new")
   - Click "Save"

### Managing Inventory

- **View Inventory**: Your branch inventory is displayed in a table
- **Edit Unit**: Click "Edit" button on any unit to modify details
- **Delete Unit**: Click "Delete" button to remove a unit (confirms before deleting)

### Searching Across Branches

1. Use the search bar at the top
2. Enter a unit model (e.g., "V8", "B2", "E1")
3. Click "Search" or press Enter
4. Results will show which branches have that model with full details
5. You can see the branch name and phone number to contact them

### Login Again

- Use your phone number and password to login
- Your session will stay active even if you close the browser

## Project Structure

```
speada-inventory-system/
├── backend/
│   ├── server.js          # Main API server
│   ├── database.js        # Database setup
│   ├── speada.db         # SQLite database (auto-created)
│   └── package.json      # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React application
│   │   └── App.css       # Styling
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## Database Schema

### Branches Table
- id (Primary Key)
- branch_name (Unique)
- phone (Unique)
- password (Encrypted)
- created_at

### Units Table
- id (Primary Key)
- branch_id (Foreign Key)
- unit_name (Model)
- color
- battery
- has_charger
- has_tarpal
- problem
- created_at

## API Endpoints

- `POST /api/auth/signup` - Create new branch account
- `POST /api/auth/login` - Login to branch account
- `GET /api/inventory` - Get branch inventory
- `POST /api/inventory` - Add new unit
- `PUT /api/inventory/:id` - Update unit
- `DELETE /api/inventory/:id` - Delete unit
- `GET /api/search?query=V8` - Search across all branches

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check if Node.js is installed: `node --version`

### Frontend won't start
- Make sure port 3000 is not in use
- Make sure backend is running first

### Cannot connect to API
- Ensure backend is running on http://localhost:5000
- Check browser console for errors

### Forgot Password
- Currently no password reset feature
- For v1.0, you'll need to contact admin or create new account

## Future Enhancements (v2.0)

- Password reset functionality
- Admin dashboard to view all branches
- Export inventory to Excel/PDF
- Image upload for e-bikes
- Stock notifications
- Transfer units between branches
- Analytics and reporting

## Support

If you encounter any issues, please contact the development team.

---

**Speada Inventory System v1.0**
Built for Speada E-Bike Chain Management
