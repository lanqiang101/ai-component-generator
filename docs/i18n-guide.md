# Internationalization (i18n) Implementation Guide

## Overview

The AI Component Generator now supports bilingual interface (English and Chinese) with seamless language switching.

## Implementation Details

### 1. Architecture

The i18n system is built using:
- **React Context** for providing translation data throughout the app
- **Custom Hook** (`useTranslation`) for accessing translations in components
- **Zustand Store** for persisting language preference
- **LocalStorage** for saving user's language choice

### 2. File Structure

```
src/i18n/
├── index.tsx    # I18n Context, Provider, and useTranslation hook
├── en.ts        # English translations
└── zh.ts        # Chinese translations
```

### 3. Key Features

#### Language Switching
- Click the Globe icon (🌐) in the header to toggle between English and Chinese
- Language preference is automatically saved to localStorage
- Default language is English

#### Translated Components
- ✅ App Header (title, subtitle, tooltips)
- ✅ Left Form Panel (all form labels, placeholders, options)
- ✅ Generate Button
- ✅ Preview Panel
- ✅ Code Editor Panel
- ✅ Requirements Refinement Dialog
- ✅ Generation Progress indicators

### 4. Usage in Components

```typescript
import { useTranslation } from '../i18n';

function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t.common.appName}</h1>
      <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}>
        Toggle Language
      </button>
    </div>
  );
}
```

### 5. Adding New Translations

To add new translatable text:

1. Add keys to `src/i18n/en.ts`:
```typescript
export const en = {
  // ... existing translations
  mySection: {
    title: 'My Title',
    description: 'My Description',
  },
};
```

2. Add corresponding Chinese translations to `src/i18n/zh.ts`:
```typescript
export const zh = {
  // ... existing translations
  mySection: {
    title: '我的标题',
    description: '我的描述',
  },
};
```

3. Use in component:
```typescript
const { t } = useTranslation();
<h1>{t.mySection.title}</h1>
```

### 6. Technical Notes

- All code comments remain in English (per project standards)
- UI library names and technical terms are kept in their original form
- Framework/language names (React, TypeScript, etc.) are not translated
- The i18n system does NOT affect code generation logic - only UI text

### 7. State Management

Language state is managed in two places:
1. **I18n Context**: Provides real-time translations to components
2. **Zustand Store**: Persists language preference and syncs with localStorage

This dual approach ensures:
- Immediate UI updates when language changes
- Persistent preference across page reloads
- Consistent state management with the rest of the app

### 8. Testing

To test the i18n implementation:

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Click the Globe icon in the header to switch languages
4. Verify all UI elements update correctly
5. Refresh the page to confirm language preference persists

## Future Enhancements

Potential improvements for the i18n system:
- [ ] Add more languages (Japanese, Korean, Spanish, etc.)
- [ ] Implement lazy loading of translation files
- [ ] Add RTL (Right-to-Left) language support
- [ ] Create a translation management dashboard
- [ ] Add automated translation validation tests

## Troubleshooting

### Issue: Text not translating
- Check if the translation key exists in both `en.ts` and `zh.ts`
- Verify the component is wrapped with `I18nProvider`
- Ensure `useTranslation()` hook is called within the provider

### Issue: Language preference not persisting
- Check browser console for localStorage errors
- Verify localStorage is not disabled/blocked
- Check if the storage key `aicg-language` is being set correctly

### Issue: Some components still showing hardcoded text
- Those components haven't been internationalized yet
- Follow the pattern in updated components to add i18n support
