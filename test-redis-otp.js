// const { storeOtp, verifyOtp } = require('./services/otp.service');

import {storeOtp, verifyOtp} from "./services/otp.service.js";

(async () => {
  const fakeUserId = 'test123';
  
  const otp = await storeOtp(fakeUserId, 'login');
  console.log('Stored OTP:', otp);

  // try wrong code
  console.log(await verifyOtp(fakeUserId, '000000', 'login')); // { valid: false, reason: 'invalid' }

  // try correct code
  console.log(await verifyOtp(fakeUserId, otp, 'login')); // { valid: true }

  // try again after used (should be expired)
  console.log(await verifyOtp(fakeUserId, otp, 'login')); // { valid: false, reason: 'expired' }
  
  process.exit(0);
})();