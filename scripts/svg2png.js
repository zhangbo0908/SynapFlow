const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const svgPath = path.resolve(__dirname, '../resources/logo.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  // Inject SVG into HTML with explicit size
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; overflow: hidden; background: transparent;">
        ${svgContent}
        <script>
          const svg = document.querySelector('svg');
          if (svg) {
            svg.setAttribute('width', '1024px');
            svg.setAttribute('height', '1024px');
          }
        </script>
      </body>
    </html>
  `;

  const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
  await win.loadURL(dataUrl);

  // Wait for rendering
  setTimeout(async () => {
    try {
      const image = await win.capturePage();
      const pngBuffer = image.toPNG();
      fs.writeFileSync(path.resolve(__dirname, '../resources/icon.png'), pngBuffer);
      console.log('Successfully created resources/icon.png');
      app.quit();
    } catch (error) {
      console.error('Failed to capture page:', error);
      app.exit(1);
    }
  }, 1000);
});
