const { scrypt } = require('@noble/hashes/scrypt');
const { randomBytes } = require('@noble/hashes/utils');
const pwd = require('micro-passwords');

(async () => {
  // Using KDF and secureMask (mimics Safari Keychain Passwords)
  const seed = scrypt('main-password', 'user@gmail.com', { N: 2**18, r: 8, p: 1 });
  console.log(pwd.secureMask.apply(seed).password);
  // 2ryboC-tofnow-sallig

  // Or random
  console.log(pwd.secureMask.apply(randomBytes(32)).password);
  // wivfi1-Zykrap-fohcij, will change on each run

  // Or using mask, if there is specific requirements
  console.log(pwd.mask('@1Av').apply(seed).password);
  // "9Sy

  // Mask statistic (napkin math attack cost estimation)
  console.log(pwd.mask('Cvcvcvc').estimate());
  /*
  {
    score: 'somewhat guessable', // ZXCVBN Score
    // Guess times
    guesses: {
      online_throttling: '1y 115mo', // Throttled online attack
      online: '1mo 10d', // Online attack
      // Offline attack (salte, slow hash function like bcrypt, scrypt, PBKDF2, argon, etc)
      slow: '57min 36sec',
      fast: '0 sec' // Offline attack
    },
    // Estimated attack costs (in $)
    costs: {
      luks: 1.536122841572242, // LUKS (Linux FDE)
      filevault2: 0.2308740987992559, // FileVault 2 (macOS FDE)
      macos: 0.03341598798410283, // MaccOS v10.8+ passwords
      pbkdf2: 0.011138662661367609 // PBKDF2 (PBKDF2-HMAC-SHA256)
    }
  }
  */
})();
