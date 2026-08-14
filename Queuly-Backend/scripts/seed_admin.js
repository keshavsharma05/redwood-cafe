import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import dns from 'dns';

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redwood-cafe';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[SEED] Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      isAdmin: { type: Boolean, default: false }
    }));

    const adminExists = await User.findOne({ email: 'admin@towncoffee.com' });
    if (adminExists) {
      console.log('[SEED] Admin user already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Redwood CafÃ© Admin',
      email: 'admin@towncoffee.com',
      password: hashedPassword,
      isAdmin: true
    });

    console.log('[SEED] Admin user created successully: admin@towncoffee.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('[SEED] Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
