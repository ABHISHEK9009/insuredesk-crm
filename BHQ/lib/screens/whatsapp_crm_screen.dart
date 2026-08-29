import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class WhatsappCrmScreen extends StatelessWidget {
  const WhatsappCrmScreen({super.key});

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
                    'WhatsApp Business CRM Inbox',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                  ),
                  const Gap(2),
                  Text(
                    'Meta Official Business API • 98.4% Delivery Rate',
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
                    const SnackBar(content: Text('Opening Broadcast Campaign Composer...')),
                  );
                },
                icon: const Icon(Icons.campaign_rounded, size: 16),
                label: const Text('Create Broadcast'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),

          const Gap(16),

          // Live Chat List
          Card(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
              ),
            ),
            child: ListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _chatTile('Abhishek Verma', 'Can you send my HDFC tax deduction certificate for Sec 80D?', '10:42 AM', 2, isDark),
                _chatTile('Priya Sharma', 'Thank you! Renewal payment of ₹22,400 completed via UPI.', 'Yesterday', 0, isDark),
                _chatTile('Rajesh Kulkarni', 'Please quote for 5 commercial trucks comprehensive motor insurance.', '27 Jul', 1, isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _chatTile(String name, String msg, String time, int unread, bool isDark) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: const Color(0xFF10B981).withAlpha(30),
        child: Text(name[0], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
      ),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(time, style: TextStyle(fontSize: 11, color: isDark ? Colors.white38 : Colors.black45)),
        ],
      ),
      subtitle: Text(msg, maxLines: 1, overflow: TextOverflow.ellipsis),
      trailing: unread > 0
          ? CircleAvatar(
              radius: 10,
              backgroundColor: const Color(0xFF10B981),
              child: Text('$unread', style: const TextStyle(fontSize: 10, color: Colors.white)),
            )
          : null,
    );
  }
}
