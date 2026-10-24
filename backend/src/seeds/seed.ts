import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { MessMenu } from '../models/MessMenu.js';
import { MealReview } from '../models/MealReview.js';
import { CanteenItem } from '../models/CanteenItem.js';
import { HostelNotice } from '../models/HostelNotice.js';
import { OfficialContact } from '../models/OfficialContact.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostelhub';

export async function seedDatabase(): Promise<void> {
  console.log('[Seed] Connecting to MongoDB at', mongoUri);
  await mongoose.connect(mongoUri);

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Complaint.deleteMany({}),
    MessMenu.deleteMany({}),
    MealReview.deleteMany({}),
    CanteenItem.deleteMany({}),
    HostelNotice.deleteMany({}),
    OfficialContact.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Creating demo users...');
  const studentUser = await User.create({
    name: 'Aarav Patel',
    email: 'student@hostelhub.local',
    password: 'Student@123',
    role: 'student',
    hostelBlock: 'Block A (Mandakini)',
    roomNumber: 'A-304',
    phone: '+91 98765 43210',
    emergencyContact: {
      name: 'Vikram Patel',
      phone: '+91 98765 00001',
      relation: 'Father',
    },
  });

  const rectorUser = await User.create({
    name: 'Dr. Suresh V. Kulkarni',
    email: 'rector@hostelhub.local',
    password: 'Rector@123',
    role: 'rector',
    hostelBlock: 'Administrative Wing',
    roomNumber: 'Rector Office 101',
    phone: '+91 98765 43211',
  });

  const housekeepingUser = await User.create({
    name: 'Rameshwar Yadav',
    email: 'housekeeping@hostelhub.local',
    password: 'Staff@123',
    role: 'housekeeping',
    hostelBlock: 'All Blocks',
    roomNumber: 'HK Control 02',
    phone: '+91 98765 43212',
  });

  const messUser = await User.create({
    name: 'Chef Manmohan Singh',
    email: 'mess@hostelhub.local',
    password: 'Staff@123',
    role: 'mess_staff',
    hostelBlock: 'Central Dining Hall',
    phone: '+91 98765 43213',
  });

  const canteenUser = await User.create({
    name: 'Kailash Joshi',
    email: 'canteen@hostelhub.local',
    password: 'Staff@123',
    role: 'canteen_staff',
    hostelBlock: 'Student Activity Complex',
    phone: '+91 98765 43214',
  });

  const adminUser = await User.create({
    name: 'Hostel System Administrator',
    email: 'admin@hostelhub.local',
    password: 'Admin@123',
    role: 'admin',
    hostelBlock: 'Central Administration',
    phone: '+91 98765 43215',
  });

  console.log('[Seed] Creating official contacts...');
  await OfficialContact.insertMany([
    {
      name: 'Dr. Suresh V. Kulkarni',
      roleName: 'Hostel Rector',
      designation: 'Chief Hostel Warden & Professor of Engineering',
      department: 'Hostel Administration Council',
      phone: '+91 20 2550 7001',
      email: 'rector.office@institution.ac.in',
      officeLocation: 'Administrative Block, Ground Floor, Room 101',
      officeHours: '10:00 AM – 12:30 PM, 03:00 PM – 05:00 PM (Mon–Fri)',
      isEmergencyContact: false,
      verificationStatus: 'verified',
      lastVerifiedAt: new Date(),
      order: 1,
    },
    {
      name: 'Prof. Anita Deshmukh',
      roleName: 'Warden (Block A)',
      designation: 'Associate Professor & Block A Resident Warden',
      department: 'Hostel Wardens Committee',
      phone: '+91 20 2550 7002',
      email: 'warden.blocka@institution.ac.in',
      officeLocation: 'Block A, Ground Floor, Warden Office',
      officeHours: '05:00 PM – 07:00 PM (Daily)',
      isEmergencyContact: false,
      verificationStatus: 'verified',
      lastVerifiedAt: new Date(),
      order: 2,
    },
    {
      name: 'Prof. Rajesh Nair',
      roleName: 'Warden (Block B)',
      designation: 'Assistant Professor & Block B Resident Warden',
      department: 'Hostel Wardens Committee',
      phone: '+91 20 2550 7003',
      email: 'warden.blockb@institution.ac.in',
      officeLocation: 'Block B, Ground Floor, Warden Office',
      officeHours: '05:00 PM – 07:00 PM (Daily)',
      isEmergencyContact: false,
      verificationStatus: 'verified',
      lastVerifiedAt: new Date(),
      order: 3,
    },
    {
      name: 'Hostel Emergency Control Desk',
      roleName: '24x7 Security & Emergency Response',
      designation: 'Central Security Control Room',
      department: 'Campus Security and Vigilance',
      phone: '+91 20 2550 7999',
      email: 'security.emergency@institution.ac.in',
      officeLocation: 'Hostel Main Gate Control Booth',
      officeHours: '24 Hours / 7 Days',
      isEmergencyContact: true,
      verificationStatus: 'verified',
      lastVerifiedAt: new Date(),
      order: 4,
    },
    {
      name: 'Dr. Meera Sen (Campus Clinic)',
      roleName: 'Hostel Medical Officer',
      designation: 'Resident Medical Officer',
      department: 'Student Health Care Centre',
      phone: '+91 20 2550 7108',
      email: 'healthcentre@institution.ac.in',
      officeLocation: 'Health Centre, Adjacent to Block B',
      officeHours: '08:00 AM – 08:00 PM (Emergency on-call 24x7)',
      isEmergencyContact: true,
      verificationStatus: 'verified',
      lastVerifiedAt: new Date(),
      order: 5,
    },
    {
      name: 'Mr. Rameshwar Yadav',
      roleName: 'Housekeeping Supervisor',
      designation: 'Lead Facility & Housekeeping Coordinator',
      department: 'Estate and Sanitation Office',
      phone: '+91 20 2550 7020',
      email: 'sanitation.supervisor@institution.ac.in',
      officeLocation: 'Housekeeping Desk, Ground Floor Common Utility',
      officeHours: '07:30 AM – 04:30 PM (Mon–Sat)',
      isEmergencyContact: false,
      verificationStatus: 'verified',
      lastVerifiedAt: new Date(),
      order: 6,
    },
  ]);

  console.log('[Seed] Creating weekly mess menus...');
  const weeklyMenus = [
    {
      dayOfWeek: 'monday',
      meals: {
        breakfast: {
          timing: '07:30 AM – 09:30 AM',
          items: [
            { name: 'Poha with Roasted Peanuts and Fresh Coriander', isVeg: true, description: 'Tempered flattened rice' },
            { name: 'Sprouted Moong Salad', isVeg: true, description: 'Lightly seasoned with lemon and pepper' },
            { name: 'Brown and White Bread with Butter and Fruit Jam', isVeg: true },
            { name: 'Fresh Milk / Masala Chai / Filter Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Dal Tadka (Arhar Dal tempered with cumin & garlic)', isVeg: true },
            { name: 'Aloo Gobi Matar Masala', isVeg: true },
            { name: 'Steamed Basmati Rice', isVeg: true },
            { name: 'Fresh Phulkas with Ghee', isVeg: true },
            { name: 'Kachumber Salad and Roasted Papad', isVeg: true },
            { name: 'Fresh Sweet Curd', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Vegetable Cutlet with Mint Chutney', isVeg: true },
            { name: 'Hot Ginger Tea', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Paneer Butter Masala', isVeg: true, description: 'Cottage cheese in rich tomato gravy' },
            { name: 'Yellow Moong Dal Fry', isVeg: true },
            { name: 'Jeera Rice', isVeg: true },
            { name: 'Tandoori Rotis', isVeg: true },
            { name: 'Green Salad', isVeg: true },
            { name: 'Gulab Jamun (Warm)', isVeg: true },
          ],
        },
      },
      notes: 'Special dinner items served from 08:00 PM. Clean cutlery provided at entry.',
    },
    {
      dayOfWeek: 'tuesday',
      meals: {
        breakfast: {
          timing: '07:30 AM – 09:30 AM',
          items: [
            { name: 'Idli with Vegetable Sambar and Coconut Chutney', isVeg: true },
            { name: 'Crispy Medu Vada (1 pc)', isVeg: true },
            { name: 'Seasonal Whole Fruit (Banana/Orange)', isVeg: true },
            { name: 'Tea and Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Rajma Masala (Slow-cooked Kashmiri style)', isVeg: true },
            { name: 'Bhindi Masala Fry', isVeg: true },
            { name: 'Steamed Rice', isVeg: true },
            { name: 'Tawa Chapatis', isVeg: true },
            { name: 'Boondi Raita', isVeg: true },
            { name: 'Mixed Pickle and Papad', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Pav Bhaji with Lemon & Chopped Onions', isVeg: true },
            { name: 'Cardamom Milk Tea', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Mix Vegetable Kolhapuri', isVeg: true },
            { name: 'Dal Makhani (Slow simmered black lentils)', isVeg: true },
            { name: 'Steamed Rice', isVeg: true },
            { name: 'Butter Rotis', isVeg: true },
            { name: 'Cucumber Tomato Salad', isVeg: true },
            { name: 'Fruit Custard', isVeg: true },
          ],
        },
      },
      notes: 'Breakfast counter closes promptly at 09:30 AM.',
    },
    {
      dayOfWeek: 'wednesday',
      meals: {
        breakfast: {
          timing: '07:30 AM – 09:30 AM',
          items: [
            { name: 'Methi Thepla with Chhundo and Butter', isVeg: true },
            { name: 'Boiled Chickpeas / Sprouts Salad', isVeg: true },
            { name: 'Toast Bread with Butter', isVeg: true },
            { name: 'Tea and Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Chole Masala (Amritsari style)', isVeg: true },
            { name: 'Poori (4 pcs) or Steamed Rice', isVeg: true },
            { name: 'Bottle Gourd (Lauki) Chana Dal', isVeg: true },
            { name: 'Onion Rings with Green Chilli', isVeg: true },
            { name: 'Plain Dahi (Yogurt)', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Vegetable Samosa with Sweet Tamarind Chutney', isVeg: true },
            { name: 'Hot Lemon Tea / Masala Chai', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Kadai Paneer with Capsicum & Onion', isVeg: true },
            { name: 'Panchmel Dal', isVeg: true },
            { name: 'Peas Pulao', isVeg: true },
            { name: 'Whole Wheat Phulkas', isVeg: true },
            { name: 'Beetroot & Carrot Salad', isVeg: true },
            { name: 'Moong Dal Halwa', isVeg: true },
          ],
        },
      },
      notes: 'Students can request extra lentils at counter 2.',
    },
    {
      dayOfWeek: 'thursday',
      meals: {
        breakfast: {
          timing: '07:30 AM – 09:30 AM',
          items: [
            { name: 'Crispy Masala Dosa with Tomato and Coconut Chutney', isVeg: true },
            { name: 'Hot Sambar', isVeg: true },
            { name: 'Cornflakes with Warm/Cold Milk', isVeg: true },
            { name: 'Tea and Filter Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Kadhi Pakora (Gram flour dumplings in spiced yogurt curry)', isVeg: true },
            { name: 'Aloo Jeera Dry', isVeg: true },
            { name: 'Khichdi / Steamed Rice', isVeg: true },
            { name: 'Chapatis', isVeg: true },
            { name: 'Fryums and Lemon Pickle', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Puffed Rice Bhel Puri with Chutneys', isVeg: true },
            { name: 'Ginger Tea', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Veg Kofta Curry', isVeg: true },
            { name: 'Arhar Dal Tadka', isVeg: true },
            { name: 'Steamed Rice', isVeg: true },
            { name: 'Ghee Chapatis', isVeg: true },
            { name: 'Sprouted Bean Salad', isVeg: true },
            { name: 'Rice Kheer with Cardamom & Almonds', isVeg: true },
          ],
        },
      },
      notes: 'Dosa served hot straight from the tawa grill.',
    },
    {
      dayOfWeek: 'friday',
      meals: {
        breakfast: {
          timing: '07:30 AM – 09:30 AM',
          items: [
            { name: 'Stuffed Aloo Paratha with Curd and Pickle', isVeg: true },
            { name: 'Seasonal Fruit', isVeg: true },
            { name: 'Bread and Jam', isVeg: true },
            { name: 'Hot Tea and Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Baingan Bharta (Roasted eggplant mash)', isVeg: true },
            { name: 'Chana Dal Fry', isVeg: true },
            { name: 'Steamed Rice', isVeg: true },
            { name: 'Tawa Phulkas', isVeg: true },
            { name: 'Vegetable Raita', isVeg: true },
            { name: 'Roasted Papad', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Bread Pakora with Green Chutney', isVeg: true },
            { name: 'Masala Tea', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Hyderabadi Veg Dum Biryani with Mirchi Ka Salan', isVeg: true },
            { name: 'Burani Garlic Raita', isVeg: true },
            { name: 'Yellow Moong Dal', isVeg: true },
            { name: 'Chapatis', isVeg: true },
            { name: 'Onion Lemon Salad', isVeg: true },
            { name: 'Shahi Tukda', isVeg: true },
          ],
        },
      },
      notes: 'Friday feast menu. Extra biryani servings available upon request.',
    },
    {
      dayOfWeek: 'saturday',
      meals: {
        breakfast: {
          timing: '07:30 AM – 09:30 AM',
          items: [
            { name: 'Upma with Roasted Cashews and Coconut Chutney', isVeg: true },
            { name: 'Boiled Egg (Optional non-veg counter) / Sprout Salad', isVeg: false },
            { name: 'Bread, Butter and Jam', isVeg: true },
            { name: 'Milk, Tea, and Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Rajma Jammu Style', isVeg: true },
            { name: 'Aloo Shimla Mirch (Capsicum Stir Fry)', isVeg: true },
            { name: 'Steamed Rice', isVeg: true },
            { name: 'Phulkas', isVeg: true },
            { name: 'Fresh Cucumber Salad', isVeg: true },
            { name: 'Plain Curd', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Sweet Corn Chaat with Chaat Masala and Lemon', isVeg: true },
            { name: 'Cardamom Tea', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Matar Paneer', isVeg: true },
            { name: 'Dal Fry', isVeg: true },
            { name: 'Jeera Rice', isVeg: true },
            { name: 'Tandoori Rotis', isVeg: true },
            { name: 'Cabbage Slaw Salad', isVeg: true },
            { name: 'Ice Cream (Vanilla Cup)', isVeg: true },
          ],
        },
      },
      notes: 'Weekend breakfast timing extended by 15 minutes.',
    },
    {
      dayOfWeek: 'sunday',
      meals: {
        breakfast: {
          timing: '08:00 AM – 10:00 AM',
          items: [
            { name: 'Puri Bhaji (Spiced Potato Masala with Puffed Puris)', isVeg: true },
            { name: 'Suan / Sweet Sooji Halwa', isVeg: true },
            { name: 'Fresh Banana', isVeg: true },
            { name: 'Tea and Coffee', isVeg: true },
          ],
        },
        lunch: {
          timing: '12:30 PM – 02:30 PM',
          items: [
            { name: 'Shahi Paneer in Cashew Cream Gravy', isVeg: true },
            { name: 'Dal Makhani', isVeg: true },
            { name: 'Kashmiri Pulao with Raisins', isVeg: true },
            { name: 'Butter Naan / Phulkas', isVeg: true },
            { name: 'Pineapple Raita', isVeg: true },
            { name: 'Roasted Papad and Salad', isVeg: true },
          ],
        },
        snacks: {
          timing: '05:00 PM – 06:15 PM',
          items: [
            { name: 'Onion and Potato Pakora with Green Chutney', isVeg: true },
            { name: 'Hot Masala Chai', isVeg: true },
          ],
        },
        dinner: {
          timing: '07:45 PM – 09:45 PM',
          items: [
            { name: 'Veg Khichdi with Desi Ghee (Light comfort dinner)', isVeg: true },
            { name: 'Aloo Tamatar Curry', isVeg: true },
            { name: 'Roti with Butter', isVeg: true },
            { name: 'Curd / Buttermilk', isVeg: true },
            { name: 'Mixed Pickle and Papad', isVeg: true },
            { name: 'Fresh Fruit Salad', isVeg: true },
          ],
        },
      },
      notes: 'Sunday Special Lunch. Lunch timing begins at 12:30 PM.',
    },
  ];

  await MessMenu.insertMany(weeklyMenus);

  console.log('[Seed] Creating canteen items...');
  await CanteenItem.insertMany([
    {
      name: 'Cutting Chai',
      category: 'beverages',
      price: 15,
      description: 'Freshly brewed milk tea with crushed ginger and green cardamom.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '2-3 mins',
      imageUrl: '',
    },
    {
      name: 'Filter Coffee',
      category: 'beverages',
      price: 25,
      description: 'South Indian style drip brewed coffee with frothy hot milk.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '3-5 mins',
      imageUrl: '',
    },
    {
      name: 'Cold Coffee with Ice Cream',
      category: 'beverages',
      price: 55,
      description: 'Chilled blended coffee served with a scoop of vanilla ice cream.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '5-7 mins',
      imageUrl: '',
    },
    {
      name: 'Fresh Sweet Lime / Orange Juice',
      category: 'beverages',
      price: 45,
      description: 'Freshly pressed seasonal fruit juice with black salt and mint.',
      isAvailable: false,
      isVeg: true,
      preparationTime: '5 mins',
      imageUrl: '',
    },
    {
      name: 'Vegetable Grilled Sandwich',
      category: 'quick_bites',
      price: 50,
      description: 'Three-layer sandwich with cucumber, tomato, potato, green chutney, and cheese.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '8-10 mins',
      imageUrl: '',
    },
    {
      name: 'Paneer Tikka Roll',
      category: 'quick_bites',
      price: 80,
      description: 'Char-grilled cottage cheese cubes wrapped in warm paratha with sliced onion rings.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '10-12 mins',
      imageUrl: '',
    },
    {
      name: 'Aloo Samosa (2 pcs)',
      category: 'snacks',
      price: 30,
      description: 'Crispy fried pastry stuffed with spiced potato and peas, served with sweet tamarind chutney.',
      isAvailable: true,
      isVeg: true,
      preparationTime: 'Instant',
      imageUrl: '',
    },
    {
      name: 'Bun Maska',
      category: 'snacks',
      price: 25,
      description: 'Fresh soft bakery bun generously layered with salted butter.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '2 mins',
      imageUrl: '',
    },
    {
      name: 'Maggi Noodles (Double Masala)',
      category: 'quick_bites',
      price: 40,
      description: 'Cooked with onions, green peas, tomato, and extra tastemaker seasoning.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '6-8 mins',
      imageUrl: '',
    },
    {
      name: 'Mini Thali Combo',
      category: 'meals',
      price: 90,
      description: 'Paneer curry, dal tadka, jeera rice, 3 butter chapatis, salad, and pickle.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '12-15 mins',
      imageUrl: '',
    },
    {
      name: 'Chole Bhature (2 pcs)',
      category: 'meals',
      price: 85,
      description: 'Spiced chickpeas curry served with hot fluffy bhaturas, pickled carrot, and sliced onion.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '10-12 mins',
      imageUrl: '',
    },
    {
      name: 'Chocolate Brownie with Hot Fudge',
      category: 'desserts',
      price: 60,
      description: 'Warm walnut chocolate brownie drizzled with rich chocolate sauce.',
      isAvailable: true,
      isVeg: true,
      preparationTime: '3-5 mins',
      imageUrl: '',
    },
  ]);

  console.log('[Seed] Creating cleanliness complaints...');
  const complaints = [
    {
      referenceNumber: 'CLN-2026-0001',
      studentId: studentUser._id,
      studentName: studentUser.name,
      studentRoom: studentUser.roomNumber,
      title: 'Water pressure low in 3rd floor washroom east wing',
      category: 'washroom',
      hostelBlock: 'Block A (Mandakini)',
      location: '3rd Floor East Wing Washroom (near Room A-308)',
      description: 'The overhead water tank line has very low pressure in the wash basins and showers since yesterday evening.',
      priority: 'normal',
      status: 'in_progress',
      assignedTo: housekeepingUser._id,
      assignedStaffName: housekeepingUser.name,
      statusHistory: [
        {
          status: 'submitted',
          changedBy: studentUser._id,
          changedByName: studentUser.name,
          note: 'Complaint registered by student.',
          isInternal: false,
          timestamp: new Date(Date.now() - 48 * 3600 * 1000),
        },
        {
          status: 'assigned',
          changedBy: rectorUser._id,
          changedByName: rectorUser.name,
          note: 'Assigned to plumbing and sanitation team.',
          isInternal: false,
          timestamp: new Date(Date.now() - 36 * 3600 * 1000),
        },
        {
          status: 'in_progress',
          changedBy: housekeepingUser._id,
          changedByName: housekeepingUser.name,
          note: 'Plumber inspected valve on terrace; pressure booster replacement underway.',
          isInternal: false,
          timestamp: new Date(Date.now() - 12 * 3600 * 1000),
        },
      ],
      createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 12 * 3600 * 1000),
    },
    {
      referenceNumber: 'CLN-2026-0002',
      studentId: studentUser._id,
      studentName: studentUser.name,
      studentRoom: studentUser.roomNumber,
      title: 'Drinking water dispenser filter indicator flashing red',
      category: 'drinking_water',
      hostelBlock: 'Block A (Mandakini)',
      location: '2nd Floor Water Station (near staircase B)',
      description: 'The RO water purifier alert lamp is continuously red and water flow rate has dropped substantially.',
      priority: 'urgent',
      status: 'assigned',
      assignedTo: housekeepingUser._id,
      assignedStaffName: housekeepingUser.name,
      statusHistory: [
        {
          status: 'submitted',
          changedBy: studentUser._id,
          changedByName: studentUser.name,
          note: 'Student reported urgent water dispenser filter issue.',
          isInternal: false,
          timestamp: new Date(Date.now() - 18 * 3600 * 1000),
        },
        {
          status: 'assigned',
          changedBy: rectorUser._id,
          changedByName: rectorUser.name,
          note: 'Maintenance technician dispatched to replace RO membrane and pre-filter candle.',
          isInternal: false,
          timestamp: new Date(Date.now() - 8 * 3600 * 1000),
        },
      ],
      createdAt: new Date(Date.now() - 18 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 8 * 3600 * 1000),
    },
    {
      referenceNumber: 'CLN-2026-0003',
      studentId: studentUser._id,
      studentName: studentUser.name,
      studentRoom: studentUser.roomNumber,
      title: 'Corridor lights flickering and dust accumulation',
      category: 'corridor',
      hostelBlock: 'Block A (Mandakini)',
      location: '3rd Floor Main Corridor (between A-301 and A-310)',
      description: 'Two tube light fixtures are flickering constantly and the corridor floor requires sweeping.',
      priority: 'normal',
      status: 'resolved',
      assignedTo: housekeepingUser._id,
      assignedStaffName: housekeepingUser.name,
      statusHistory: [
        {
          status: 'submitted',
          changedBy: studentUser._id,
          changedByName: studentUser.name,
          note: 'Complaint registered.',
          isInternal: false,
          timestamp: new Date(Date.now() - 72 * 3600 * 1000),
        },
        {
          status: 'assigned',
          changedBy: rectorUser._id,
          changedByName: rectorUser.name,
          note: 'Assigned to duty electrician and cleaner.',
          isInternal: false,
          timestamp: new Date(Date.now() - 60 * 3600 * 1000),
        },
        {
          status: 'in_progress',
          changedBy: housekeepingUser._id,
          changedByName: housekeepingUser.name,
          note: 'LED chokes replaced and floor mopped.',
          isInternal: false,
          timestamp: new Date(Date.now() - 40 * 3600 * 1000),
        },
        {
          status: 'resolved',
          changedBy: housekeepingUser._id,
          changedByName: housekeepingUser.name,
          note: 'Both lights replaced with 20W LED fixtures and corridor sanitization completed.',
          isInternal: false,
          timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        },
      ],
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      referenceNumber: 'CLN-2026-0004',
      studentId: studentUser._id,
      studentName: studentUser.name,
      studentRoom: studentUser.roomNumber,
      title: 'Common study hall garbage bin overflowing',
      category: 'garbage',
      hostelBlock: 'Block A (Mandakini)',
      location: 'Ground Floor Reading & Study Hall',
      description: 'The recycling and general trash bins are full and need disposal before evening study hours.',
      priority: 'normal',
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: studentUser._id,
          changedByName: studentUser.name,
          note: 'Complaint logged by student.',
          isInternal: false,
          timestamp: new Date(Date.now() - 3 * 3600 * 1000),
        },
      ],
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 3 * 3600 * 1000),
    },
  ];

  await Complaint.insertMany(complaints);

  console.log('[Seed] Creating meal reviews...');
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];

  await MealReview.insertMany([
    {
      studentId: studentUser._id,
      studentName: studentUser.name,
      mealType: 'breakfast',
      date: todayStr,
      rating: 4,
      comment: 'Poha was hot and fresh with crunchy peanuts. Sambar could be slightly less sour.',
    },
    {
      studentId: studentUser._id,
      studentName: studentUser.name,
      mealType: 'lunch',
      date: yesterday,
      rating: 5,
      comment: 'Rajma masala was excellent with fluffy steamed basmati rice. Great consistency.',
    },
    {
      studentId: studentUser._id,
      studentName: studentUser.name,
      mealType: 'dinner',
      date: yesterday,
      rating: 4,
      comment: 'Kadai paneer gravy had great aroma. Roti served warm from the tandoor.',
    },
  ]);

  console.log('[Seed] Creating notices...');
  await HostelNotice.insertMany([
    {
      title: 'Water Supply Maintenance Schedule for Tank Sanitization',
      content:
        'All residents of Block A and Block B are notified that scheduled semi-annual cleaning and sanitization of the overhead water reservoirs will occur on Saturday from 09:00 AM to 01:00 PM. Please store sufficient drinking and utility water prior to 08:30 AM.',
      category: 'maintenance',
      priority: 'important',
      isPinned: true,
      authorName: 'Dr. Suresh V. Kulkarni',
      authorRole: 'Hostel Rector',
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      title: 'Hostel Silence Hours and Quiet Study Guidelines',
      content:
        'In view of upcoming mid-semester examinations, strict silence hours will be enforced from 10:30 PM to 06:00 AM across all corridors, courtyards, and common balconies. The 24-hour reading hall on the ground floor remains open with air conditioning.',
      category: 'general',
      priority: 'normal',
      isPinned: true,
      authorName: 'Hostel Wardens Committee',
      authorRole: 'Administration',
      publishedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
    {
      title: 'Emergency Clinic On-Call Numbers and Ambulance Protocol',
      content:
        'In the event of an urgent medical emergency within hostel premises, immediately ring +91 20 2550 7999 (Central Security Desk) or +91 20 2550 7108 (Campus Medical Centre). Do not rely on email or informal channels for life safety emergencies.',
      category: 'emergency',
      priority: 'urgent',
      isPinned: true,
      authorName: 'Dr. Meera Sen',
      authorRole: 'Hostel Medical Officer',
      publishedAt: new Date(Date.now() - 72 * 3600 * 1000),
    },
    {
      title: 'Monthly Mess Committee Feedback Meeting',
      content:
        'The open student mess committee meeting is scheduled for Wednesday at 05:30 PM in the Dining Hall Annex. Two student representatives from each floor are requested to submit food quality suggestions and dietary requests.',
      category: 'mess',
      priority: 'normal',
      isPinned: false,
      authorName: 'Chef Manmohan Singh',
      authorRole: 'Mess In-Charge',
      publishedAt: new Date(Date.now() - 96 * 3600 * 1000),
    },
  ]);

  console.log('[Seed] Creating demo student notifications...');
  await Notification.insertMany([
    {
      userId: studentUser._id,
      type: 'complaint_status',
      title: 'Complaint Update: CLN-2026-0001 is In Progress',
      message: 'Housekeeping technician inspected terrace valve; booster pump replacement underway.',
      link: '/cleanliness/CLN-2026-0001',
      isRead: false,
      createdAt: new Date(Date.now() - 12 * 3600 * 1000),
    },
    {
      userId: studentUser._id,
      type: 'notice',
      title: 'Important Notice: Water Supply Maintenance',
      message: 'Overhead tank cleaning scheduled for Saturday from 09:00 AM to 01:00 PM.',
      link: '/hostel-info',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      userId: studentUser._id,
      type: 'complaint_status',
      title: 'Complaint Resolved: CLN-2026-0003',
      message: 'Corridor fixtures replaced with new 20W LED fixtures and sanitization finished.',
      link: '/cleanliness/CLN-2026-0003',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
  ]);

  console.log('[Seed] Seed data generation completed successfully!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Done. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
