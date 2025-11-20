/**
 * Diagnostic and Fix Script for POS Transaction Issues
 * 
 * This script helps identify and fix issues with POS transactions not appearing
 * in the accounting dashboard and sales reports.
 */

// Function to diagnose POS transactions in localStorage
function diagnosePOSTransactions() {
  console.log('🔍 Diagnosing POS transactions...');
  
  try {
    // Get transactions from localStorage
    const transactionsJson = localStorage.getItem('vanity_transactions');
    
    if (!transactionsJson) {
      console.log('❌ No transactions found in localStorage');
      return;
    }
    
    const transactions = JSON.parse(transactionsJson);
    console.log(`📊 Total transactions: ${transactions.length}`);
    
    // Filter POS transactions
    const posTransactions = transactions.filter(tx => tx.source === 'pos');
    console.log(`💰 POS transactions: ${posTransactions.length}`);
    
    // Group by location
    const transactionsByLocation = {};
    posTransactions.forEach(tx => {
      const location = tx.location || 'no-location';
      if (!transactionsByLocation[location]) {
        transactionsByLocation[location] = [];
      }
      transactionsByLocation[location].push(tx);
    });
    
    console.log('📍 POS transactions by location:');
    Object.keys(transactionsByLocation).forEach(location => {
      console.log(`   ${location}: ${transactionsByLocation[location].length} transactions`);
    });
    
    // Check for transactions with issues
    const transactionsWithIssues = posTransactions.filter(tx => {
      return !tx.location || tx.location === undefined || tx.location === null;
    });
    
    if (transactionsWithIssues.length > 0) {
      console.log(`⚠️  Transactions with location issues: ${transactionsWithIssues.length}`);
      transactionsWithIssues.forEach(tx => {
        console.log(`   - ID: ${tx.id}, Date: ${tx.date}, Amount: ${tx.amount}`);
      });
    } else {
      console.log('✅ All POS transactions have valid locations');
    }
    
    return {
      totalTransactions: transactions.length,
      posTransactions: posTransactions.length,
      transactionsByLocation,
      transactionsWithIssues: transactionsWithIssues.length
    };
  } catch (error) {
    console.error('❌ Error diagnosing transactions:', error);
    return null;
  }
}

// Function to fix POS transaction issues
function fixPOSTransactions() {
  console.log('🔧 Fixing POS transactions...');
  
  try {
    // Get transactions from localStorage
    const transactionsJson = localStorage.getItem('vanity_transactions');
    
    if (!transactionsJson) {
      console.log('❌ No transactions found in localStorage');
      return false;
    }
    
    let transactions = JSON.parse(transactionsJson);
    let fixedCount = 0;
    
    // Fix transactions with missing locations
    transactions = transactions.map(tx => {
      if (tx.source === 'pos' && (!tx.location || tx.location === undefined || tx.location === null)) {
        // Set a default location
        tx.location = 'loc1';
        tx.updatedAt = new Date().toISOString();
        fixedCount++;
        console.log(`✅ Fixed transaction ${tx.id} - set location to loc1`);
      }
      return tx;
    });
    
    // Save fixed transactions back to localStorage
    if (fixedCount > 0) {
      localStorage.setItem('vanity_transactions', JSON.stringify(transactions));
      console.log(`✅ Fixed ${fixedCount} transactions`);
      return true;
    } else {
      console.log('✅ No transactions needed fixing');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fixing transactions:', error);
    return false;
  }
}

// Function to test transaction filtering
function testTransactionFiltering() {
  console.log('🧪 Testing transaction filtering...');
  
  // Mock filter function similar to the one in transaction-provider.tsx
  function filterTransactions(transactions, filter) {
    return transactions.filter(tx => {
      // Filter by location
      if (filter.location && filter.location !== 'all' && tx.location !== filter.location) {
        // Special case for POS transactions
        if (tx.source === 'pos') {
          console.log(`🔍 POS transaction ${tx.id} with location ${tx.location} - filter location: ${filter.location}`);
          return true; // Include POS transactions
        }
        return false;
      }
      return true;
    });
  }
  
  try {
    // Get transactions from localStorage
    const transactionsJson = localStorage.getItem('vanity_transactions');
    
    if (!transactionsJson) {
      console.log('❌ No transactions found in localStorage');
      return;
    }
    
    const transactions = JSON.parse(transactionsJson);
    const posTransactions = transactions.filter(tx => tx.source === 'pos');
    
    console.log(`📊 Testing with ${posTransactions.length} POS transactions`);
    
    // Test filtering by different locations
    const testLocations = ['loc1', 'loc2', 'loc3'];
    
    testLocations.forEach(location => {
      const filtered = filterTransactions(posTransactions, { location });
      console.log(`📍 Filter by ${location}: ${filtered.length} transactions`);
    });
    
  } catch (error) {
    console.error('❌ Error testing transaction filtering:', error);
  }
}

// Main function
function runDiagnostics() {
  console.log('🚀 Running POS Transaction Diagnostics');
  console.log('=====================================');
  
  // Run diagnostics
  const diagnosis = diagnosePOSTransactions();
  
  if (diagnosis) {
    console.log('\n📋 Diagnosis Summary:');
    console.log(`   Total transactions: ${diagnosis.totalTransactions}`);
    console.log(`   POS transactions: ${diagnosis.posTransactions}`);
    console.log(`   Transactions with issues: ${diagnosis.transactionsWithIssues}`);
    
    // If there are issues, offer to fix them
    if (diagnosis.transactionsWithIssues > 0) {
      console.log('\n🔧 Fixing issues...');
      const fixed = fixPOSTransactions();
      if (fixed) {
        console.log('✅ Fixing complete. Re-running diagnostics...');
        diagnosePOSTransactions();
      }
    }
    
    // Test filtering
    console.log('\n🧪 Testing transaction filtering...');
    testTransactionFiltering();
  }
  
  console.log('\n✅ Diagnostics complete');
}

// Run the diagnostics
runDiagnostics();