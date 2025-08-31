# Cordinova Punch Clock - Developer Documentation

## 🚀 Quick Start
Simple time tracking system for our team. Master password unlocks everything, employees punch in/out with 4-digit codes.

## 🏗️ Architecture
**Frontend:** Vanilla JS + HTML5 + CSS3  
**Database:** JSONBin.io (free tier)  
**Auth:** Custom credential derivation + MD5 hashing  
**Hosting:** GitHub Pages (static)  

## 🔐 Security Model

### Master Authentication
```javascript
```

### Employee Whitelist
Only 4 valid employee IDs can punch in/out:
- `hans` (****)
- `eh` (****) 
- `ryan` (****)
- `ally` (****)

### Tamper Protection
- Data sanitization on every read/write
- Invalid entries auto-removed
- Hash integrity verification
- Anomaly detection (spam prevention)

## 🔧 How Credential Derivation Works
```javascript
function deriveCredentials(masterCode) {
    const salt = "********************";
    const seed = MD5(masterCode + salt);
    return { apiKey: "...", binId: "..." };
}
```

## 📊 Data Flow
1. Master code → Derives JSONBin credentials
2. Employee code → Validates against whitelist
3. Punch data → Stored in JSONBin with hash verification
4. Multi-device sync → All devices read from same JSONBin bucket

## 🛡️ Security Features
- **No secrets in public code** (credential derivation)
- **Employee whitelist enforcement** (only 4 people)
- **Data integrity checks** (MD5 verification)
- **Automatic tamper removal** (malicious data filtered)
- **Multi-layer authentication** (master + employee codes)

## 🌐 Deployment
Works on any static host (GitHub Pages, Vercel, Netlify). No server required, no build process, just HTML/CSS/JS.

## 📱 Usage
Team members visit the site, enter master code once, then use their 4-digit employee codes to punch in/out. Data syncs across all devices automatically.

## 🔍 Why This Architecture?
- **Simple:** No complex backend or database setup
- **Secure:** Multiple security layers without exposing credentials  
- **Portable:** Works anywhere static sites can be hosted
- **Cost-effective:** Free tier services only
- **Maintainable:** Vanilla JS, no frameworks or dependencies
