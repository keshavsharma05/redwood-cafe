import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/redwood_cafe';

const OrderSchema = new mongoose.Schema({
  orderType: String,
  tableNumber: Number,
  arrivalTime: String,
  items: [{ itemId: String, qty: Number }],
  total: Number,
  customer: { name: String, phone: String },
  status: { type: String, default: 'Inbox' }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing orders for a clean test if needed (User didn't ask but it's better for verification)
  // await Order.deleteMany({});

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const orders = [
    // TODAY
    {
      orderType: 'arrived',
      tableNumber: 5,
      items: [{ itemId: '101', qty: 2 }],
      total: 180,
      customer: { name: 'Rahul', phone: '9876543210' },
      status: 'Inbox',
      createdAt: today
    },
    {
      orderType: 'scheduled',
      arrivalTime: '11:30 AM',
      items: [{ itemId: '105', qty: 1 }],
      total: 150,
      customer: { name: 'Priya', phone: '8765432109' },
      status: 'Preparing',
      createdAt: today
    },
    // YESTERDAY
    {
      orderType: 'arrived',
      tableNumber: 2,
      items: [{ itemId: '103', qty: 1 }],
      total: 160,
      customer: { name: 'Amit', phone: '1122334455' },
      status: 'Completed',
      createdAt: yesterday
    },
    {
      orderType: 'arrived',
      tableNumber: 8,
      items: [{ itemId: '502', qty: 2 }],
      total: 240,
      customer: { name: 'Sneha', phone: '2233445566' },
      status: 'Completed',
      createdAt: yesterday
    },
    {
      orderType: 'scheduled',
      arrivalTime: '04:00 PM',
      items: [{ itemId: '108', qty: 1 }],
      total: 190,
      customer: { name: 'Vikram', phone: '3344556677' },
      status: 'Completed',
      createdAt: yesterday
    },
    // 2 DAYS AGO
    {
      orderType: 'arrived',
      tableNumber: 1,
      items: [{ itemId: '102', qty: 3 }],
      total: 360,
      customer: { name: 'Sonia', phone: '4455667788' },
      status: 'Completed',
      createdAt: twoDaysAgo
    }
  ];

  // Clear ALL existing orders for a perfectly clean demo
  await Order.deleteMany({});
  
  await Order.insertMany(orders);
  console.log('Successfully seeded 6 orders across 3 days!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
