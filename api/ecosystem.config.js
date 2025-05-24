module.exports = {
    apps: [
      {
        name: "main",
        script: "./server.js",
        cwd: "path",
        env: {
           NODE_ENV: "production",
           PORT: "5000",
        }
      },
      {
        name: "ss_uat",
        script: "./server.js",
        cwd: "path",
        env: {
           NODE_ENV: "uat",
           PORT: "5001",
        }
      }
    ]
  };
  