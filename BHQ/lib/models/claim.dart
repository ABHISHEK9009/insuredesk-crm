enum ClaimStatus { registered, surveyorAssigned, docsUnderReview, approved, cashlessSettled, rejected }

class Claim {
  final String id;
  final String policyNo;
  final String customerName;
  final String insurer;
  final String claimAmount;
  final String estimatedPayout;
  final ClaimStatus status;
  final String hospitalOrWorkshop;
  final String dateFiled;
  final String surveyorName;

  const Claim({
    required this.id,
    required this.policyNo,
    required this.customerName,
    required this.insurer,
    required this.claimAmount,
    required this.estimatedPayout,
    required this.status,
    required this.hospitalOrWorkshop,
    required this.dateFiled,
    required this.surveyorName,
  });

  factory Claim.fromJson(Map<String, dynamic> json) {
    final statusStr = (json['status'] ?? 'REGISTERED').toString().toUpperCase();
    ClaimStatus claimStatus = ClaimStatus.registered;

    if (statusStr.contains('SURVEY') || statusStr.contains('ASSIGNED')) {
      claimStatus = ClaimStatus.surveyorAssigned;
    } else if (statusStr.contains('REVIEW') || statusStr.contains('DOC')) {
      claimStatus = ClaimStatus.docsUnderReview;
    } else if (statusStr.contains('APPROV')) {
      claimStatus = ClaimStatus.approved;
    } else if (statusStr.contains('SETTLE') || statusStr.contains('CASHLESS') || statusStr.contains('CLOSED')) {
      claimStatus = ClaimStatus.cashlessSettled;
    } else if (statusStr.contains('REJECT')) {
      claimStatus = ClaimStatus.rejected;
    }

    final amount = json['claimAmount'] ?? json['amount'] ?? '0';
    final date = json['createdAt'] != null
        ? json['createdAt'].toString().split('T').first
        : (json['dateFiled'] ?? 'Recent');

    return Claim(
      id: json['id'] ?? json['claimNumber'] ?? 'CLM-NEW',
      policyNo: json['policyNumber'] ?? json['policyNo'] ?? '-',
      customerName: json['customerName'] ?? json['insuredName'] ?? 'Customer',
      insurer: json['insuranceCompany'] ?? json['insurer'] ?? 'Bima Headquarter Partner',
      claimAmount: amount.toString().startsWith('₹') ? amount.toString() : '₹$amount',
      estimatedPayout: amount.toString().startsWith('₹') ? amount.toString() : '₹$amount',
      status: claimStatus,
      hospitalOrWorkshop: json['garageOrHospital'] ?? json['hospitalOrWorkshop'] ?? json['description'] ?? 'Network Garage / Hospital',
      dateFiled: date,
      surveyorName: json['surveyorName'] ?? 'Assigned TPA / Surveyor',
    );
  }

  static const List<Claim> mockClaims = [
    Claim(
      id: 'CLM-2026-881',
      policyNo: 'HE-22910',
      customerName: 'Anand Soni',
      insurer: 'HDFC Ergo Health',
      claimAmount: '₹1,42,000',
      estimatedPayout: '₹1,38,500',
      status: ClaimStatus.cashlessSettled,
      hospitalOrWorkshop: 'Kokilaben Dhirubhai Ambani Hospital',
      dateFiled: '14 Jul 2026',
      surveyorName: 'Dr. R. K. Shinde (In-house)',
    ),
    Claim(
      id: 'CLM-2026-749',
      policyNo: 'MOT-9844',
      customerName: 'Maruti Swift VXi',
      insurer: 'ICICI Lombard Motor',
      claimAmount: '₹34,500',
      estimatedPayout: '₹31,000',
      status: ClaimStatus.surveyorAssigned,
      hospitalOrWorkshop: 'Sai Service Auto Workshop (Kandivali)',
      dateFiled: '22 Jul 2026',
      surveyorName: 'Rajesh Saxena (IRDA-9912)',
    ),
    Claim(
      id: 'CLM-2026-610',
      policyNo: 'FIR-55011',
      customerName: 'Warehouse Fire & Perils',
      insurer: 'Tata AIG General',
      claimAmount: '₹8,50,000',
      estimatedPayout: '₹7,90,000',
      status: ClaimStatus.docsUnderReview,
      hospitalOrWorkshop: 'Unit 3 Bhiwandi Complex',
      dateFiled: '10 Jul 2026',
      surveyorName: 'M/s Mehta & Associates',
    ),
    Claim(
      id: 'CLM-2026-502',
      policyNo: 'HE-90112',
      customerName: 'Priya Sharma',
      insurer: 'Star Health Care',
      claimAmount: '₹85,000',
      estimatedPayout: '₹85,000',
      status: ClaimStatus.registered,
      hospitalOrWorkshop: 'Manipal Hospital (Hebbal)',
      dateFiled: '29 Jul 2026',
      surveyorName: 'Pending Allocation',
    ),
  ];
}
