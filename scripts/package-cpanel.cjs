/**
 * cPanel Deployment Packager
 * Generates ready-to-upload bundles for standard cPanel hosting:
 *  1. public_html (for Apache/LiteSpeed PHP shared hosting)
 *  2. nodejs_app (for cPanel "Setup Node.js App" with Passenger)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_DIR = path.join(ROOT_DIR, 'cpanel_ready');
const PUBLIC_HTML_DIR = path.join(OUTPUT_DIR, 'public_html');
const NODEJS_APP_DIR = path.join(OUTPUT_DIR, 'nodejs_app');

console.log('📦 [cPanel Packager] Starting packaging process...');

// 1. Build the project first
console.log('⚡ Running production build...');
execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });

// 2. Prepare output directories
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_HTML_DIR, { recursive: true });
fs.mkdirSync(NODEJS_APP_DIR, { recursive: true });

// Helper to copy recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Assemble public_html (Static + PHP API Bridge)
console.log('📄 Assembling public_html package (for standard shared cPanel)...');
copyDir(DIST_DIR, PUBLIC_HTML_DIR);

// Ensure index.html with universal fetch interceptor is in public_html
if (fs.existsSync(path.join(ROOT_DIR, 'index.html'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'index.html'), path.join(PUBLIC_HTML_DIR, 'index.html'));
  fs.copyFileSync(path.join(ROOT_DIR, 'index.html'), path.join(DIST_DIR, 'index.html'));
}

// Ensure .htaccess is in public_html
if (fs.existsSync(path.join(ROOT_DIR, 'public', '.htaccess'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'public', '.htaccess'), path.join(PUBLIC_HTML_DIR, '.htaccess'));
  fs.copyFileSync(path.join(ROOT_DIR, 'public', '.htaccess'), path.join(DIST_DIR, '.htaccess'));
}
// Ensure public/assets are copied
if (fs.existsSync(path.join(ROOT_DIR, 'public', 'assets'))) {
  copyDir(path.join(ROOT_DIR, 'public', 'assets'), path.join(PUBLIC_HTML_DIR, 'assets'));
  copyDir(path.join(ROOT_DIR, 'public', 'assets'), path.join(DIST_DIR, 'assets'));
}
// Ensure public/api and root /api are copied
if (fs.existsSync(path.join(ROOT_DIR, 'public', 'api'))) {
  copyDir(path.join(ROOT_DIR, 'public', 'api'), path.join(PUBLIC_HTML_DIR, 'api'));
}
if (fs.existsSync(path.join(ROOT_DIR, 'api'))) {
  copyDir(path.join(ROOT_DIR, 'api'), path.join(PUBLIC_HTML_DIR, 'api'));
}
// Copy api.php to root of public_html as direct fallback
if (fs.existsSync(path.join(ROOT_DIR, 'public', 'api.php'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'public', 'api.php'), path.join(PUBLIC_HTML_DIR, 'api.php'));
  fs.copyFileSync(path.join(ROOT_DIR, 'public', 'api.php'), path.join(DIST_DIR, 'api.php'));
}

// 4. Assemble nodejs_app (for cPanel Setup Node.js App)
console.log('🚀 Assembling nodejs_app package (for cPanel Setup Node.js App)...');
copyDir(DIST_DIR, path.join(NODEJS_APP_DIR, 'dist'));
fs.copyFileSync(path.join(ROOT_DIR, 'app.js'), path.join(NODEJS_APP_DIR, 'app.js'));
fs.copyFileSync(path.join(ROOT_DIR, 'package.json'), path.join(NODEJS_APP_DIR, 'package.json'));
if (fs.existsSync(path.join(ROOT_DIR, '.env.example'))) {
  fs.copyFileSync(path.join(ROOT_DIR, '.env.example'), path.join(NODEJS_APP_DIR, '.env.example'));
}

// 5. Create archives (tar.gz and zip if available)
try {
  console.log('🗜️ Creating deployment archives for cPanel File Manager...');
  execSync(`tar -czf "${path.join(OUTPUT_DIR, 'caffeine_public_html.tar.gz')}" -C "${PUBLIC_HTML_DIR}" .`, { stdio: 'inherit' });
  execSync(`tar -czf "${path.join(OUTPUT_DIR, 'caffeine_nodejs_app.tar.gz')}" -C "${NODEJS_APP_DIR}" .`, { stdio: 'inherit' });
  console.log('✅ Created caffeine_public_html.tar.gz and caffeine_nodejs_app.tar.gz (extractable in cPanel File Manager)');
} catch (e) {
  console.log('ℹ️ Archive generation note:', e.message);
}

console.log('✨ [cPanel Packager] Packaging finished successfully!');
console.log(`📁 Files available in: ${OUTPUT_DIR}`);
