import { startListening } from './server.js';

async function main(): Promise<void> {
  const { host, port } = await startListening();
  console.log(`pura-hardware-bridge listening on http://${host}:${port}`);
}

void main();
