import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFF0F172A); // Slate 900
  static const Color primaryLight = Color(0xFF1E293B);
  
  // Vibrant Blue for high-contrast actions (Download Policy, Primary Actions)
  static const Color primaryBlue = Color(0xFF2563EB); // Blue 600
  static const Color primaryBlueDark = Color(0xFF60A5FA); // Blue 400

  static const Color accent = Color(0xFF0D9488); // Teal 600
  static const Color accentLight = Color(0xFF14B8A6); // Teal 500
  static const Color amber = Color(0xFFD97706); // Amber 600
  static const Color amberLight = Color(0xFFF59E0B); // Amber 500
  static const Color purple = Color(0xFF7C3AED); // Purple 600
  static const Color purpleDark = Color(0xFFA78BFA); // Purple 400

  // Backgrounds
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color darkBackground = Color(0xFF0F172A); // Slate 900
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF1E293B); // Slate 800

  // Glass & Borders
  static const Color glassBorderLight = Color(0xFFE2E8F0); // Slate 200
  static const Color glassBorderDark = Color(0xFF334155); // Slate 700
  static const Color glassBgLight = Color(0xEEFFFFFF);
  static const Color glassBgDark = Color(0xEE1E293B);

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF64748B); // Slate 500

  // Dark Mode Text Colors
  static const Color darkTextPrimary = Colors.white;
  static const Color darkTextSecondary = Color(0xFFCBD5E1); // Slate 300
  static const Color darkTextMuted = Color(0xFF94A3B8); // Slate 400
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryBlue,
        secondary: AppColors.accent,
        surface: AppColors.cardLight,
        onSurface: AppColors.textPrimary,
      ),
      dividerColor: AppColors.glassBorderLight,
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.light().textTheme,
      ).copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          letterSpacing: -1.0,
          color: AppColors.textPrimary,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
          color: AppColors.textPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.normal,
          color: AppColors.textSecondary,
        ),
        labelSmall: GoogleFonts.jetBrainsMono(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryBlueDark,
        secondary: AppColors.accentLight,
        surface: AppColors.cardDark,
        onSurface: AppColors.darkTextPrimary,
      ),
      dividerColor: AppColors.glassBorderDark,
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.dark().textTheme,
      ).copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          letterSpacing: -1.0,
          color: AppColors.darkTextPrimary,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
          color: AppColors.darkTextPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.darkTextPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColors.darkTextPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.normal,
          color: AppColors.darkTextSecondary,
        ),
        labelSmall: GoogleFonts.jetBrainsMono(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
          color: AppColors.darkTextMuted,
        ),
      ),
    );
  }
}
