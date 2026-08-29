import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class FamilyAssetsScreen extends StatelessWidget {
  const FamilyAssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final members = [
      {'name': 'Anand Tiwari', 'relation': 'Self (Primary Insured)', 'age': '34 Yrs', 'status': 'Covered'},
      {'name': 'Priya Verma', 'relation': 'Spouse', 'age': '31 Yrs', 'status': 'Covered'},
      {'name': 'Rohan Verma', 'relation': 'Son (Nominee)', 'age': '6 Yrs', 'status': 'Covered'},
    ];

    final assets = [
      {'name': 'Maruti Swift VXI', 'type': 'Private Car', 'regNo': 'MH-02-CB-9844', 'idv': '₹5.40 Lakh'},
      {'name': 'Bhiwandi Warehouse Unit 3', 'type': 'Property Fire Cover', 'regNo': 'FIR-55011', 'idv': '₹85.00 Lakh'},
    ];

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
                        item['name']!.substring(0, 1),
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
                      child: Text(
                        item['status']!,
                        style: const TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 10.5,
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

          // Insured Vehicles & Properties
          const Text(
            'Insured Vehicles & Assets',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
          const Gap(10),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: assets.length,
            separatorBuilder: (context, index) => const Gap(10),
            itemBuilder: (context, idx) {
              final asset = assets[idx];
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
                        color: const Color(0xFF0D9488).withAlpha(20),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        asset['type']!.contains('Car')
                            ? Icons.directions_car_rounded
                            : Icons.business_rounded,
                        color: const Color(0xFF0D9488),
                        size: 20,
                      ),
                    ),
                    const Gap(12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            asset['name']!,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13.5,
                            ),
                          ),
                          Text(
                            '${asset['type']} • ${asset['regNo']}',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: isDark ? Colors.white60 : const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      'IDV: ${asset['idv']}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2563EB),
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
