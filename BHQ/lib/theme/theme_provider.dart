import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// StateNotifier/StateProvider for managing the app theme mode.
/// Defaults to [ThemeMode.light] as requested.
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.light);
