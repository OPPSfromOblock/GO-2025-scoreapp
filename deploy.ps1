# Firebase Deployment Script
# Run this script after installing Node.js and Firebase CLI

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Multi-Sport Scoresheet - Firebase Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Node.js is installed
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

# Step 2: Check if Firebase CLI is installed
Write-Host "[2/5] Checking Firebase CLI installation..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI $firebaseVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install Firebase CLI" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✓ Firebase CLI installed successfully" -ForegroundColor Green
}

# Step 3: Login to Firebase
Write-Host "[3/5] Logging in to Firebase..." -ForegroundColor Yellow
$loginStatus = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Opening browser for authentication..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Login failed" -ForegroundColor Red
        pause
        exit 1
    }
}
Write-Host "✓ Logged in to Firebase" -ForegroundColor Green

# Step 4: Check firebase.json exists
Write-Host "[4/5] Checking configuration..." -ForegroundColor Yellow
if (Test-Path "firebase.json") {
    Write-Host "✓ firebase.json found" -ForegroundColor Green
} else {
    Write-Host "✗ firebase.json not found!" -ForegroundColor Red
    Write-Host "Please make sure firebase.json exists in this directory" -ForegroundColor Yellow
    pause
    exit 1
}

# Step 5: Deploy to Firebase Hosting
Write-Host "[5/5] Deploying to Firebase Hosting..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Deploying your Multi-Sport Scoresheet Manager..." -ForegroundColor Cyan
Write-Host ""

firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  🎉 DEPLOYMENT SUCCESSFUL! 🎉" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is now live at:" -ForegroundColor Yellow
    Write-Host "https://gc-score.web.app" -ForegroundColor Cyan
    Write-Host "https://gc-score.firebaseapp.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your live site" -ForegroundColor White
    Write-Host "2. Test authentication and scoring" -ForegroundColor White
    Write-Host "3. Update Firestore security rules in Firebase Console" -ForegroundColor White
    Write-Host "4. Share the URL with your team!" -ForegroundColor White
    Write-Host ""
    Write-Host "To update your site later, just run this script again!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
