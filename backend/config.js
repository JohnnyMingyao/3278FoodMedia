module.exports = {
  port: process.env.PORT || 3001,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'foodie',
    password: process.env.DB_PASSWORD || 'foodie_pass',
    database: process.env.DB_NAME || 'foodie_share',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'foodie_jwt_secret_key_2026',
    expiresIn: '7d',
  },
};
