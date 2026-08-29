import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../models/policy.dart';
import '../theme/app_theme.dart';
import 'glass_card.dart';

class PolicyCard extends StatelessWidget {
  final Policy policy;
  final VoidCallback? onTap;

  const PolicyCard({
    super.key,
    required this.policy,
    this.onTap,
  });

  Color _getToneColor(PolicyTone tone, bool isDark) {
    switch (tone) {
      case PolicyTone.accent:
        return isDark ? AppColors.accentLight : AppColors.accent;
      case PolicyTone.primary:
        return isDark ? AppColors.primaryBlueDark : AppColors.primaryBlue;
      case PolicyTone.amber:
        return isDark ? AppColors.amberLight : AppColors.amber;
      case PolicyTone.muted:
        return isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final toneColor = _getToneColor(policy.tone, isDark);
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmall = screenWidth < 480;

    return GlassCard(
      onTap: onTap,
      padding: EdgeInsets.all(isSmall ? 12 : 16),
      borderRadius: isSmall ? 14 : 18,
      child: Row(
        children: [
          // Policy Icon Container
          Container(
            width: isSmall ? 38 : 44,
            height: isSmall ? 38 : 44,
            decoration: BoxDecoration(
              color: toneColor.withAlpha(isDark ? 45 : 20),
              borderRadius: BorderRadius.circular(isSmall ? 10 : 14),
            ),
            child: Icon(
              policy.icon,
              color: toneColor,
              size: isSmall ? 18 : 20,
            ),
          ),
          Gap(isSmall ? 10 : 14),

          // Policy Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  policy.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Gap(2),
                Text(
                  policy.subtitle,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 11,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),

          const Gap(10),

          // Price & Status Badge
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                policy.price,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Gap(4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: toneColor.withAlpha(isDark ? 40 : 25),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  policy.status,
                  style: TextStyle(
                    color: toneColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
