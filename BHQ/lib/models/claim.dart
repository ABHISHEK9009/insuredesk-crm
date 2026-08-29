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
}
