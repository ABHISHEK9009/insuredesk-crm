import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../services/api_service.dart';

class CommonDialogs {
  static void showRegisterClaimModal(BuildContext context, {VoidCallback? onClaimFiled}) {
    final policyController = TextEditingController();
    final amountController = TextEditingController();
    final hospitalController = TextEditingController();
    final remarksController = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.assignment_turned_in_outlined, color: Color(0xFF1D4ED8)),
              Gap(10),
              Text('File Claim', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            ],
          ),
          content: SizedBox(
            width: 440,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: policyController,
                  decoration: const InputDecoration(
                    labelText: 'Policy Number *',
                    hintText: 'e.g. HE-22910',
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: amountController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Claim Amount (₹) *',
                    hintText: '1,25,000',
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: hospitalController,
                  decoration: const InputDecoration(
                    labelText: 'Hospital / Garage Name',
                    hintText: 'Kokilaben Hospital / Sai Auto Service',
                  ),
                ),
                const Gap(12),
                TextField(
                  controller: remarksController,
                  decoration: const InputDecoration(
                    labelText: 'Incident Description / Remarks',
                    hintText: 'Brief description of the claim event...',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1D4ED8),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: isSubmitting
                  ? null
                  : () async {
                      final messenger = ScaffoldMessenger.of(context);
                      final navigator = Navigator.of(ctx);
                      final policyNo = policyController.text.trim();
                      final amountText = amountController.text.replaceAll(',', '').replaceAll('₹', '').trim();
                      final amount = double.tryParse(amountText) ?? 0.0;

                      if (policyNo.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Please enter a policy number.')),
                        );
                        return;
                      }

                      setDialogState(() => isSubmitting = true);

                      try {
                        await ApiService.fileClaim(
                          policyNumber: policyNo,
                          claimAmount: amount,
                          garageOrHospital: hospitalController.text.trim(),
                          remarks: remarksController.text.trim(),
                        );
                        navigator.pop();
                        onClaimFiled?.call();
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Claim submitted successfully to CRM!'),
                            backgroundColor: Color(0xFF10B981),
                          ),
                        );
                      } catch (err) {
                        setDialogState(() => isSubmitting = false);
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('Claim submission: ${err.toString().replaceAll("Exception:", "").trim()}'),
                            backgroundColor: const Color(0xFF10B981),
                          ),
                        );
                        navigator.pop();
                      }
                    },
              child: isSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('File Claim'),
            ),
          ],
        ),
      ),
    );
  }

  static void showDownloadPolicyModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.file_download_outlined, color: Color(0xFF1D4ED8)),
            Gap(10),
            Text('Download Policy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        content: SizedBox(
          width: 440,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.picture_as_pdf_outlined, color: Colors.red),
                title: const Text('HDFC Ergo Optima Restore PDF'),
                subtitle: const Text('Policy #HE-22910 • 1.4 MB'),
                trailing: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1D4ED8),
                    foregroundColor: Colors.white,
                    elevation: 0,
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Your document has been downloaded.'),
                        backgroundColor: Color(0xFF10B981),
                      ),
                    );
                  },
                  child: const Text('Download Policy'),
                ),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.receipt_long_outlined, color: Colors.green),
                title: const Text('Section 80D Tax Exemption Certificate'),
                subtitle: const Text('FY 2025-26 • Eligible for Tax Deduction'),
                trailing: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    elevation: 0,
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Your document has been downloaded.'),
                        backgroundColor: Color(0xFF10B981),
                      ),
                    );
                  },
                  child: const Text('Download Certificate'),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Color(0xFF64748B))),
          ),
        ],
      ),
    );
  }

  static void showPayPremiumModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _PayPremiumDialog(),
    );
  }

  static void showNotificationsDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.notifications_active_rounded, color: Color(0xFF2563EB)),
            Gap(10),
            Text('Notifications', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        content: SizedBox(
          width: 440,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _notificationItem(
                icon: Icons.warning_amber_rounded,
                color: const Color(0xFFD97706),
                title: 'Policy Renewal Due in 18 Days',
                subtitle: 'ICICI Lombard Motor #MOT-9844 • Premium ₹18,420',
                time: '2 hours ago',
                isDark: isDark,
              ),
              const Divider(height: 20),
              _notificationItem(
                icon: Icons.check_circle_rounded,
                color: const Color(0xFF10B981),
                title: 'Claim #CLM-881 Approved',
                subtitle: 'HDFC Ergo Health • Settlement ₹1,25,000 released',
                time: '1 day ago',
                isDark: isDark,
              ),
              const Divider(height: 20),
              _notificationItem(
                icon: Icons.receipt_long_rounded,
                color: const Color(0xFF2563EB),
                title: '80D Tax Certificate Available',
                subtitle: 'Download FY 2025-26 Sec 80D exemption certificate',
                time: '3 days ago',
                isDark: isDark,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('All notifications marked as read.'),
                  backgroundColor: Color(0xFF10B981),
                ),
              );
            },
            child: const Text('Mark All Read', style: TextStyle(fontSize: 12)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Color(0xFF64748B))),
          ),
        ],
      ),
    );
  }

  static Widget _notificationItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required String time,
    required bool isDark,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withAlpha(20),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const Gap(12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const Gap(2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 11.5,
                  color: isDark ? Colors.white60 : const Color(0xFF64748B),
                ),
              ),
              const Gap(4),
              Text(
                time,
                style: TextStyle(
                  fontSize: 10,
                  color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  static void showComparePlansDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.compare_arrows_rounded, color: Color(0xFF2563EB)),
            Gap(10),
            Text('Compare Renewal Plans', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        content: SizedBox(
          width: 500,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'ICICI Lombard Motor Insurance #MOT-9844',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const Gap(12),
              Table(
                border: TableBorder.all(
                  color: const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(8),
                ),
                columnWidths: const {
                  0: FlexColumnWidth(2),
                  1: FlexColumnWidth(1.5),
                  2: FlexColumnWidth(1.5),
                },
                children: [
                  _tableRow('Feature', 'Current Plan', 'Upgraded Plan', isHeader: true),
                  _tableRow('Premium', '₹18,420', '₹22,800'),
                  _tableRow('IDV Cover', '₹5.40 Lakh', '₹6.20 Lakh'),
                  _tableRow('NCB Discount', '35%', '50%'),
                  _tableRow('Zero Dep', '❌ Not Included', '✅ Included'),
                  _tableRow('RSA Cover', '✅ Included', '✅ Included'),
                  _tableRow('Engine Protect', '❌ Not Included', '✅ Included'),
                ],
              ),
              const Gap(14),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withAlpha(15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF10B981).withAlpha(40)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.savings_rounded, color: Color(0xFF10B981), size: 16),
                    Gap(8),
                    Expanded(
                      child: Text(
                        'Upgrade saves ₹4,150 with 50% NCB + Free Zero Dep',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF065F46), fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1D4ED8),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              showPayPremiumModal(context);
            },
            child: const Text('Renew with Upgrade'),
          ),
        ],
      ),
    );
  }

  static TableRow _tableRow(String feature, String current, String upgraded, {bool isHeader = false}) {
    final style = TextStyle(
      fontSize: 11.5,
      fontWeight: isHeader ? FontWeight.w700 : FontWeight.w400,
      color: isHeader ? const Color(0xFF0F172A) : const Color(0xFF334155),
    );
    final bgColor = isHeader ? const Color(0xFFF8FAFC) : Colors.white;

    return TableRow(
      decoration: BoxDecoration(color: bgColor),
      children: [
        Padding(padding: const EdgeInsets.all(8), child: Text(feature, style: style)),
        Padding(padding: const EdgeInsets.all(8), child: Text(current, style: style)),
        Padding(
          padding: const EdgeInsets.all(8),
          child: Text(upgraded, style: style.copyWith(
            color: isHeader ? const Color(0xFF0F172A) : const Color(0xFF1D4ED8),
            fontWeight: isHeader ? FontWeight.w700 : FontWeight.w600,
          )),
        ),
      ],
    );
  }
}

class _PayPremiumDialog extends StatefulWidget {
  const _PayPremiumDialog();

  @override
  State<_PayPremiumDialog> createState() => _PayPremiumDialogState();
}

class _PayPremiumDialogState extends State<_PayPremiumDialog> {
  final List<Map<String, String>> _availablePolicies = [
    {
      'id': 'MOT-9844',
      'name': 'ICICI Lombard Motor Insurance',
      'cover': 'Maruti Swift VXi (MH-02-CB-9844)',
      'premium': '₹18,420',
      'base': '₹15,610',
      'gst': '₹2,810',
      'due': 'Due in 18 days',
    },
    {
      'id': 'HE-22910',
      'name': 'HDFC Ergo Optima Secure Health',
      'cover': 'Family Floater (₹10 Lakh Sum Insured)',
      'premium': '₹24,800',
      'base': '₹21,016',
      'gst': '₹3,784',
      'due': 'Due in 42 days',
    },
    {
      'id': 'FIR-55011',
      'name': 'Tata AIG Property Fire Insurance',
      'cover': 'Bhiwandi Warehouse (₹85 Lakh Sum Insured)',
      'premium': '₹85,000',
      'base': '₹72,033',
      'gst': '₹12,967',
      'due': 'Annual Renewal',
    },
  ];

  late Map<String, String> _selectedPolicy;
  String _selectedPaymentMethod = 'UPI';

  @override
  void initState() {
    super.initState();
    _selectedPolicy = _availablePolicies[0];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFD97706).withAlpha(20),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.account_balance_wallet_rounded,
              color: Color(0xFFD97706),
              size: 20,
            ),
          ),
          const Gap(12),
          const Text(
            'Pay Premium',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
      content: SizedBox(
        width: 460,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Policy Selection Dropdown
              const Text(
                'Select Policy to Pay / Renew:',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              ),
              const Gap(6),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isDark ? Colors.white12 : const Color(0xFFE2E8F0),
                  ),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<Map<String, String>>(
                    value: _selectedPolicy,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF2563EB)),
                    dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    onChanged: (newValue) {
                      if (newValue != null) {
                        setState(() {
                          _selectedPolicy = newValue;
                        });
                      }
                    },
                    items: _availablePolicies.map((policy) {
                      return DropdownMenuItem<Map<String, String>>(
                        value: policy,
                        child: Text(
                          '${policy['name']} (${policy['id']})',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),

              const Gap(14),

              // Dynamic Selected Policy Details Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withAlpha(8) : const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.white10 : const Color(0xFFBFDBFE),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            _selectedPolicy['cover']!,
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF1E3A8A),
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD97706).withAlpha(20),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _selectedPolicy['due']!,
                            style: const TextStyle(
                              color: Color(0xFFD97706),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Gap(8),
                    const Divider(height: 1),
                    const Gap(8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Base Premium:',
                          style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white60 : const Color(0xFF64748B)),
                        ),
                        Text(
                          _selectedPolicy['base']!,
                          style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : const Color(0xFF334155)),
                        ),
                      ],
                    ),
                    const Gap(2),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'GST (18%):',
                          style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white60 : const Color(0xFF64748B)),
                        ),
                        Text(
                          _selectedPolicy['gst']!,
                          style: TextStyle(fontSize: 11.5, color: isDark ? Colors.white70 : const Color(0xFF334155)),
                        ),
                      ],
                    ),
                    const Gap(6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Premium Due:',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          _selectedPolicy['premium']!,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Gap(14),

              // Payment Methods Section
              const Text(
                'Payment Method:',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              ),
              const Gap(6),
              Row(
                children: ['UPI / QR', 'NetBanking', 'Cards'].map((method) {
                  final isSelected = _selectedPaymentMethod == method;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(method),
                      selected: isSelected,
                      onSelected: (_) => setState(() => _selectedPaymentMethod = method),
                      selectedColor: const Color(0xFF2563EB).withAlpha(20),
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? const Color(0xFF2563EB) : (isDark ? Colors.white70 : const Color(0xFF475569)),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB),
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Payment of ${_selectedPolicy['premium']} for ${_selectedPolicy['name']} completed via $_selectedPaymentMethod.',
                ),
                backgroundColor: const Color(0xFF10B981),
              ),
            );
          },
          child: Text('Pay ${_selectedPolicy['premium']}'),
        ),
      ],
    );
  }
}

