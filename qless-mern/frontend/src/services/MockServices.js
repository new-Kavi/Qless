// Helper to generate slots dynamically based on TODAY's actual time
const generateSlots = (startHour, endHour, durationMins, price) => {
  const slots = [];
  const now = new Date(); // Current real time
  
  let slotTime = new Date();
  slotTime.setHours(startHour, 0, 0, 0);
  
  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0);

  let slotId = 1;
  while (slotTime < endTime) {
    const timeString = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if slot has already passed
    const isPast = slotTime <= now;

    // Randomize status for demo purposes, but if past, strictly mark as 'passed'
    const rand = Math.random();
    let status = 'available';
    if (isPast) {
      status = 'passed';
    } else if (rand > 0.8) {
      status = 'booked';
    } else if (rand > 0.6) {
      status = 'limited';
    }

    slots.push({
      id: `slot_${slotId}`,
      timeRange: timeString,
      status: status, // available, limited, booked, passed
      price: price,
      absoluteTime: slotTime.getTime() // Store time for real-time math
    });

    // Advance clock
    slotTime = new Date(slotTime.getTime() + durationMins * 60000);
    slotId++;
  }
  return slots;
};

export const MOCK_SERVICES = [
  {
    id: 1,
    name: 'City General Hospital',
    category: 'Hospital',
    location: '123 Health Ave, Metro City',
    timings: '09:00 AM - 05:00 PM',
    closedDays: [0], // 0 = Sunday
    status: 'Busy',
    queueSize: 14,
    averageWaitTimePerPerson: 5,
    description: 'Providing comprehensive healthcare services with a designated urgent care wing.',
    allowsInstantQueue: true,
    hasEmergencyAccess: true,
    slots: generateSlots(9, 17, 30, 50.00)
  },
  {
    id: 2,
    name: 'Metropolitan Bank',
    category: 'Bank',
    location: '45 Finance Street, Downtown',
    timings: '09:00 AM - 04:00 PM',
    closedDays: [0, 6], // Closed weekends
    status: 'Open',
    queueSize: 3,
    averageWaitTimePerPerson: 10,
    description: 'Full-service financial institution offering personal and business banking.',
    allowsInstantQueue: false, // APPOINTMENT ONLY
    hasEmergencyAccess: false,
    slots: generateSlots(9, 16, 15, 0)
  },
  {
    id: 3,
    name: 'DMV Office Center',
    category: 'Government',
    location: '88 Civic Blvd, Zone 4',
    timings: '08:30 AM - 05:00 PM',
    closedDays: [0, 6],
    status: 'Busy',
    queueSize: 28,
    averageWaitTimePerPerson: 8,
    description: 'Department of Motor Vehicles. Licensing, registration, and IDs.',
    allowsInstantQueue: false, // APPOINTMENT ONLY
    hasEmergencyAccess: false,
    slots: generateSlots(8, 17, 20, 15.50)
  },
  {
    id: 4,
    name: 'Sunrise Clinic',
    category: 'Hospital',
    location: '201 Wellness Park',
    timings: '08:00 AM - 08:00 PM',
    closedDays: [], // Open everyday
    status: 'Open',
    queueSize: 1,
    averageWaitTimePerPerson: 15,
    description: 'Specialized clinic for physical therapy and wellness consultation.',
    allowsInstantQueue: true,
    hasEmergencyAccess: true,
    slots: generateSlots(8, 20, 60, 120.00)
  }
];

export const calculateWaitTime = (queueSize, averageWait) => {
  return queueSize * averageWait;
};
