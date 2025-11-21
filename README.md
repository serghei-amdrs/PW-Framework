# PW-Framework

A Playwright testing framework for automated web testing.

## 🚀 Initial Setup

1. **Clone the testing framework:**
   ```bash
   git clone https://github.com/serghei-amdrs/PW-Framework.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Run tests:**
   ```bash
   npx playwright test
   ```

## 🌍 Using Environment Variables

### 1. Set Environment (dev | local)

**Bash/Linux/macOS:**
```bash
export ENVIRONMENT=dev
```

**PowerShell:**
```powershell
$env:ENVIRONMENT = "dev"
```

### 2. Verify Environment Setting

**Bash/Linux/macOS:**
```bash
echo $ENVIRONMENT
```

**PowerShell:**
```powershell
echo $env:ENVIRONMENT
```

### 3. Example of accessing variables in Tests :

**Basic usage:**
```javascript
const url = process.env.URL;
const apiUrl = process.env.API_URL;
```

**With type safety and defaults:**
```javascript
const baseUrl = process.env.URL || 'http://localhost:3000';
const username = process.env.USER_NAME || 'defaultUser';
```

**Open the report file:**
```bash
npx playwright show-report
```