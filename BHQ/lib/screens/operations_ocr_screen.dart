import 'package:flutter/material.dart';
import 'package:gap/gap.dart';

class OperationsOcrScreen extends StatefulWidget {
  const OperationsOcrScreen({super.key});

  @override
  State<OperationsOcrScreen> createState() => _OperationsOcrScreenState();
}

class _OperationsOcrScreenState extends State<OperationsOcrScreen> {
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI Document OCR & Extraction Queue',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                    ),
                    const Gap(2),
                    Text(
                      '99.4% Field Extraction Accuracy • Auto-Parser active',
                      style: TextStyle(
                        color: isDark ? Colors.white60 : Colors.black54,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  final messenger = ScaffoldMessenger.of(context);
                  setState(() => _isProcessing = true);
                  Future.delayed(const Duration(seconds: 2), () {
                    if (!mounted) return;
                    setState(() => _isProcessing = false);
                    messenger.showSnackBar(
                      const SnackBar(
                        content: Text('OCR Parsed: HDFC Ergo Policy PDF! 18 fields auto-extracted.'),
                        backgroundColor: Color(0xFF10B981),
                      ),
                    );
                  });
                },
                icon: _isProcessing
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.upload_file_rounded, size: 16),
                label: Text(_isProcessing ? 'Parsing PDF...' : 'Upload Policy PDF'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),

          const Gap(16),

          // OCR Verified Cards
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 18),
                        Gap(8),
                        Text('Recent Extracted Document',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green.withAlpha(30),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('100% Confidence Score',
                          style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const Gap(12),
                const Text('File: HDFC_Ergo_Optima_Restore_Certificate_2026.pdf',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const Gap(8),
                Row(
                  children: [
                    _ocrFieldTile('Insurer', 'HDFC Ergo Health', isDark),
                    _ocrFieldTile('Policy No', 'HE-22910', isDark),
                    _ocrFieldTile('Insured Name', 'Abhishek Verma', isDark),
                    _ocrFieldTile('Premium', '₹24,500', isDark),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _ocrFieldTile(String label, String val, bool isDark) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            Text(val, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
