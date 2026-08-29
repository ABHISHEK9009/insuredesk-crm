import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/policy.dart';
import '../models/claim.dart';
import 'api_service.dart';

/// Provider for live policies fetched directly from PostgreSQL database
final livePoliciesProvider = FutureProvider<List<Policy>>((ref) async {
  try {
    final rawPolicies = await ApiService.getPolicies();
    return rawPolicies.map((p) => Policy.fromJson(p)).toList();
  } catch (err) {
    return <Policy>[];
  }
});

/// Provider for live claims filed by the client
final liveClaimsProvider = FutureProvider<List<Claim>>((ref) async {
  try {
    final rawClaims = await ApiService.getClaims();
    return rawClaims.map((c) => Claim.fromJson(c)).toList();
  } catch (err) {
    return <Claim>[];
  }
});

/// Provider for live customer profile details
final liveProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  try {
    final profile = await ApiService.getProfile();
    return profile;
  } catch (_) {
    return <String, dynamic>{};
  }
});
