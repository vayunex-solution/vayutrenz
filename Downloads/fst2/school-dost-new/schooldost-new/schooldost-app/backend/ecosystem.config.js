// PM2 Ecosystem Configuration for SchoolDost
// Run with: pm2 start ecosystem.config.js

module.exports = {
    apps: [{
        name: 'schooldost-api',
        script: 'src/index.js',

        // Cluster mode - use all CPU cores
        instances: 'max',
        exec_mode: 'cluster',

        // Auto-restart settings
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',

        // Restart on crash
        restart_delay: 1000,
        max_restarts: 10,
        min_uptime: '10s',

        // Environment
        env: {
            NODE_ENV: 'development',
            PORT: 5000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 5000
        },

        // Logging
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: 'logs/error.log',
        out_file: 'logs/out.log',
        merge_logs: true,

        // Graceful shutdown
        kill_timeout: 10000,
        wait_ready: true,
        listen_timeout: 10000
    }]
};
