import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final documents = [
      {
        'title': 'HDFC Ergo Health Policy Document',
        'type': 'Policy Schedule',
        'policyNo': 'HE-22910',
        'date': '12 Jan 2026',
        'size': '2.4 MB',
        'icon': Icons.picture_as_pdf_outlined,
        'actionLabel': 'Download Policy',
      },
      {
        'title': 'Section 80D Tax Exemption Certificate',
        'type': 'Tax Certificate',
        'policyNo': 'HE-22910',
        'date': '05 Apr 2026',
        'size': '1.1 MB',
        'icon': Icons.receipt_long_outlined,
        'actionLabel': 'Download Certificate',
      },
      {
        'title': 'ICICI Lombard Motor Policy Schedule',
        'type': 'Policy Schedule',
        'policyNo': 'MOT-9844',
        'date': '18 Aug 2025',
        'size': '3.2 MB',
        'icon': Icons.picture_as_pdf_outlined,
        'actionLabel': 'Download Policy',
      },
      {
        'title': 'Tata AIG Premium Receipt',
        'type': 'Premium Receipt',
        'policyNo': 'FIR-55011',
        'date': '01 Feb 2026',
        'size': '850 KB',
        'icon': Icons.task_outlined,
        'actionLabel': 'Download Receipt',
      },
    ];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Documents',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                  letterSpacing: -0.5,
                ),
          ),
          const Gap(2),
          Text(
            'Where can I download my files',
            style: TextStyle(
              color: isDark ? Colors.white60 : const Color(0xFF64748B),
              fontSize: 13,
            ),
          ),

          const Gap(20),

          if (documents.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Icon(
                    Icons.folder_open_outlined,
                    size: 40,
                    color: isDark ? Colors.white30 : const Color(0xFFCBD5E1),
                  ),
                  const Gap(12),
                  Text(
                    'No documents have been uploaded yet.',
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
              itemCount: documents.length,
              separatorBuilder: (context, index) => const Gap(10),
              itemBuilder: (context, idx) {
                final doc = documents[idx];

                return Container(
                  padding: const EdgeInsets.all(16),
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
                          color: const Color(0xFF1D4ED8).withAlpha(15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          doc['icon'] as IconData,
                          color: const Color(0xFF1D4ED8),
                          size: 20,
                        ),
                      ),
                      const Gap(14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              doc['title'] as String,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13.5,
                              ),
                            ),
                            const Gap(2),
                            Text(
                              '${doc['type']} • ${doc['policyNo']} • ${doc['size']}',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: isDark ? Colors.white60 : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Downloading ${doc['title']}...'),
                              backgroundColor: const Color(0xFF10B981),
                            ),
                          );
                        },
                        icon: const Icon(Icons.download_rounded, size: 14),
                        label: Text(
                          doc['actionLabel'] as String,
                          style: const TextStyle(fontSize: 11),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
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
