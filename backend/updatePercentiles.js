const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { updateAllNodesWithPercentiles } = require('./utils/slaPercentile');

dotenv.config();

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('⏳ Starting accurate percentile calculation...');
    console.log('📊 This will fetch real-time uptime for each node');
    console.log('⌛ Estimated time: 2-5 minutes for 100 nodes\n');

    // Run the update (uses uptimeService for accuracy)
    const result = await updateAllNodesWithPercentiles('7d');
    
    if (result.success) {
      console.log('\n✅ Update completed successfully!');
      console.log(`📊 Total nodes updated: ${result.totalNodes}`);
      console.log(`🏆 Top 1% nodes: ${result.top1PercentCount}`);
    } else {
      console.log('\n❌ Update failed:', result.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

run();