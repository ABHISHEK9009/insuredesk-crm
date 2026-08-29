import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class AdminSettingsScreen extends StatelessWidget {
  const AdminSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'System Administration & Master Data',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                  ),
                  const Gap(2),
                  Text(
                    'Role-Based Access Control • IRDAI Compliance Audit Logs',
                    style: TextStyle(
                      color: isDark ? Colors.white60 : Colors.black54,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('System Backup initiated... Log saved.')),
                  );
                },
                icon: const Icon(Icons.security_rounded, size: 16),
                label: const Text('System Audit Log'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),

          const Gap(16),

          // Master Data Grid
          GridView.count(
            crossAxisCount: MediaQuery.of(context).size.width > 800 ? 3 : 1,
            shrinkWrap: true,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.5,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _adminCard('Insurance Companies', '18 Active Insurers Integrated', Icons.business_rounded, isDark),
              _adminCard('RTO Master Directory', '1,420 RTO Codes in India', Icons.directions_car_rounded, isDark),
              _adminCard('User Roles & Permissions', '5 Active Super Admin & Agents', Icons.manage_accounts_rounded, isDark),
              _adminCard('WhatsApp API Gateway', 'Meta Business ID Verified', Icons.chat_rounded, isDark),
              _adminCard('OCR AI Extractor Settings', 'Model Version 3.4 Active', Icons.psychology_rounded, isDark),
              _adminCard('Branding & Custom Domain', 'bimaheadquarter.com', Icons.domain_rounded, isDark),
            ],
          ),
        ],
      ),
    );
  }

  Widget _adminCard(String title, String subtitle, IconData icon, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFF2563EB).withAlpha(30),
            child: Icon(icon, color: const Color(0xFF2563EB), size: 20),
          ),
          const Gap(12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                Text(subtitle, style: TextStyle(fontSize: 11, color: isDark ? Colors.white.withAlpha(128) : Colors.black54)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
