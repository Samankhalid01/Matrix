/**
 * Test script for the updated risk classification system
 * This script tests the new conservative risk detection logic
 */

const PYTHON_SERVICE_URL = 'http://localhost:5000';

async function testRiskClassification() {
  console.log('🧪 Testing Updated Risk Classification System...\n');

  try {
    // Test 1: Check service health
    console.log('1️⃣ Checking service health...');
    const healthResponse = await fetch(`${PYTHON_SERVICE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Service health:', healthData.status);
    console.log('');

    // Test 2: Get current surveillance incidents
    console.log('2️⃣ Checking current surveillance incidents...');
    const incidentsResponse = await fetch(`${PYTHON_SERVICE_URL}/surveillance/incidents`);
    const incidentsData = await incidentsResponse.json();
    
    if (incidentsResponse.ok) {
      console.log('📊 Current surveillance statistics:');
      console.log(`   Total incidents: ${incidentsData.total}`);
      console.log(`   Flagged incidents: ${incidentsData.flagged}`);
      console.log(`   Pending review: ${incidentsData.pending_review}`);
      console.log('');

      // Analyze risk levels
      if (incidentsData.incidents && incidentsData.incidents.length > 0) {
        console.log('📈 Risk level analysis:');
        const riskLevels = {};
        const flaggedCount = { flagged: 0, normal: 0 };
        
        incidentsData.incidents.forEach(incident => {
          const riskLevel = incident.risk_level || 'Unknown';
          riskLevels[riskLevel] = (riskLevels[riskLevel] || 0) + 1;
          
          if (incident.flagged) {
            flaggedCount.flagged++;
          } else {
            flaggedCount.normal++;
          }
        });

        console.log('   Risk level distribution:');
        Object.entries(riskLevels).forEach(([level, count]) => {
          console.log(`     ${level}: ${count} videos`);
        });
        
        console.log('   Flagged vs Normal:');
        console.log(`     Flagged: ${flaggedCount.flagged} videos`);
        console.log(`     Normal: ${flaggedCount.normal} videos`);
        console.log('');

        // Show recent incidents
        console.log('📋 Recent incidents (last 5):');
        incidentsData.incidents.slice(0, 5).forEach((incident, index) => {
          console.log(`   ${index + 1}. ${incident.video_file}`);
          console.log(`      Risk: ${incident.risk_level}`);
          console.log(`      Flagged: ${incident.flagged ? 'Yes' : 'No'}`);
          console.log(`      Status: ${incident.status}`);
          console.log(`      Detections: ${incident.detection_count || 0}`);
          console.log('');
        });
      } else {
        console.log('   No incidents found');
      }
    } else {
      console.log('❌ Failed to fetch incidents:', incidentsData.error);
    }

    // Test 3: Check notifications
    console.log('3️⃣ Checking notifications...');
    const notificationsResponse = await fetch(`${PYTHON_SERVICE_URL}/surveillance/notifications?unread=true`);
    const notificationsData = await notificationsResponse.json();
    
    if (notificationsResponse.ok) {
      console.log(`📬 Unread notifications: ${notificationsData.unread}`);
      if (notificationsData.notifications && notificationsData.notifications.length > 0) {
        console.log('   Recent notifications:');
        notificationsData.notifications.slice(0, 3).forEach((notification, index) => {
          console.log(`   ${index + 1}. ${notification.title}`);
          console.log(`      Message: ${notification.message}`);
          console.log(`      Priority: ${notification.priority || 'normal'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Failed to fetch notifications');
    }

    console.log('✅ Risk classification test completed!');
    console.log('\n📋 Summary:');
    console.log('- Normal videos should NOT have notifications');
    console.log('- Only flagged videos should require admin review');
    console.log('- Risk levels should be: Normal, Medium, or High');
    console.log('- Normal videos should show "No Action Needed"');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRiskClassification();
