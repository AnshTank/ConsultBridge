const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  console.log('🚀 Starting PDF generation...');
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Load the HTML file
    const htmlPath = path.join(__dirname, 'CONSULTBRIDGE_VISUAL_DESIGN.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('📄 Generating PDF...');
    
    // Generate PDF
    const pdfPath = path.join(__dirname, 'ConsultBridge_System_Design.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          ConsultBridge System Design Documentation
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    });
    
    await browser.close();
    
    console.log('✅ PDF generated successfully!');
    console.log(`📁 Location: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

// Run if called directly
if (require.main === module) {
  generatePDF();
}

module.exports = generatePDF;