enum CustomerStatus { active, vip, lead, churnRisk }

class Customer {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String city;
  final int activePoliciesCount;
  final String totalSumInsured;
  final String annualPremium;
  final CustomerStatus status;
  final String avatarUrl;
  final String lastContact;

  const Customer({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.city,
    required this.activePoliciesCount,
    required this.totalSumInsured,
    required this.annualPremium,
    required this.status,
    required this.avatarUrl,
    required this.lastContact,
  });

  static const List<Customer> mockCustomers = [
    Customer(
      id: 'CUST-1092',
      name: 'Anand Tiwari',
      email: 'anand.tiwari@example.com',
      phone: '+91 88188 89660',
      city: 'Mumbai, MH',
      activePoliciesCount: 3,
      totalSumInsured: '₹1.25 Cr',
      annualPremium: '₹50,940',
      status: CustomerStatus.vip,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      lastContact: 'Today, 10:30 AM',
    ),
    Customer(
      id: 'CUST-1088',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98190 12345',
      city: 'Bengaluru, KA',
      activePoliciesCount: 2,
      totalSumInsured: '₹50.0 Lakh',
      annualPremium: '₹22,400',
      status: CustomerStatus.active,
      avatarUrl: '',
      lastContact: 'Yesterday',
    ),
    Customer(
      id: 'CUST-1074',
      name: 'Vikramaditya Mehta',
      email: 'v.mehta@techcorp.in',
      phone: '+91 99872 00912',
      city: 'Delhi NCR',
      activePoliciesCount: 4,
      totalSumInsured: '₹3.50 Cr',
      annualPremium: '₹1,85,000',
      status: CustomerStatus.vip,
      avatarUrl: '',
      lastContact: '3 days ago',
    ),
    Customer(
      id: 'CUST-1062',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@gmail.com',
      phone: '+91 97691 88234',
      city: 'Pune, MH',
      activePoliciesCount: 1,
      totalSumInsured: '₹10.0 Lakh',
      annualPremium: '₹8,150',
      status: CustomerStatus.churnRisk,
      avatarUrl: '',
      lastContact: '1 week ago',
    ),
    Customer(
      id: 'CUST-1055',
      name: 'Rajesh Kulkarni',
      email: 'rajesh.k@kulkarni-logistics.com',
      phone: '+91 98210 55432',
      city: 'Thane, MH',
      activePoliciesCount: 5,
      totalSumInsured: '₹5.00 Cr',
      annualPremium: '₹2,40,000',
      status: CustomerStatus.active,
      avatarUrl: '',
      lastContact: '2 weeks ago',
    ),
  ];
}
