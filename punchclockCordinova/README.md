# Cordinova Punch Clock System

A secure, web-based punch clock system for Cordinova team members.

## Features

- **Secure Access**: Code protection with MD5 hashing
- **Employee Management**: Support for multiple employees with individual punch codes
- **Time Tracking**: Accurate punch in/out with automatic hour calculations
- **Data Integrity**: All data stored with MD5 hash verification to prevent tampering
- **Weekly Reports**: Downloadable PDF reports for time tracking
- **Real-time Clock**: Live time display
- **Responsive Design**: Works on desktop and mobile devices

## Team Members

- **Hans Gamlien** - Founder (Secure 4-digit code)
- **Eh the Moo Htoo** - Co-Founder (Secure 4-digit code)  
- **Ryan** - Co-Founder (Secure 4-digit code)

*Note: Actual punch codes are not disclosed in this public repository for security*

## Security Features

- **Secure Code Storage**: Actual access codes are NOT stored in source code
- **Pre-computed Hashes**: Only MD5 hashes are stored in JavaScript files
- **Master Access Protection**: System requires master code for each session
- **Employee Code Protection**: Individual punch codes are hashed
- **Data Integrity**: All time log data verified with hash checksums
- **GitHub Safe**: No sensitive information exposed in public repository

## Usage

1. Enter the master access code to unlock the system
2. Employees enter their 4-digit punch codes to clock in/out
3. Admin can view logs, generate weekly reports, and manage the system
4. Weekly reports can be downloaded as PDF files

## Technical Implementation

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Security**: MD5 hashing via CryptoJS library
- **PDF Generation**: jsPDF library
- **Storage**: Browser localStorage with hash verification
- **Responsive**: Mobile-first CSS design

## File Structure

```
punchclockCordinova/
├── index.html          # Main application interface
├── styles.css          # Styling and responsive design
├── script.js           # Core functionality and logic
└── README.md          # This documentation
```

## Security Notes

- All employee codes and master access codes are hashed using MD5
- Data integrity is verified on every read operation
- Tampering with localStorage will result in data rejection
- System requires master code access for each session

---

*Built temporarily for Cordinova - The future of workforce management*
