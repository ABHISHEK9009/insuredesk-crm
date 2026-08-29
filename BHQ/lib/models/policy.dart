import 'package:flutter/material.dart';

enum PolicyTone { accent, primary, amber, muted }

class Policy {
  final String id;
  final String name;
  final String subtitle;
  final String price;
  final String status;
  final IconData icon;
  final PolicyTone tone;
  final String? policyNumber;
  final String? expiryDate;
  final String? vehicleNumber;
  final String? sumInsured;

  const Policy({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.price,
    required this.status,
    required this.icon,
    required this.tone,
    this.policyNumber,
    this.expiryDate,
    this.vehicleNumber,
    this.sumInsured,
  });

  factory Policy.fromJson(Map<String, dynamic> json) {
    final company = json['insuranceCompany'] ?? json['selectedCompany'] ?? 'Insurance Policy';
    final policyNum = json['policyNumber'] ?? json['id'] ?? '-';
    final policyType = json['policyType'] ?? json['selectedPolicyType'] ?? 'General Insurance';
    final premium = json['totalPremium'] ?? json['premium'] ?? '0';
    final expiry = json['expiryDate'] ?? json['policyExpiryDate'] ?? json['renewalDate'] ?? '';
    final vehicle = json['vehicleNumber'] ?? json['registrationNumber'] ?? json['makeModel'] ?? '';
    final sumIns = json['sumInsured'] ?? '';
    final active = json['isActivePolicy'] ?? true;
    final renewalStatus = json['renewalStatus'] ?? 'ACTIVE';

    IconData iconData = Icons.shield_rounded;
    PolicyTone policyTone = PolicyTone.primary;
    final lowerType = policyType.toString().toLowerCase();

    if (lowerType.contains('motor') || lowerType.contains('car') || lowerType.contains('vehicle') || lowerType.contains('two wheeler')) {
      iconData = Icons.directions_car_rounded;
      policyTone = PolicyTone.amber;
    } else if (lowerType.contains('health') || lowerType.contains('mediclaim')) {
      iconData = Icons.favorite_rounded;
      policyTone = PolicyTone.accent;
    } else if (lowerType.contains('fire') || lowerType.contains('property') || lowerType.contains('warehouse')) {
      iconData = Icons.business_rounded;
      policyTone = PolicyTone.primary;
    } else if (lowerType.contains('travel')) {
      iconData = Icons.flight_rounded;
      policyTone = PolicyTone.accent;
    }

    String statusText = active ? 'Active' : 'Expired';
    if (renewalStatus == 'DUE' || renewalStatus == 'PENDING') {
      statusText = 'Due for Renewal';
      policyTone = PolicyTone.amber;
    }

    String subtitleText = 'Policy #$policyNum';
    if (vehicle.isNotEmpty) {
      subtitleText += ' • $vehicle';
    } else {
      subtitleText += ' • $policyType';
    }

    return Policy(
      id: json['id'] ?? policyNum,
      name: '$company $policyType',
      subtitle: subtitleText,
      price: '₹$premium/yr',
      status: statusText,
      icon: iconData,
      tone: policyTone,
      policyNumber: policyNum,
      expiryDate: expiry,
      vehicleNumber: vehicle,
      sumInsured: sumIns.toString(),
    );
  }

  static const List<Policy> mockPolicies = [];
}
