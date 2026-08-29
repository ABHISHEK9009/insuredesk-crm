import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import '../theme/auth_provider.dart';
import '../services/crm_data_provider.dart';

class FamilyAssetsScreen extends ConsumerWidget {
  const FamilyAssetsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authProvider);
    final policiesAsync = ref.watch(livePoliciesProvider);

    final userName = authState.user?.name ?? 'Primary Account Holder';

    final members = [
      {'name': userName, 'relation': 'Self (Primary Insured)', 'age': 'Active', 'status': 'Covered'},
    ];

    final policies = policiesAsync.value ?? [];
    final motorPolicies = policies.where((p) => p.vehicleNumber != null && p.vehicleNumber!.isNotEmpty).toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Family Members & Covered Assets',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  fontSize: 22,
                  letterSpacing: -0.5,
                ),
          ),
          const Gap(2),
          Text(
            'Manage family members covered under Health Insurance and registered assets',
            style: TextStyle(
              color: isDark ? Colors.white60 : const Color(0xFF64748B),
              fontSize: 12,
            ),
          ),
          const Gap(20),

          // Covered Family Members
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Covered Family Members',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Add Member request sent to Advisor.')),
                  );
                },
                icon: const Icon(Icons.person_add_alt_1_rounded, size: 14),
                label: const Text('Add Member', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const Gap(10),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: members.length,
            separatorBuilder: (context, index) => const Gap(10),
            itemBuilder: (context, idx) {
              final item = members[idx];
              final initial = item['name']!.isNotEmpty ? item['name']!.substring(0, 1).toUpperCase() : 'U';
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFF2563EB).withAlpha(20),
                      child: Text(
                        initial,
                        style: const TextStyle(
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const Gap(12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['name']!,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13.5,
                            ),
                          ),
                          Text(
                            '${item['relation']} • ${item['age']}',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: isDark ? Colors.white60 : const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withAlpha(20),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Covered',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          const Gap(24),

          // Registered Assets
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Registered Insured Assets',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Add Asset request sent to Advisor.')),
                  );
                },
                icon: const Icon(Icons.add_home_work_rounded, size: 14),
                label: const Text('Add Asset', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const Gap(10),
          if (motorPolicies.isEmpty)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                ),
              ),
              child: const Center(
                child: Text(
                  'No registered vehicle or property assets found in your active policies.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: motorPolicies.length,
              separatorBuilder: (context, index) => const Gap(10),
              itemBuilder: (context, idx) {
                final policy = motorPolicies[idx];
                return Container(
                  padding: const EdgeInsets.all(14),
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
                          color: const Color(0xFF10B981).withAlpha(20),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.directions_car_rounded,
                          color: Color(0xFF10B981),
                          size: 20,
                        ),
                      ),
                      const Gap(12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              policy.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13.5,
                              ),
                            ),
                            Text(
                              'Reg: ${policy.vehicleNumber} • ${policy.price}',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: isDark ? Colors.white60 : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
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
