// Use relative API path so it works locally and on Render
const API_URL = '/api';
let adminToken = localStorage.getItem('adminToken');

// Initialize admin login check on page load
window.addEventListener('load', () => {
  // Ensure modal is hidden on first load; shown only when admin tab is clicked
  document.getElementById('adminLoginModal').classList.remove('active');
});

// Admin Login
async function adminLogin() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  if (!username || !password) {
    showAdminError('Username and password required');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      document.getElementById('adminLoginModal').classList.remove('active');
      alert('✓ Login successful!');
      // After login, take user to the admin panel
      showTab('admin');
    } else {
      showAdminError(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
    showAdminError('An error occurred during login');
  }
}

function showAdminError(message) {
  const errorEl = document.getElementById('adminLoginError');
  errorEl.classList.add('error');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

// Admin Logout
function adminLogout() {
  fetch(`${API_URL}/admin/logout`, {
    method: 'POST',
    headers: {
      'Authorization': adminToken,
    },
  });
  
  adminToken = null;
  localStorage.removeItem('adminToken');
  document.getElementById('adminLoginModal').classList.add('active');
  // Return to register tab after logout
  showTab('register');
  alert('✓ Logged out successfully');
}

// Tab switching
function showTab(tabName) {
  // Check if trying to access admin panel
  if (tabName === 'admin') {
    if (!adminToken) {
      event.preventDefault();
      // Show login modal instead of blocking the page
      document.getElementById('adminLoginModal').classList.add('active');
      return;
    }
    loadAdminDonors();
  }

  // Hide all tabs
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  document.getElementById(tabName).classList.add('active');

  // Add active class to clicked button
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    const btn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (btn) btn.classList.add('active');
  }
}

// Register form submission
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    student_id: document.getElementById('studentId').value,
    name: document.getElementById('name').value,
    blood_group: document.getElementById('bloodGroup').value,
    address: document.getElementById('address').value,
    phone_number: document.getElementById('phoneNumber').value,
    level: document.getElementById('level').value,
    term: document.getElementById('term').value,
  };

  try {
    const response = await fetch(`${API_URL}/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    const messageEl = document.getElementById('registerMessage');

    if (response.ok) {
      messageEl.classList.remove('error');
      messageEl.classList.add('success');
      messageEl.textContent = '✓ Registration successful! Welcome to the blood donor registry.';
      document.getElementById('registrationForm').reset();
    } else {
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
      messageEl.textContent = '✗ ' + (data.error || 'Registration failed');
    }

    messageEl.style.display = 'block';
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
    const messageEl = document.getElementById('registerMessage');
    messageEl.classList.remove('success');
    messageEl.classList.add('error');
    messageEl.textContent = '✗ An error occurred. Please try again.';
    messageEl.style.display = 'block';
  }
});

// Search donors
async function searchDonors() {
  const bloodGroup = document.getElementById('searchBloodGroup').value;

  if (!bloodGroup) {
    alert('Please select a blood group');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/donors/search/${bloodGroup}`);
    const donors = await response.json();
    displaySearchResults(donors, bloodGroup);
  } catch (error) {
    console.error('Error:', error);
    alert('Error searching donors');
  }
}

// Display search results
function displaySearchResults(donors, bloodGroup) {
  const resultsEl = document.getElementById('searchResults');

  if (donors.length === 0) {
    resultsEl.innerHTML = `<div class="no-results">No donors found with blood group <strong>${bloodGroup}</strong></div>`;
    return;
  }

  let html = `<h3>Found ${donors.length} donor(s) with blood group ${bloodGroup}</h3>`;
  html += donors.map(donor => createDonorCard(donor)).join('');

  resultsEl.innerHTML = html;
}

// Load all donors
async function loadAllDonors() {
  try {
    const response = await fetch(`${API_URL}/donors`);
    const donors = await response.json();
    displayAllDonors(donors);
  } catch (error) {
    console.error('Error:', error);
    alert('Error loading donors');
  }
}

// Display all donors
function displayAllDonors(donors) {
  const donorsEl = document.getElementById('allDonors');

  if (donors.length === 0) {
    donorsEl.innerHTML = '<div class="no-results">No donors registered yet</div>';
    return;
  }

  let html = `<p style="color: #666; margin-bottom: 20px;">Total registered donors: <strong>${donors.length}</strong></p>`;
  html += donors.map(donor => createDonorCard(donor)).join('');

  donorsEl.innerHTML = html;
}

// Create donor card HTML
function createDonorCard(donor) {
  return `
    <div class="donor-card">
      <h3>${donor.name}</h3>
      <div class="donor-info">
        <div class="info-group">
          <span class="info-label">Student ID</span>
          <span class="info-value">${donor.student_id}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Blood Group</span>
          <span class="blood-group-badge">${donor.blood_group}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Phone Number</span>
          <span class="info-value">${donor.phone_number}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Address</span>
          <span class="info-value">${donor.address}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Level</span>
          <span class="info-value">${donor.level}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Term</span>
          <span class="info-value">${donor.term}</span>
        </div>
      </div>
    </div>
  `;
}

// ADMIN FUNCTIONS

// Load all donors for admin
async function loadAdminDonors() {
  try {
    const response = await fetch(`${API_URL}/admin/donors`, {
      headers: {
        'Authorization': adminToken,
      },
    });

    if (response.status === 401) {
      adminToken = null;
      localStorage.removeItem('adminToken');
      document.getElementById('adminLoginModal').classList.add('active');
      alert('Session expired. Please login again.');
      return;
    }

    const donors = await response.json();
    displayAdminDonorsList(donors);
  } catch (error) {
    console.error('Error:', error);
    alert('Error loading donors');
  }
}

// Display admin donor list with management options
function displayAdminDonorsList(donors) {
  const listEl = document.getElementById('adminDonorsList') || createAdminPanel();

  if (donors.length === 0) {
    listEl.innerHTML = '<div class="no-results">No donors registered yet</div>';
    return;
  }

  let html = `<p style="color: #666; margin-bottom: 20px;">Total donors: <strong>${donors.length}</strong></p>`;
  html += `<table class="admin-table">
    <thead>
      <tr>
        <th>Student ID</th>
        <th>Name</th>
        <th>Blood Group</th>
        <th>Phone</th>
        <th>Level</th>
        <th>Last Donation</th>
        <th>Total Donations</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>`;

  donors.forEach(donor => {
    const lastDonation = donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never';
    html += `
      <tr>
        <td>${donor.student_id}</td>
        <td>${donor.name}</td>
        <td><span class="blood-group-badge">${donor.blood_group}</span></td>
        <td>${donor.phone_number}</td>
        <td>${donor.level}</td>
        <td>${lastDonation}</td>
        <td><span class="donation-badge">${donor.total_donations || 0}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-record" onclick="openDonationModal(${donor.id}, '${donor.name}')">Record Donation</button>
            <button class="btn-delete" onclick="confirmDelete(${donor.id}, '${donor.name}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  listEl.innerHTML = html;
}

function createAdminPanel() {
  const adminContainer = document.getElementById('adminContainer');
  const html = `
    <h2>👨‍💼 Admin Panel - Donor Management</h2>
    <div class="admin-controls">
      <button class="btn btn-secondary" onclick="loadAdminDonors()">Load All Donors</button>
      <button class="btn btn-delete" onclick="adminLogout()" style="margin-left: 10px;">Logout</button>
    </div>
    <div id="adminDonorsList" class="results-container"></div>
  `;
  adminContainer.innerHTML = html;
  return document.getElementById('adminDonorsList');
}

// Open donation modal
function openDonationModal(donorId, donorName) {
  const modal = document.createElement('div');
  modal.id = `modal-${donorId}`;
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <div class="modal-header">Record Donation for ${donorName}</div>
      <div class="modal-body">
        <div class="form-group">
          <label for="donationDate">Donation Date:</label>
          <input type="date" id="donationDate" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
      </div>
      <div class="modal-buttons">
        <button class="btn-cancel" onclick="document.getElementById('modal-${donorId}').remove()">Cancel</button>
        <button class="btn-confirm" onclick="recordDonation(${donorId}, '${donorName}')">Record</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Record donation
async function recordDonation(donorId, donorName) {
  const donationDate = document.getElementById('donationDate').value;

  if (!donationDate) {
    alert('Please select a donation date');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken,
      },
      body: JSON.stringify({
        donor_id: donorId,
        donation_date: donationDate,
      }),
    });

    if (response.ok) {
      alert(`✓ Donation recorded for ${donorName} on ${new Date(donationDate).toLocaleDateString()}`);
      document.getElementById(`modal-${donorId}`).remove();
      loadAdminDonors();
    } else {
      alert('Error recording donation');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error recording donation');
  }
}

// Confirm delete
function confirmDelete(donorId, donorName) {
  const modal = document.createElement('div');
  modal.id = `modal-delete-${donorId}`;
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <div class="modal-header">Delete Donor</div>
      <div class="modal-body">
        <p>Are you sure you want to delete <strong>${donorName}</strong>?</p>
        <p style="color: #d32f2f; font-weight: 600; margin-top: 10px;">This action cannot be undone.</p>
      </div>
      <div class="modal-buttons">
        <button class="btn-cancel" onclick="document.getElementById('modal-delete-${donorId}').remove()">Cancel</button>
        <button class="btn-delete" onclick="deleteDonor(${donorId})">Delete Permanently</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Delete donor
async function deleteDonor(donorId) {
  try {
    const response = await fetch(`${API_URL}/donors/${donorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': adminToken,
      },
    });

    if (response.ok) {
      alert('✓ Donor deleted successfully');
      document.getElementById(`modal-delete-${donorId}`).remove();
      loadAdminDonors();
    } else {
      alert('Error deleting donor');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting donor');
  }
}

