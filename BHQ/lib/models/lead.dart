enum LeadStage { newLead, contacted, quoteSent, negotiation, closedWon, closedLost }

class Lead {
  final String id;
  final String name;
  final String company;
  final String phone;
  final String email;
  final String value;
  final String productType;
  final LeadStage stage;
  final int leadScore;
  final String source;
  final String assignedTo;

  const Lead({
    required this.id,
    required this.name,
    required this.company,
    required this.phone,
    required this.email,
    required this.value,
    required this.productType,
    required this.stage,
    required this.leadScore,
    required this.source,
    required this.assignedTo,
  });

  static const List<Lead> mockLeads = [
    Lead(
      id: 'LEAD-901',
      name: 'Rohan Malhotra',
      company: 'Malhotra Texfabs Pvt Ltd',
      phone: '+91 98334 11223',
      email: 'rohan@malhotratexfabs.com',
      value: '₹3,40,000',
      productType: 'Group Health (50 employees)',
      stage: LeadStage.negotiation,
      leadScore: 88,
      source: 'Website Referral',
      assignedTo: 'Neha Gupta',
    ),
    Lead(
      id: 'LEAD-894',
      name: 'Dr. Sneha Roy',
      company: 'Roy Dental Clinics',
      phone: '+91 98112 33445',
      email: 'dr.sneha@roydental.in',
      value: '₹45,000',
      productType: 'Professional Indemnity',
      stage: LeadStage.quoteSent,
      leadScore: 76,
      source: 'WhatsApp Inbound',
      assignedTo: 'Amit Kumar',
    ),
    Lead(
      id: 'LEAD-882',
      name: 'Karan Thapar',
      company: 'Individual',
      phone: '+91 97110 55667',
      email: 'karan.thapar@gmail.com',
      value: '₹28,500',
      productType: 'Health Floater 1 Cr',
      stage: LeadStage.contacted,
      leadScore: 62,
      source: 'Google Ads',
      assignedTo: 'Neha Gupta',
    ),
    Lead(
      id: 'LEAD-870',
      name: 'Suresh Patel',
      company: 'Patel Cold Storage',
      phone: '+91 98980 12345',
      email: 'suresh@patelcold.com',
      value: '₹1,90,000',
      productType: 'Fire & Standard Perils',
      stage: LeadStage.newLead,
      leadScore: 92,
      source: 'Partner Channel',
      assignedTo: 'Vikram Singh',
    ),
    Lead(
      id: 'LEAD-861',
      name: 'Meera Nambiar',
      company: 'Nambiar Logistics',
      phone: '+91 98450 99887',
      email: 'meera@nambiarlogistics.in',
      value: '₹5,20,000',
      productType: 'Commercial Fleet Motor',
      stage: LeadStage.closedWon,
      leadScore: 99,
      source: 'Direct Telecall',
      assignedTo: 'Amit Kumar',
    ),
  ];
}
