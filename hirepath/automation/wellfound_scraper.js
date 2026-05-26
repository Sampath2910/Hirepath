const { chromium } = require('playwright');

async function scrapeWellfound() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Searching for Tech Jobs on Wellfound...');
  
  // Note: This is a template script. In production, you would handle 
  // login and complex selector logic.
  await page.goto('https://wellfound.com/jobs');

  const jobs = await page.evaluate(() => {
    const jobCards = document.querySelectorAll('.job-card'); // Example selector
    return Array.from(jobCards).map(card => ({
      title: card.querySelector('.title')?.innerText,
      company: card.querySelector('.company')?.innerText,
      location: card.querySelector('.location')?.innerText,
      url: card.querySelector('a')?.href,
    }));
  });

  console.log(`Found ${jobs.length} jobs.`);
  
  // Send to Spring Boot Backend
  for (const job of jobs) {
    await fetch('http://localhost:8080/api/jobs/scraped', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...job,
        sourcePlatform: 'Wellfound',
        dedupHash: Buffer.from(job.url).toString('base64')
      })
    });
  }

  await browser.close();
}

scrapeWellfound().catch(console.error);
