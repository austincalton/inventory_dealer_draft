const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAILS_URL = 'http://cf.local.gosokal.com:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/component-previews');
const ALLOWED_COMPONENTS_PATH = path.join(__dirname, '../src/config/allowedComponents.js');
const RAILS_API_URL = `${RAILS_URL}/api/components`;

const VIEWPORT = { width: 1200, height: 675 };
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const LOAD_TIMEOUT_MS = 10000;

async function readAllowedComponents() {
  const content = fs.readFileSync(ALLOWED_COMPONENTS_PATH, 'utf-8');
  
  const extractArray = (section) => {
    const regex = new RegExp(`${section}:\\s*\\[([\\s\\S]*?)\\]`);
    const match = content.match(regex);
    if (!match) return [];
    
    return match[1]
      .split('\n')
      .map(line => line.trim().replace(/[",]/g, ''))
      .filter(line => line.length > 0);
  };
  
  return {
    navigation: extractArray('navigation'),
    home_page: extractArray('home_page'),
    footer: extractArray('footer')
  };
}

async function fetchComponentMetadata() {
  const response = await fetch(RAILS_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch components: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function getComponentKey(section) {
  const mapping = {
    navigation: 'navigation',
    home_page: 'home_page',
    footer: 'footer'
  };
  return mapping[section] || section;
}

function buildPreviewUrl(componentId, section) {
  const value = encodeURIComponent(JSON.stringify([[`id_${componentId}`, 1]]));
  
  let orderNav = '[]';
  let order = '[]';
  let orderFooter = '[]';
  
  if (section === 'navigation') {
    orderNav = value;
  } else if (section === 'home_page') {
    order = value;
  } else if (section === 'footer') {
    orderFooter = value;
  }
  
  return `${RAILS_URL}/ajax/dealerdraft_preview?parent_brand=ford&order_nav=${orderNav}&order=${order}&order_footer=${orderFooter}`;
}

async function takeScreenshot(browser, componentId, section, attempt = 1) {
  const url = buildPreviewUrl(componentId, section);
  const outputPath = path.join(OUTPUT_DIR, `${componentId}.png`);
  
  const context = await browser.newContext({
    viewport: VIEWPORT
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`  Attempt ${attempt}/${MAX_RETRIES}: ${componentId} (${section})`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: LOAD_TIMEOUT_MS
    });
    
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: outputPath,
      fullPage: false
    });
    
    await context.close();
    return { success: true, path: outputPath };
    
  } catch (error) {
    await context.close();
    
    if (attempt < MAX_RETRIES) {
      console.log(`    Retry ${attempt} failed, waiting ${RETRY_DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return takeScreenshot(browser, componentId, section, attempt + 1);
    }
    
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Component Screenshot Generator');
  console.log('='.repeat(50));
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  console.log('\n[1/4] Reading allowed components...');
  const allowedComponents = await readAllowedComponents();
  console.log(`  Found ${allowedComponents.navigation.length} navigation, ${allowedComponents.home_page.length} home_page, ${allowedComponents.footer.length} footer`);
  
  console.log('\n[2/4] Fetching component metadata from Rails...');
  const railsData = await fetchComponentMetadata();
  console.log(`  Received component data from API`);
  
  const allComponents = [
    ...railsData.navigation.map(c => ({ ...c, section: 'navigation' })),
    ...railsData.home_page.map(c => ({ ...c, section: 'home_page' })),
    ...railsData.footer.map(c => ({ ...c, section: 'footer' }))
  ];
  
  const componentsToScreenshot = [];
  
  for (const [section, names] of Object.entries(allowedComponents)) {
    const sectionComponents = allComponents.filter(c => c.section === section);
    
    for (const name of names) {
      const component = sectionComponents.find(c => c.name === name);
      
      if (component) {
        componentsToScreenshot.push({
          id: component.id,
          name: component.name,
          section: section
        });
      } else {
        console.log(`  WARNING: Component not found in Rails: ${name} (${section})`);
      }
    }
  }
  
  console.log(`\n[3/4] Found ${componentsToScreenshot.length} components to process`);
  
  const existingFiles = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''));
  
  console.log(`  Already have ${existingFiles.length} screenshots`);
  
  const componentsNeedingScreenshots = componentsToScreenshot.filter(
    c => !existingFiles.includes(String(c.id))
  );
  
  console.log(`  Need to generate ${componentsNeedingScreenshots.length} new screenshots`);
  
  if (componentsNeedingScreenshots.length === 0) {
    console.log('\n[4/4] All screenshots already exist. Done!');
    return;
  }
  
  console.log('\n[4/4] Launching browser and generating screenshots...');
  
  const browser = await chromium.launch({ headless: true });
  
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  
  for (const component of componentsNeedingScreenshots) {
    const existingFile = `${component.id}.png`;
    
    if (existingFiles.includes(String(component.id))) {
      console.log(`  SKIP: ${component.id} - ${component.name} (already exists)`);
      skipCount++;
      continue;
    }
    
    console.log(`  Processing: ${component.id} - ${component.name}`);
    
    const result = await takeScreenshot(browser, component.id, component.section);
    
    if (result.success) {
      console.log(`    SUCCESS: Saved to ${result.path}`);
      successCount++;
    } else {
      console.log(`    FAILED: ${result.error}`);
      failCount++;
    }
  }
  
  await browser.close();
  
  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  console.log(`  Generated: ${successCount}`);
  console.log(`  Skipped:   ${skipCount}`);
  console.log(`  Failed:    ${failCount}`);
  
  if (failCount > 0) {
    console.log('\nWARNING: Some screenshots failed to generate.');
    process.exit(1);
  }
  
  console.log('\nDone!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
