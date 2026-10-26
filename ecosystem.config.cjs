module.exports = {
    apps: [{
        name: 'fromjawtoear',
        cwd: '/srv/www/fromjawtoear',
        script: 'app.js',
        autorestart: true,
        watch: false,
        node_args: "--env-file=/srv/config/fromjawtoear.env",
        env_production: {
            NODE_ENV: 'production',
            PORT: 3006,
            ROOT: ''
        }
    }]
}
