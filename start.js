const { execSync } = require('child_process');

try {
    console.log('Running parse_excel.js...');
    execSync('node parse_excel.js', { stdio: 'inherit' });
    
    console.log('Starting server.js...');
    require('./server.js');
} catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
}
