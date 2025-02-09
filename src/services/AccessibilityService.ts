export class AccessibilityService {
  private static instance: AccessibilityService;
  private fontSize: number = 16;
  private highContrast: boolean = false;

  private constructor() {}

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  increaseFontSize(): void {
    if (this.fontSize < 24) {
      this.fontSize += 2;
      document.documentElement.style.fontSize = `${this.fontSize}px`;
    }
  }

  decreaseFontSize(): void {
    if (this.fontSize > 12) {
      this.fontSize -= 2;
      document.documentElement.style.fontSize = `${this.fontSize}px`;
    }
  }

  toggleHighContrast(): void {
    this.highContrast = !this.highContrast;
    document.body.classList.toggle('high-contrast');
  }

  enableKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleKeyboardNavigation);
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      // Adiciona um outline visível para o elemento focado
      const focusedElement = document.activeElement;
      if (focusedElement) {
        focusedElement.classList.add('keyboard-focus');
      }
    }
  }
}