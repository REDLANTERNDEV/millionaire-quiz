module.exports = {
  apps: [
    {
      name: "millionaire-quiz-backend",
      script: "./app.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        FRONTEND_URL: "https://yourdomain.com",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "256M",
    },
  ],
};
