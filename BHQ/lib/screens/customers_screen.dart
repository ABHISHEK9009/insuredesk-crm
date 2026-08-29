import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import '../models/customer.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  String _search = '';
  CustomerStatus? _statusFilter;
  Customer? _selectedCustomer;

  List<Customer> get _filteredCustomers {
    return Customer.mockCustomers.where((c) {
      final matchesSearch = c.name.toLowerCase().contains(_search.toLowerCase()) ||
          c.email.toLowerCase().contains(_search.toLowerCase()) ||
          c.phone.toLowerCase().contains(_search.toLowerCase()) ||
          c.city.toLowerCase().contains(_search.toLowerCase());

      if (!matchesSearch) return false;
      if (_statusFilter != null && c.status != _statusFilter) return false;
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        // Main Customer List Area
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Customer CRM & Relationships',
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: -0.5,
                                ),
                          ),
                          const Gap(2),
                          Text(
                            '5 Accounts • Total Premium: ₹5,03,490/yr',
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
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Add Customer functionality coming soon.')),
                        );
                      },
                      icon: const Icon(Icons.person_add_rounded, size: 16),
                      label: const Text('Add Customer'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(100)),
                      ),
                    ),
                  ],
                ),

                const Gap(16),

                // Search & Filters
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        onChanged: (val) => setState(() => _search = val),
                        decoration: InputDecoration(
                          hintText: 'Search customer by name, email, phone...',
                          prefixIcon: const Icon(Icons.search_rounded, size: 20),
                          filled: true,
                          fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: isDark ? Colors.white12 : const Color(0xFFE2E8F0),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const Gap(10),
                    DropdownButton<CustomerStatus?>(
                      value: _statusFilter,
                      hint: const Text('Status All'),
                      onChanged: (val) => setState(() => _statusFilter = val),
                      items: const [
                        DropdownMenuItem(value: null, child: Text('All Status')),
                        DropdownMenuItem(value: CustomerStatus.vip, child: Text('VIP Clients')),
                        DropdownMenuItem(value: CustomerStatus.active, child: Text('Active')),
                        DropdownMenuItem(value: CustomerStatus.churnRisk, child: Text('Churn Risk')),
                      ],
                    ),
                  ],
                ),

                const Gap(16),

                // Customer Cards / Table
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _filteredCustomers.length,
                  separatorBuilder: (_, index) => const Gap(10),
                  itemBuilder: (context, index) {
                    final customer = _filteredCustomers[index];
                    final isSelected = _selectedCustomer?.id == customer.id;

                    return Card(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: isSelected
                              ? const Color(0xFF2563EB)
                              : (isDark ? Colors.white10 : const Color(0xFFE2E8F0)),
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: InkWell(
                        onTap: () => setState(() => _selectedCustomer = customer),
                        borderRadius: BorderRadius.circular(16),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: const Color(0xFF2563EB).withAlpha(30),
                                child: Text(
                                  customer.name[0],
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF2563EB),
                                  ),
                                ),
                              ),
                              const Gap(14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            customer.name,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14.5,
                                            ),
                                          ),
                                        ),
                                        const Gap(8),
                                        _buildBadge(customer.status),
                                      ],
                                    ),
                                    const Gap(4),
                                    Text(
                                      '${customer.phone} • ${customer.email} • ${customer.city}',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: isDark ? Colors.white60 : Colors.black54,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    customer.totalSumInsured,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: Color(0xFF2563EB),
                                    ),
                                  ),
                                  Text(
                                    '${customer.activePoliciesCount} Active Policies',
                                    style: TextStyle(
                                      color: isDark ? Colors.white.withAlpha(128) : Colors.black45,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),

        // Customer Details Drawer
        if (_selectedCustomer != null)
          Container(
            width: 320,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : Colors.white,
              border: Border(
                left: BorderSide(
                  color: isDark ? Colors.white12 : const Color(0xFFE2E8F0),
                ),
              ),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Customer 360 View',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      onPressed: () => setState(() => _selectedCustomer = null),
                    ),
                  ],
                ),
                const Divider(),
                const Gap(12),
                Center(
                  child: CircleAvatar(
                    radius: 32,
                    backgroundColor: const Color(0xFF2563EB).withAlpha(30),
                    child: Text(
                      _selectedCustomer!.name[0],
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                  ),
                ),
                const Gap(10),
                Center(
                  child: Text(
                    _selectedCustomer!.name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                Center(
                  child: Text(
                    _selectedCustomer!.city,
                    style: TextStyle(color: isDark ? Colors.white.withAlpha(128) : Colors.black54, fontSize: 12),
                  ),
                ),
                const Gap(16),
                _detailTile('Phone', _selectedCustomer!.phone, Icons.phone_rounded),
                _detailTile('Email', _selectedCustomer!.email, Icons.email_rounded),
                _detailTile('Total Cover', _selectedCustomer!.totalSumInsured, Icons.shield_rounded),
                _detailTile('Annual Premium', _selectedCustomer!.annualPremium, Icons.account_balance_rounded),
                const Gap(20),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Opening WhatsApp chat with ${_selectedCustomer!.phone}...')),
                          );
                        },
                        icon: const Icon(Icons.chat_rounded, size: 16),
                        label: const Text('WhatsApp'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _detailTile(String label, String val, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF2563EB)),
          const Gap(10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
              Text(val, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(CustomerStatus status) {
    Color bg = Colors.blue;
    String label = 'Active';

    if (status == CustomerStatus.vip) {
      bg = Colors.amber;
      label = 'VIP';
    } else if (status == CustomerStatus.churnRisk) {
      bg = Colors.red;
      label = 'Churn Risk';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg.withAlpha(30),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        label,
        style: TextStyle(color: bg, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
