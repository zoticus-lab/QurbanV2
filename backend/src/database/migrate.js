const pool = require('./config');
const { adminPool } = require('./config');
const bcrypt = require('bcrypt');

const createDatabase = async () => {
  const conn = await adminPool.getConnection();
  try {
    await conn.execute(`
      CREATE DATABASE IF NOT EXISTS qurban_db 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log('✓ Database created/verified');
  } catch (error) {
    console.error('✗ Error creating database:', error.message);
    throw error;
  } finally {
    conn.release();
  }
};

const createTables = async () => {
  const conn = await pool.getConnection();
  
  try {
    // Create users table for authentication
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'scanner') DEFAULT 'scanner',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create coupons table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        qr_secret VARCHAR(255) UNIQUE NOT NULL,
        no_urut INT NOT NULL UNIQUE,
        nama_penerima VARCHAR(255),
        rt VARCHAR(50),
        rw VARCHAR(50),
        alamat TEXT,
        photo_penerima LONGTEXT,
        status ENUM('kosong', 'terdaftar', 'diambil') DEFAULT 'kosong',
        waktu_ambil TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_qr_secret (qr_secret),
        INDEX idx_status (status),
        INDEX idx_no_urut (no_urut)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create transactions table for finance
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('pemasukan', 'pengeluaran') NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        transaction_date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        proof_image LONGTEXT,
        goods_image LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create settings table for configuration
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value_text LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert default admin user
    const defaultPassword = await bcrypt.hash('admin123', 10);
    await conn.execute(
      `INSERT IGNORE INTO users (username, email, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@qurban.local', defaultPassword, 'admin', true]
    );

    console.log('✓ Database tables created successfully');
    console.log('✓ Default admin user created: admin / admin123');
  } catch (error) {
    console.error('✗ Error creating tables:', error.message);
    throw error;
  } finally {
    conn.release();
  }
};

const run = async () => {
  try {
    await createDatabase();
    await createTables();
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

run();
