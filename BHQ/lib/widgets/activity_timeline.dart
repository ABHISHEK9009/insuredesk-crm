import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../models/dashboard_data.dart';
import '../theme/app_theme.dart';
import 'glass_card.dart';

class ActivityTimeline extends StatelessWidget {
  final List<ActivityItem> activities;

  const ActivityTimeline({
    super.key,
    this.activities = const [],
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GlassCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Activity',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Icon(
                Icons.history_rounded,
                size: 16,
                color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
              ),
            ],
          ),
          const Gap(14),
          if (activities.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Center(
                child: Text(
                  'No recent policy or claim activities.',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.white54 : const Color(0xFF64748B),
                  ),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activities.length,
              separatorBuilder: (_, index) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Divider(
                  height: 1,
                  thickness: 0.5,
                  color: isDark ? Colors.white12 : Colors.black.withAlpha(12),
                ),
              ),
              itemBuilder: (context, index) {
                final item = activities[index];

                return Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: (isDark ? AppColors.accentLight : AppColors.accent)
                            .withAlpha(isDark ? 35 : 15),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        item.icon,
                        size: 14,
                        color: isDark ? AppColors.accentLight : AppColors.accent,
                      ),
                    ),
                    const Gap(12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.title,
                            style:
                                Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                          ),
                          const Gap(2),
                          Text(
                            item.meta,
                            style:
                                Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      fontSize: 11,
                                    ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
        ],
      ),
    );
  }
}
