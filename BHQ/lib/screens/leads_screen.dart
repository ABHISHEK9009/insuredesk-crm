import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../models/lead.dart';

class LeadsScreen extends StatefulWidget {
  const LeadsScreen({super.key});

  @override
  State<LeadsScreen> createState() => _LeadsScreenState();
}

class _LeadsScreenState extends State<LeadsScreen> {
  bool _isKanbanView = true;

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
                      'Sales Lead Pipeline',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                    ),
                    const Gap(2),
                    Text(
                      '5 Active Pipeline Opportunities • ₹11.19 Lakh Deal Volume',
                      style: TextStyle(
                        color: isDark ? Colors.white60 : Colors.black54,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: Icon(
                      _isKanbanView ? Icons.view_kanban : Icons.view_list,
                      color: const Color(0xFF2563EB),
                    ),
                    onPressed: () => setState(() => _isKanbanView = !_isKanbanView),
                    tooltip: 'Toggle Kanban / List View',
                  ),
                  const Gap(8),
                  ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('New Lead functionality coming soon.')),
                      );
                    },
                    icon: const Icon(Icons.add_rounded, size: 16),
                    label: const Text('New Lead'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(100),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const Gap(16),

          // Kanban Columns / List
          if (_isKanbanView)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildKanbanColumn('New Lead', LeadStage.newLead, isDark),
                  _buildKanbanColumn('Contacted', LeadStage.contacted, isDark),
                  _buildKanbanColumn('Quote Sent', LeadStage.quoteSent, isDark),
                  _buildKanbanColumn('Negotiation', LeadStage.negotiation, isDark),
                  _buildKanbanColumn('Closed Won', LeadStage.closedWon, isDark),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: Lead.mockLeads.length,
              separatorBuilder: (_, index) => const Gap(10),
              itemBuilder: (context, idx) {
                final lead = Lead.mockLeads[idx];
                return Card(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                      color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFF2563EB).withAlpha(30),
                      child: Text(
                        '${lead.leadScore}',
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2563EB)),
                      ),
                    ),
                    title: Text(lead.name,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${lead.company} • ${lead.productType}'),
                    trailing: Text(
                      lead.value,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildKanbanColumn(String title, LeadStage stage, bool isDark) {
    final stageLeads = Lead.mockLeads.where((l) => l.stage == stage).toList();

    return Container(
      width: 270,
      margin: const EdgeInsets.only(right: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
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
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withAlpha(30),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  '${stageLeads.length}',
                  style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2563EB)),
                ),
              ),
            ],
          ),
          const Gap(12),
          if (stageLeads.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              alignment: Alignment.center,
              child: const Text('No deals in stage',
                  style: TextStyle(fontSize: 11, color: Colors.grey)),
            )
          else
            Column(
              children: stageLeads.map((lead) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isDark ? Colors.white10 : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(lead.name,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 13)),
                      Text(lead.company,
                          style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      const Gap(6),
                      Text(lead.productType,
                          style: const TextStyle(fontSize: 11.5)),
                      const Gap(8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            lead.value,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2563EB),
                                fontSize: 12.5),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.green.withAlpha(30),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Score ${lead.leadScore}',
                              style: const TextStyle(
                                  fontSize: 9.5,
                                  color: Colors.green,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }
}
