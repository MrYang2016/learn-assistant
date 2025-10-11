module.exports = {
  apps: [
    {
      name: 'learn-assistant',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // 添加网络和进程配置
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_SUPABASE_URL: 'https://zuvgcqgetnmhlmjsxjrs.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dmdjcWdldG5taGxtanN4anJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjkxMTQsImV4cCI6MjA3NTE0NTExNH0.LMjDaDoAYcWmjYLYbcxxi4qbjij6YJwzy7Dzk7Vil7E',
        // 添加网络超时配置
        NODE_OPTIONS: '--max-old-space-size=4096',
        UV_THREADPOOL_SIZE: 128
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_SUPABASE_URL: 'https://zuvgcqgetnmhlmjsxjrs.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dmdjcWdldG5taGxtanN4anJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjkxMTQsImV4cCI6MjA3NTE0NTExNH0.LMjDaDoAYcWmjYLYbcxxi4qbjij6YJwzy7Dzk7Vil7E'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
        NEXT_PUBLIC_SUPABASE_URL: 'https://zuvgcqgetnmhlmjsxjrs.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dmdjcWdldG5taGxtanN4anJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjkxMTQsImV4cCI6MjA3NTE0NTExNH0.LMjDaDoAYcWmjYLYbcxxi4qbjij6YJwzy7Dzk7Vil7E'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
  ]
};
