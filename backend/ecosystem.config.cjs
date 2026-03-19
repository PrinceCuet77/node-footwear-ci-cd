// PM2 Ecosystem config — CommonJS (.cjs) required because package.json has "type": "module"
module.exports = {
  apps: [
    {
      name: 'node-footwear-backend',
      script: './dist/server.js',
      instances: 1, // increase to 'max' for cluster mode
      exec_mode: 'fork', // change to 'cluster' if you use multiple instances
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
