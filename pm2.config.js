module.exports = {
  apps : [{
    name      : 'zhangbbs-client',
    script    : './node_modules/http-server/bin/http-server',
    args: './client -p 81',
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    exec_mode: 'cluster',
    watch     : false,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'zhangbbs-server',
    script: './main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
