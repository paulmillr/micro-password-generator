# micro-password-generator

Utilities for password generation with support for iOS keychain.

- Maps bytes to passwords using masks
- No dependencies
- Supports iOS / macOS Safari Secure Password from Keychain
- Provides ZXCVBN Score for password bruteforce estimation

![screenshot](https://user-images.githubusercontent.com/574696/174477173-90780039-fe52-4406-ab94-3ade837ba8c6.jpg)

## Examples

```js
import * as pwd from 'micro-password-generator';
import { scrypt } from '@noble/hashes/scrypt';
// Use cryptographically secure RNG. Do not use Math.random(), it's not secure
import { randomBytes } from '@noble/hashes/utils';

(async () => {
  const seed = scrypt('main-password', 'user@gmail.com', { N: 2**18, r: 8, p: 1 });

  // Deterministic password
  console.log(pwd.secureMask.apply(seed).password);
  // Secure random password
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
```

## Mask control characters

| Mask | Description                        | Example       |
| ---- | ---------------------------------- | ------------- |
| 1    | digits                             | 4, 7, 5, 0    |
| @    | symbols                            | !, @, %, ^    |
| v    | vowels                             | a, e, i       |
| c    | consonant                          | b, c, d       |
| a    | letter (vowel or consonant)        | a, b, e, c    |
| V    | uppercase vowel                    | A, E, I       |
| C    | uppercase consonant                | B, C, D       |
| A    | uppercase letter                   | A, B, E, C    |
| l    | lower and upper case letters       | A, b, C       |
| n    | same as 'l', but also digits       | A, 1, b, 2, C |
| \*   | same as 'n', but also symbols      | A, 1, !, b, @ |
| s    | syllable (same as 'cv')            | ca, re, do    |
| S    | Capitalized syllable (same as 'Cv) | Ca, Ti, Je    |
|      | All other characters used as is    |               |

Examples:

- Mask: `Cvccvc-cvccvc-cvccv1` will generate `Mavmuq-xadgys-poqsa5`
- Mask `@Ss-ss-ss` will generate: `*Tavy-qyjy-vemo`

## Design rationale

### Most strict password rules (so password will be accepted everywhere):

- at least one upper-case character
- at least one lower-case character
- at least one symbol
- at least one digit
- length greater or equal to 8
  These rules don't significantly increase password entropy (most humans will use mask like 'Aaaaaa1@' or any other popular mask),
  but they means that we cannot simple use mask like `********`, since it can generate passwords which won't satisfy these rules.

### What we want from passwords?

- **_length_**: entering 32 character password for FDE via IPMI java applet on remote server is pretty painful.
  -> 12-16 probably ok, anything with more characters has chance to be truncated by service.
- **_readability_**: entering '!#%!$#Y^&\*#%@#!!1' from air-gapped pc is hard.
- **_entropy_**:
  - 32 bit is likely to be brutforced via network
  - 64 bit: 22 days && 1.6k$ at 4x V100: https://blog.trailofbits.com/2019/11/27/64-bits-ought-to-be-enough-for-anybody/
    but it is simple loop, if there is something like pbkdf before password, it will significantly slowdown everything
  - 80 bits is probably outside of budget for most attackers (btc hash rate) even if there is major speedup for specific algorithm
  - For websites and services we don't care much about entropy, since passwords are unique and there is no re-usage,
    however for FDE / server password entropy is pretty important
- no fancy and unique mask by default: we don't want to fingeprint users
- any mask will leak eventually (even if user choices personal mask, there will be password leaks from websites),
  so we cannot calculate entropy by `******` mask, we need to calculate entropy for specific mask (which is smaller).
- Password generator should be reversible, that way we can easily proof entropy/strength of password.

## License

MIT (c) Paul Miller [(https://paulmillr.com)](https://paulmillr.com), see LICENSE file.
