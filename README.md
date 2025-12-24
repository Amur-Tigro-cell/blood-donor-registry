# University Blood Donor Registry

A complete web application for registering and managing blood donors within a university. Students can register as donors and administrators can search for donors by blood group.

## Features

- **Student Registration**: Students can register as blood donors with their information
- **Search Functionality**: Search for donors by blood group (AB+, AB-, A+, A-, B+, B-, O+, O-)
- **View All Donors**: See a complete list of all registered donors
- **Donor Information**: Each donor record includes:
  - Student ID
  - Full Name
  - Blood Group
  - Address
  - Phone Number
  - Academic Level (100, 200, 300, 400)
  - Term (First, Second, Third)

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **API**: RESTful API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup

1. Navigate to the project directory:
   ```powershell
   cd "d:\Blood doner"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the server:
   ```powershell
   npm start
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Development

To run with auto-reload (requires nodemon):

```powershell
npm run dev
```

## API Endpoints

### POST /api/donors
Register a new blood donor
- Request body:
  ```json
  {
    "student_id": "STU001",
    "name": "John Doe",
    "blood_group": "AB+",
    "address": "123 Main St",
    "phone_number": "1234567890",
    "level": "300",
    "term": "First"
  }
  ```

### GET /api/donors/search/:bloodGroup
Search donors by blood group (e.g., `/api/donors/search/AB+`)

### GET /api/donors
Get all registered donors

### GET /api/donors/:id
Get a specific donor by ID

### PUT /api/donors/:id
Update donor information

### DELETE /api/donors/:id
Delete a donor record

## Project Structure

```
Blood doner/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── script.js       # Frontend JavaScript
├── src/
│   └── server.js       # Express server and API routes
├── package.json        # Project dependencies
├── donors.db           # SQLite database (created on first run)
└── README.md          # This file
```

## Usage

1. **Register as a Donor**:
   - Click "Register as Donor" tab
   - Fill in all required information
   - Click "Register"

2. **Search for Donors**:
   - Click "Search Donors" tab
   - Select a blood group from the dropdown
   - Click "Search"
   - View all donors with that blood group

3. **View All Donors**:
   - Click "All Donors" tab
   - Click "Load Donors" to see the complete list

## Database

The application uses SQLite3 for data storage. The database file (`donors.db`) is automatically created when the server starts for the first time.

### Database Schema

```sql
CREATE TABLE donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  level TEXT NOT NULL,
  term TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Error Handling

- Duplicate student IDs are prevented (unique constraint)
- All required fields must be filled during registration
- Empty search results display a helpful message
- API errors are caught and displayed to the user

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

ISC

## Author

Created for University Blood Donor Management System
