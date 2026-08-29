import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class PaymentsScreen extends StatelessWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final payments = [
      {
        'title': 'HDFC Ergo Health Insurance Renewal',
        'policyNo': 'HE-22910',
        'amount': '₹24,800',
        'status': 'Paid',
        'date': '12 Jan 2026',
      },
      {
        'title': 'ICICI Lombard Motor Insurance',
        'policyNo': 'MOT-9844',
        'amount': '₹18,420',
        'status': 'Pending Renewal',
        'date': 'Due 18 Aug 2026',
      },
      {
        'title': 'Tata AIG Fire Insurance Premium',
        'policyNo': 'FIR-55011',
        'amount': '₹85,000',
        'status': 'Paid',
        'date': '01 Feb 2026',
      },
    ];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payments',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                  letterSpacing: -0.5,
                ),
          ),
          const Gap(2),
          Text(
            'What have I paid',
            style: TextStyle(
              color: isDark ? Colors.white60 : const Color(0xFF64748B),
              fontSize: 13,
            ),
          ),

          const Gap(20),

          if (payments.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Icon(
                    Icons.credit_card_off_outlined,
                    size: 40,
                    color: isDark ? Colors.white30 : const Color(0xFFCBD5E1),
                  ),
                  const Gap(12),
                  Text(
                    'No payment history available.',
                    style: TextStyle(
                      fontSize: 13.5,
                      color: isDark ? Colors.white60 : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: payments.length,
              separatorBuilder: (context, index) => const Gap(10),
              itemBuilder: (context, idx) {
                final item = payments[idx];
                final isPaid = item['status'] == 'Paid';

                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: (isPaid ? const Color(0xFF10B981) : const Color(0xFFD97706)).withAlpha(20),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isPaid ? Icons.check_circle_outline_rounded : Icons.pending_actions_rounded,
                          color: isPaid ? const Color(0xFF10B981) : const Color(0xFFD97706),
                          size: 20,
                        ),
                      ),
                      const Gap(14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title']!,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13.5,
                              ),
                            ),
                            const Gap(2),
                            Text(
                              'Policy #${item['policyNo']} • ${item['date']}',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: isDark ? Colors.white60 : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            item['amount']!,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          const Gap(4),
                          OutlinedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(isPaid ? 'Downloading receipt...' : 'Opening payment window...'),
                                ),
                              );
                            },
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            child: Text(
                              isPaid ? 'View Receipt' : 'Pay Premium',
                              style: const TextStyle(fontSize: 10.5),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
