import { createApp } from './app.js';
import { getServerConfig } from './config.js';

try {
  const config = getServerConfig(process.env);
  const app = createApp(config);

  app.listen(config.port, () => {
    console.log(`TaskFlow server listening on port ${config.port}.`);
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
