import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String defaultBaseUrl = 'https://bimaheadquarter.com';
  static String baseUrl = defaultBaseUrl;

  static const String _tokenKey = 'bhq_auth_token';
  static const String _userKey = 'bhq_auth_user';
  static const String _mpinKey = 'bhq_auth_mpin';

  // ── Session & Storage Helpers ─────────────────────────────────────

  static Future<void> saveSession({
    required String token,
    required Map<String, dynamic> user,
    String? mpin,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user));
    if (mpin != null && mpin.isNotEmpty) {
      await prefs.setString(_mpinKey, mpin);
    }
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(_userKey);
    if (userStr == null || userStr.isEmpty) return null;
    try {
      return jsonDecode(userStr) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<String?> getSavedMpin() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_mpinKey);
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_mpinKey);
  }

  // ── Generic HTTP Methods with Bearer Header ───────────────────────

  static Future<Map<String, String>> _getHeaders({bool requireAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (requireAuth) {
      final token = await getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  static Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$baseUrl$cleanPath').replace(queryParameters: queryParams);
  }

  // ── Auth APIs ─────────────────────────────────────────────────────

  /// Client ID + MPIN Login
  static Future<Map<String, dynamic>> login({
    required String customerId,
    required String mpin,
  }) async {
    final uri = _buildUri('/api/auth/client/login');
    final response = await http.post(
      uri,
      headers: await _getHeaders(requireAuth: false),
      body: jsonEncode({
        'customerId': customerId.trim(),
        'mpin': mpin.trim(),
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['success'] == true) {
      final token = data['token'] as String? ?? '';
      final user = data['user'] as Map<String, dynamic>? ?? {};
      if (token.isNotEmpty) {
        await saveSession(token: token, user: user, mpin: mpin);
      }
      return data;
    } else {
      throw Exception(data['error'] ?? 'Login failed. Please verify Client ID and MPIN.');
    }
  }

  /// Google Account + MPIN Login
  static Future<Map<String, dynamic>> googleLogin({
    required String accessToken,
    String? customerId,
    String? mpin,
  }) async {
    final uri = _buildUri('/api/auth/client/google-mpin-login');
    final response = await http.post(
      uri,
      headers: await _getHeaders(requireAuth: false),
      body: jsonEncode({
        'accessToken': accessToken,
        if (customerId != null) 'customerId': customerId.trim(),
        if (mpin != null) 'mpin': mpin.trim(),
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['success'] == true) {
      final token = data['token'] as String? ?? '';
      final user = data['user'] as Map<String, dynamic>? ?? {};
      if (token.isNotEmpty) {
        await saveSession(token: token, user: user, mpin: mpin);
      }
      return data;
    } else {
      throw Exception(data['error'] ?? 'Google verification failed.');
    }
  }

  // ── Live Data APIs ────────────────────────────────────────────────

  /// Fetches active policies from PostgreSQL
  static Future<List<Map<String, dynamic>>> getPolicies() async {
    final uri = _buildUri('/api/client/policies');
    final response = await http.get(uri, headers: await _getHeaders());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['success'] == true && data['policies'] is List) {
        return (data['policies'] as List).cast<Map<String, dynamic>>();
      }
      return [];
    } else if (response.statusCode == 401) {
      await clearSession();
      throw Exception('Session expired. Please log in again.');
    } else {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to load policies.');
    }
  }

  /// Fetches claims history from PostgreSQL
  static Future<List<Map<String, dynamic>>> getClaims() async {
    final uri = _buildUri('/api/client/claims');
    final response = await http.get(uri, headers: await _getHeaders());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['success'] == true && data['claims'] is List) {
        return (data['claims'] as List).cast<Map<String, dynamic>>();
      }
      return [];
    } else if (response.statusCode == 401) {
      await clearSession();
      throw Exception('Session expired. Please log in again.');
    } else {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to load claims.');
    }
  }

  /// Files a new claim directly to CRM database
  static Future<Map<String, dynamic>> fileClaim({
    required String policyNumber,
    required double claimAmount,
    String? garageOrHospital,
    String? remarks,
  }) async {
    final uri = _buildUri('/api/client/claims');
    final response = await http.post(
      uri,
      headers: await _getHeaders(),
      body: jsonEncode({
        'policyNumber': policyNumber.trim(),
        'claimAmount': claimAmount,
        'garageOrHospital': garageOrHospital?.trim() ?? '',
        'remarks': remarks?.trim() ?? '',
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to submit claim.');
    }
  }

  /// Fetches customer profile, covered members & registered assets
  static Future<Map<String, dynamic>> getProfile() async {
    final uri = _buildUri('/api/client/profile');
    final response = await http.get(uri, headers: await _getHeaders());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return data['profile'] ?? data['customer'] ?? {};
    } else if (response.statusCode == 401) {
      await clearSession();
      throw Exception('Session expired. Please log in again.');
    } else {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to load profile.');
    }
  }

  /// Submits a support / service request ticket to CRM
  static Future<Map<String, dynamic>> submitServiceRequest({
    required String requestType,
    required String subject,
    required String description,
    String? policyNumber,
  }) async {
    final uri = _buildUri('/api/client/service-requests');
    final response = await http.post(
      uri,
      headers: await _getHeaders(),
      body: jsonEncode({
        'requestType': requestType,
        'subject': subject.trim(),
        'description': description.trim(),
        if (policyNumber != null && policyNumber.isNotEmpty) 'policyNumber': policyNumber.trim(),
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to submit service request.');
    }
  }
}
