const { spawn, execSync } = require('child_process');

async function main() {
  console.log('Starting Next.js production server for testing...');
  const server = spawn('cmd.exe', ['/c', 'npx.cmd', 'next', 'start'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (d) => {
    process.stdout.write('[server] ' + d.toString());
  });

  server.stderr.on('data', (d) => {
    process.stderr.write('[server err] ' + d.toString());
  });

  // Wait until server is ready
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch('http://127.0.0.1:3000/api/settings');
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (e) {
      if (i % 5 === 0) console.log(`Probing 127.0.0.1:3000 (${i}s): ${e.message}`);
    }
  }

  if (!ready) {
    console.error('Server failed to become ready in time.');
    server.kill();
    process.exit(1);
  }

  console.log('\n--- Server is UP on http://127.0.0.1:3000. Running tests now ---\n');

  const testProc = spawn('cmd.exe', ['/c', 'npx.cmd', 'tsx', 'tests/e2e-test.ts'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  testProc.on('exit', (code) => {
    console.log(`\nTests finished with code: ${code}`);
    server.kill();
    process.exit(code || 0);
  });
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
