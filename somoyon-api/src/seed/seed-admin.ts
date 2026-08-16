/** Creates the bootstrap SUPER_ADMIN. Safe to re-run — it will not overwrite. */
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { UserSchema } from '../database/schemas';

dotenv.config();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env');
  }
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters');
  }

  await mongoose.connect(process.env.MONGODB_URI!);
  const User = mongoose.model('User', UserSchema);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`User ${email} already exists — nothing to do.`);
  } else {
    await User.create({
      email: email.toLowerCase(),
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      name,
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: true,
    });
    console.log(`Created SUPER_ADMIN ${email}`);
    console.log('You will be asked to change this password on first login.');
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
