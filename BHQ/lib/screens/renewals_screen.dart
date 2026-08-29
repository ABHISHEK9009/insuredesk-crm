import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../widgets/common_dialogs.dart';

class RenewalsScreen extends StatelessWidget {
  const RenewalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final upcomingRenewals = [
      {
        'policyName': 'ICICI Lombard Motor Insurance',
        'policyNo': 'MOT-9844',
        'type': 'Maruti Swift VXI (MH-02-CB-9844)',
        'expiresIn': 'Expires in 18 days',
        'expiryDate': '18 Aug 2026',
        'premium': '₹18,420',
        'status': 'Urgent',
      },
      {
        'policyName': 'HDFC Ergo Optima Secure Health',
        'policyNo': 'HE-22910',
        'type': 'Family Floater (₹10 Lakh Sum Insured)',
        'expiresIn': 'Expires in 42 days',
        'expiryDate': '10 Sep 2026',
        'premium': '₹24,800',
        'status': 'Upcoming',
      },
    ];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Renewals',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                  letterSpacing: -0.5,
                ),
          ),
          const Gap(2),
          Text(
            'Which policies expire soon',
            style: TextStyle(
              color: isDark ? Colors.white60 : const Color(0xFF64748B),
              fontSize: 13,
            ),
          ),

          const Gap(20),

          if (upcomingRenewals.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Icon(
                    Icons.check_circle_outline_rounded,
                    size: 40,
                    color: isDark ? Colors.white30 : const Color(0xFFCBD5E1),
                  ),
                  const Gap(12),
                  Text(
                    'No policies are due for renewal this month.',
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
              itemCount: upcomingRenewals.length,
              separatorBuilder: (context, index) => const Gap(16),
              itemBuilder: (context, idx) {
                final item = upcomingRenewals[idx];

                return Container(
                  padding: EdgeInsets.all(Theme.of(context).brightness == Brightness.dark ? 14 : 14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['policyName']!,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14.5,
                                  ),
                                ),
                                const Gap(3),
                                Text(
                                  'Policy #${item['policyNo']} • ${item['type']}',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    color: isDark ? Colors.white60 : const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Gap(8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD97706).withAlpha(20),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              item['expiresIn']!,
                              style: const TextStyle(
                                color: Color(0xFFD97706),
                                fontSize: 10.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Gap(12),
                      const Divider(height: 1),
                      const Gap(12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Renewal Premium',
                                style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                              ),
                              Text(
                                item['premium']!,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1D4ED8),
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withAlpha(15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.stars_rounded, size: 12, color: Color(0xFF10B981)),
                                Gap(4),
                                Text(
                                  'NCB Discount',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Gap(14),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {
                                CommonDialogs.showComparePlansDialog(context);
                              },
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 9),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('Compare Plans', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                            ),
                          ),
                          const Gap(8),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => CommonDialogs.showPayPremiumModal(context),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1D4ED8),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(vertical: 9),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('Renew Policy', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
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
