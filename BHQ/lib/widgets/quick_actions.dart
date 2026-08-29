import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class QuickActionItem {
  final String label;
  final IconData icon;
  final Color color;
  final Color? lightColor;
  final Color? darkColor;

  const QuickActionItem({
    required this.label,
    required this.icon,
    required this.color,
    this.lightColor,
    this.darkColor,
  });
}

class QuickActionsGrid extends StatelessWidget {
  final Function(String action)? onActionTap;

  const QuickActionsGrid({super.key, this.onActionTap});

  static const actions = [
    QuickActionItem(
      label: 'Renew Policy',
      icon: Icons.autorenew_rounded,
      color: Color(0xFF1D4ED8),
    ),
    QuickActionItem(
      label: 'File Claim',
      icon: Icons.assignment_turned_in_outlined,
      color: Color(0xFF059669),
    ),
    QuickActionItem(
      label: 'Download Policy',
      icon: Icons.file_download_outlined,
      color: Color(0xFF2563EB),
    ),
    QuickActionItem(
      label: 'Pay Premium',
      icon: Icons.account_balance_wallet_outlined,
      color: Color(0xFFD97706),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmall = screenWidth < 480;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: actions.map((item) {
          final activeColor = isDark
              ? (item.darkColor ?? item.color)
              : (item.lightColor ?? item.color);

          return Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: isSmall ? 2 : 4),
              child: Material(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  onTap: () => onActionTap?.call(item.label),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      vertical: isSmall ? 10 : 14,
                      horizontal: isSmall ? 2 : 6,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? activeColor.withAlpha(25)
                          : activeColor.withAlpha(15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: activeColor.withAlpha(isDark ? 60 : 40),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: isSmall ? 32 : 40,
                          height: isSmall ? 32 : 40,
                          decoration: BoxDecoration(
                            color: activeColor.withAlpha(isDark ? 45 : 30),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            item.icon,
                            color: activeColor,
                            size: isSmall ? 16 : 20,
                          ),
                        ),
                        Gap(isSmall ? 5 : 8),
                        SizedBox(
                          height: isSmall ? 24 : 28,
                          child: Center(
                            child: Text(
                              item.label,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: isSmall ? 10 : 11,
                                fontWeight: FontWeight.w700,
                                color: activeColor,
                                height: 1.15,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
