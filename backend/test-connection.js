const mysql = require('mysql2/promise');

const passwords = ['', 'root', 'password', 'mysql', '123456'];
const testHost = process.env.MYSQL_HOST || 'localhost';

(async () => {
  for (const pwd of passwords) {
    console.log(`Testing with password: "${pwd}"...`);
    try {
      const connection = await mysql.createConnection({
        host: testHost,
        user: 'root',
        password: pwd,
        waitForConnections: true,
        timeout: 5000
      });
      
      console.log(`✓ SUCCESS! Password works: "${pwd}"`);
      console.log('\nUpdate .env file:');
      console.log(`MYSQL_PASSWORD=${pwd}`);
      
      await connection.end();
      process.exit(0);
    } catch (error) {
      console.log(`✗ Failed: ${error.code}`);
    }
  }
  
  console.log('\n❌ Tidak ada password yang berhasil!');
  console.log('Pastikan MySQL running dan password sudah benar.');
  process.exit(1);
})();
