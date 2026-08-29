import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../models/policy.dart';
import '../widgets/ai_advisor_card.dart';
import '../widgets/common_dialogs.dart';
import '../widgets/kpi_grid.dart';
import '../widgets/policy_card.dart';
import '../widgets/quick_actions.dart';
import '../services/crm_data_provider.dart';

class DashboardScreen extends ConsumerWidget {
  final ValueChanged<int>? onNavigate;

  const DashboardScreen({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmall = screenWidth < 480;
    final policiesAsync = ref.watch(livePoliciesProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(livePoliciesProvider);
        ref.invalidate(liveClaimsProvider);
        ref.invalidate(liveProfileProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: EdgeInsets.fromLTRB(isSmall ? 12 : 16, 12, isSmall ? 12 : 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Policy Attention Alert Banner
            Container(
              padding: EdgeInsets.all(isSmall ? 12 : 16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? Colors.white10 : const Color(0xFFFDE68A),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline_rounded,
                    color: Color(0xFFD97706),
                    size: 18,
                  ),
                  Gap(isSmall ? 8 : 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Policy renewal due in 18 days',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: isSmall ? 12 : 13,
                            color: const Color(0xFF92400E),
                          ),
                        ),
                        const Gap(2),
                        Text(
                          'ICICI Lombard Motor Policy #MOT-9844 • Premium ₹18,420',
                          style: TextStyle(
                            fontSize: isSmall ? 11 : 12,
                            color: isDark ? Colors.white70 : const Color(0xFF78350F),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const Gap(8),
                  ElevatedButton(
                    onPressed: () => CommonDialogs.showPayPremiumModal(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: EdgeInsets.symmetric(
                        horizontal: isSmall ? 8 : 12,
                        vertical: isSmall ? 6 : 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Renew Policy', style: TextStyle(fontSize: isSmall ? 11 : 12)),
                  ),
                ],
              ),
            ),

            Gap(isSmall ? 14 : 20),

            // Insurance Portfolio Summary Stats
            const KpiGrid(),

            Gap(isSmall ? 14 : 20),

            // Advisor Offers Carousel
            AiAdvisorCard(
              onActionTap: (action) {
                if (action.contains('Tax') || action.contains('Download')) {
                  CommonDialogs.showDownloadPolicyModal(context);
                } else if (action.contains('Discount') || action.contains('Renew') || action.contains('Claim')) {
                  CommonDialogs.showPayPremiumModal(context);
                } else if (action.contains('Shield') || action.contains('Activate')) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Cyber Theft Shield activated on your policy.'),
                      backgroundColor: Color(0xFF10B981),
                    ),
                  );
                } else if (action.contains('Analyze')) {
                  CommonDialogs.showComparePlansDialog(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('$action selected.')),
                  );
                }
              },
            ),

            Gap(isSmall ? 16 : 24),

            // Actions Header: "What would you like to do?"
            Text(
              'What would you like to do?',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: isSmall ? 14 : 15,
              ),
            ),
            Gap(isSmall ? 10 : 12),
            QuickActionsGrid(
              onActionTap: (action) {
                if (action == 'File Claim') {
                  CommonDialogs.showRegisterClaimModal(context);
                } else if (action == 'Download Policy') {
                  CommonDialogs.showDownloadPolicyModal(context);
                } else if (action == 'Pay Premium' || action == 'Renew Policy') {
                  CommonDialogs.showPayPremiumModal(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('$action selected.')),
                  );
                }
              },
            ),

            Gap(isSmall ? 16 : 24),

            // Active Policies Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'My Active Policies',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                TextButton(
                  onPressed: () => onNavigate?.call(1),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1D4ED8),
                    ),
                  ),
                ),
              ],
            ),
            const Gap(12),

            policiesAsync.when(
              data: (policiesList) {
                final displayList = policiesList.take(3).toList();
                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: displayList.length,
                  separatorBuilder: (context, index) => const Gap(10),
                  itemBuilder: (context, index) {
                    return PolicyCard(
                      policy: displayList[index],
                      onTap: () {
                        CommonDialogs.showDownloadPolicyModal(context);
                      },
                    );
                  },
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (error, stack) => ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: Policy.mockPolicies.take(3).length,
                separatorBuilder: (context, index) => const Gap(10),
                itemBuilder: (context, index) {
                  return PolicyCard(
                    policy: Policy.mockPolicies[index],
                    onTap: () {
                      CommonDialogs.showDownloadPolicyModal(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
