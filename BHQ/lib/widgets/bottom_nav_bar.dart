import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class BottomNavItemData {
  final String label;
  final IconData icon;
  final int targetIndex;

  const BottomNavItemData({
    required this.label,
    required this.icon,
    required this.targetIndex,
  });
}

class GlassBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const GlassBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  static const items = [
    BottomNavItemData(label: 'Home', icon: Icons.home_outlined, targetIndex: 0),
    BottomNavItemData(label: 'Policies', icon: Icons.shield_outlined, targetIndex: 1),
    BottomNavItemData(label: 'Renewals', icon: Icons.autorenew_rounded, targetIndex: 2),
    BottomNavItemData(label: 'Claims', icon: Icons.verified_user_outlined, targetIndex: 3),
    BottomNavItemData(label: 'Support', icon: Icons.help_outline_rounded, targetIndex: 7),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = const Color(0xFF1D4ED8);
    final screenWidth = MediaQuery.of(context).size.width;

    return Container(
      margin: EdgeInsets.fromLTRB(screenWidth < 400 ? 10 : 16, 0, screenWidth < 400 ? 10 : 16, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 60 : 15),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
            decoration: BoxDecoration(
              color: (isDark ? AppColors.cardDark : Colors.white).withAlpha(240),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark
                    ? AppColors.glassBorderDark
                    : const Color(0xFFE2E8F0),
                width: 1,
              ),
            ),
            child: Row(
              children: List.generate(items.length, (index) {
                final item = items[index];
                final isSelected = currentIndex == item.targetIndex;

                return Expanded(
                  child: InkWell(
                    onTap: () => onTap(item.targetIndex),
                    borderRadius: BorderRadius.circular(14),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? activeColor.withAlpha(isDark ? 30 : 15)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            item.icon,
                            size: 19,
                            color: isSelected
                                ? activeColor
                                : (isDark
                                    ? Colors.white60
                                    : const Color(0xFF64748B)),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            item.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              color: isSelected
                                  ? activeColor
                                  : (isDark
                                      ? Colors.white60
                                      : const Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
