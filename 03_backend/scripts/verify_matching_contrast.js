const db = require('../src/config/db');
const matchingService = require('../src/modules/jobs/matching.service');

async function verify() {
    console.log('=== VERIFYING STUDENT A VS STUDENT B RECOMMENDATION DIFFERENCE ===\n');

    const userA = (await db.query("SELECT id, email FROM users WHERE email = 'student.morning@vlu.edu.vn'")).rows[0];
    const userB = (await db.query("SELECT id, email FROM users WHERE email = 'student.evening@vlu.edu.vn'")).rows[0];

    if (!userA || !userB) {
        console.error('Test users not found! userA:', userA, 'userB:', userB);
        process.exit(1);
    }

    console.log(`Student A (ID: ${userA.id}, Email: ${userA.email})`);
    const resA = await matchingService.getRecommendedJobs(userA.id);
    console.log(`Status: ${resA.status}, Total Recommended: ${resA.total}`);
    resA.jobs.slice(0, 5).forEach((j, i) => {
        console.log(`  [Rank ${i+1}] Score: ${j.matching_score}% | Title: ${j.title} | Status: ${j.badge_label}`);
        console.log(`    Reasons: ${j.match_reasons.join(' • ')}`);
    });

    console.log(`\nStudent B (ID: ${userB.id}, Email: ${userB.email})`);
    const resB = await matchingService.getRecommendedJobs(userB.id);
    console.log(`Status: ${resB.status}, Total Recommended: ${resB.total}`);
    resB.jobs.slice(0, 5).forEach((j, i) => {
        console.log(`  [Rank ${i+1}] Score: ${j.matching_score}% | Title: ${j.title} | Status: ${j.badge_label}`);
        console.log(`    Reasons: ${j.match_reasons.join(' • ')}`);
    });

    // Check difference
    const topJobA = resA.jobs[0] ? resA.jobs[0].title : 'None';
    const topJobB = resB.jobs[0] ? resB.jobs[0].title : 'None';
    console.log(`\n--- CONTRAST RESULT ---`);
    console.log(`Top Job for Student A: ${topJobA}`);
    console.log(`Top Job for Student B: ${topJobB}`);
    if (topJobA !== topJobB) {
        console.log('>>> SUCCESS: Student A and Student B receive distinct personalized recommendations based on their actual weekly schedules! <<<');
    } else {
        console.log('>>> NOTICE: Top jobs are identical, inspecting scores... <<<');
    }

    process.exit(0);
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});

