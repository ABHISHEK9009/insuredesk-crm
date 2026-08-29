import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bimaheadquarter_app/main.dart';

void main() {
  testWidgets('BimaHQApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: BimaHQApp(),
      ),
    );
    expect(find.text('Namaste, Rahul'), findsOneWidget);
  });
}
