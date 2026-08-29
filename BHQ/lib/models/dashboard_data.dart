import 'package:flutter/material.dart';
import 'policy.dart';

class KpiMetric {
  final String label;
  final String value;
  final String note;
  final PolicyTone tone;
  final IconData? icon;

  const KpiMetric({
    required this.label,
    required this.value,
    required this.note,
    required this.tone,
    this.icon,
  });

  static const List<KpiMetric> mockKpis = [
    KpiMetric(
      label: 'Active Policies',
      value: '6',
      note: '4 Health, 2 Motor',
      tone: PolicyTone.accent,
      icon: Icons.shield_outlined,
    ),
    KpiMetric(
      label: 'Upcoming Renewals',
      value: '2',
      note: 'Due this month',
      tone: PolicyTone.amber,
      icon: Icons.autorenew_rounded,
    ),
    KpiMetric(
      label: 'Open Claims',
      value: '1',
      note: 'Under Review',
      tone: PolicyTone.primary,
      icon: Icons.verified_user_outlined,
    ),
    KpiMetric(
      label: 'Total Coverage',
      value: '₹1.2 Cr',
      note: 'Sum Insured',
      tone: PolicyTone.muted,
      icon: Icons.account_balance_outlined,
    ),
  ];
}

class ActivityItem {
  final String title;
  final String meta;
  final PolicyTone tone;
  final IconData icon;

  const ActivityItem({
    required this.title,
    required this.meta,
    required this.tone,
    required this.icon,
  });

  static const List<ActivityItem> mockActivities = [
    ActivityItem(
      title: 'Policy document downloaded',
      meta: 'HDFC Ergo • 2h ago',
      tone: PolicyTone.muted,
      icon: Icons.file_download_outlined,
    ),
    ActivityItem(
      title: 'Tax Certificate generated',
      meta: 'Section 80D • Yesterday',
      tone: PolicyTone.accent,
      icon: Icons.receipt_long_outlined,
    ),
    ActivityItem(
      title: 'Renewal notice received',
      meta: 'ICICI Lombard • 2d ago',
      tone: PolicyTone.amber,
      icon: Icons.notifications_none_rounded,
    ),
  ];
}
