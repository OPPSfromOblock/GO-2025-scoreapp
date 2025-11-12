// Firebase Sync for Basketball Scoresheet
// Add this script to basketball_scoresheet.html before closing </body> tag

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRBbTB_IFTgYBxTtwgfqHJn8q7Obtcgcc",
  authDomain: "gc-score.firebaseapp.com",
  databaseURL: "https://gc-score-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gc-score",
  storageBucket: "gc-score.firebasestorage.app",
  messagingSenderId: "931498134631",
  appId: "1:931498134631:web:3ae36315460781c95c58c2",
  measurementId: "G-86QNEK7MDQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Store bracket match context
let bracketMatchData = null;

// Add sync button to toolbar
function addSyncButton() {
  const toolbar = document.querySelector('.toolbar .no-print');
  if (!toolbar) return;
  
  const syncBtn = document.createElement('button');
  syncBtn.className = 'btn accent';
  syncBtn.id = 'syncToBracketBtn';
  syncBtn.title = 'Sync scores to bracket';
  syncBtn.style.display = 'none'; // Hidden by default
  syncBtn.innerHTML = '🔄 Sync to Bracket';
  syncBtn.addEventListener('click', syncToBracket);
  
  // Insert before export PDF button
  const exportBtn = document.getElementById('exportPdfBtn');
  if (exportBtn) {
    toolbar.insertBefore(syncBtn, exportBtn);
  } else {
    toolbar.appendChild(syncBtn);
  }
}

// Check if user is admin and show sync button
function checkAdminAndShowSyncButton() {
  // Check opener window for userRole
  if (window.opener && window.opener.userRole === 'admin') {
    const syncBtn = document.getElementById('syncToBracketBtn');
    if (syncBtn) {
      syncBtn.style.display = 'inline-block';
    }
  }
}

// Load match data and store it
function loadBracketMatchData() {
  try {
    const matchData = localStorage.getItem('currentMatch');
    if (matchData) {
      bracketMatchData = JSON.parse(matchData);
      console.log('Bracket match loaded:', bracketMatchData);
      checkAdminAndShowSyncButton();
    }
  } catch (error) {
    console.error('Error loading bracket match data:', error);
  }
}

// Sync scores to bracket
async function syncToBracket() {
  if (!bracketMatchData) {
    alert('No bracket match linked to this scoresheet.');
    return;
  }
  
  // Access global state from basketball_scoresheet.html
  if (typeof state === 'undefined') {
    alert('Scoresheet state not available');
    return;
  }
  
  // Calculate total scores
  const totals = { A: 0, B: 0 };
  if (state.periods && state.scores) {
    state.periods.forEach(pid => {
      totals.A += (state.scores[pid]?.A || 0);
      totals.B += (state.scores[pid]?.B || 0);
    });
  }
  
  if (totals.A === 0 && totals.B === 0) {
    if (!confirm('No scores recorded yet. Sync anyway?')) return;
  }
  
  try {
    // Show loading state
    const syncBtn = document.getElementById('syncToBracketBtn');
    const originalText = syncBtn.textContent;
    syncBtn.disabled = true;
    syncBtn.textContent = '⏳ Syncing...';
    
    // Fetch current bracket
    const bracketDoc = await db.collection('brackets').doc(bracketMatchData.bracketId).get();
    if (!bracketDoc.exists) {
      throw new Error('Bracket not found');
    }
    
    const bracketData = bracketDoc.data();
    const rounds = bracketData.rounds;
    
    // Update match scores
    const match = rounds[bracketMatchData.roundIndex].matches[bracketMatchData.matchIndex];
    match.teamA.score = totals.A;
    match.teamB.score = totals.B;
    
    // Update in Firebase
    await db.collection('brackets').doc(bracketMatchData.bracketId).update({
      rounds: rounds
    });
    
    // Success!
    syncBtn.textContent = '✓ Synced!';
    setTimeout(() => {
      syncBtn.textContent = originalText;
      syncBtn.disabled = false;
    }, 2000);
    
    // Show success banner
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2ea043;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:10000;font-weight:600;';
    banner.textContent = `✓ Scores synced: ${state.setup.teamAName || 'Team A'} ${totals.A} - ${totals.B} ${state.setup.teamBName || 'Team B'}`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3000);
    
    console.log('Sync successful:', totals);
    
  } catch (error) {
    console.error('Sync error:', error);
    alert('Failed to sync to bracket: ' + error.message);
    const syncBtn = document.getElementById('syncToBracketBtn');
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.textContent = '🔄 Sync to Bracket';
    }
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for the page to fully load
  setTimeout(() => {
    addSyncButton();
    loadBracketMatchData();
  }, 500);
});
