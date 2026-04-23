/**
 * Prompt Templates for Component Generation
 * All prompt templates used in multi-file component generation
 */

/**
 * Extract exports summary from code
 * @param {string} code - Generated code
 * @returns {string} Exports summary
 */
export function extractExportsSummary(code) {
  const exports = [];
  
  // Find export default
  const defaultExport = code.match(/export default\s+(?:function|class|const)\s+(\w+)/);
  if (defaultExport) {
    exports.push(`default: ${defaultExport[1]}`);
  }
  
  // Find named exports
  const namedExports = code.matchAll(/export\s+(?:function|const)\s+(\w+)/g);
  for (const match of namedExports) {
    exports.push(match[1]);
  }
  
  return exports.length > 0 ? exports.join(', ') : 'No exports';
}

/**
 * Build architecture analysis prompt
 * @param {object} params - Component parameters
 * @returns {string} Prompt text
 */
export function buildArchitectureAnalysisPrompt(params) {
  const { componentName, description, componentType } = params;
  
  return `# Component Architecture Analysis Task

Please deeply analyze the following component requirements and design a reasonable **multi-file component architecture**.

## Component Information
- **Name**: ${componentName}
- **Type**: ${componentType || 'Generic Component'}
- **Description**: ${description}

## ⚠️ Important: Enforced Multi-File Generation Mode

**This project enforces multi-file componentization**, regardless of component simplicity, it must be split into multiple files.

### Minimum File Structure (at least 2 files)
\`\`\`
index.tsx (Main component)
components/${componentName || 'Component'}Content.tsx (Content sub-component)
\`\`\`

### Recommended Multi-File Structure
\`\`\`
index.tsx (Main component - responsible for state management and composing sub-components)
components/Header.tsx (Header sub-component)
components/Body.tsx (Body sub-component)
components/Footer.tsx (Footer sub-component)
utils/helpers.ts (Utility functions, optional)
\`\`\`

## Output Format (Strict JSON)

{
  "componentName": "${componentName}",
  "description": "Concise component description",
  "generationMode": "multi-file",
  "estimatedTotalLines": 150,
  "subComponents": [
    {
      "id": "comp1",
      "name": "${componentName}Header",
      "filePath": "components/${componentName}Header.tsx",
      "purpose": "Component header area, displays title and main actions",
      "props": ["title", "onAction"],
      "estimatedLines": 50,
      "priority": 1
    },
    {
      "id": "comp2",
      "name": "${componentName}Content",
      "filePath": "components/${componentName}Content.tsx",
      "purpose": "Component main content area",
      "props": ["data", "loading"],
      "estimatedLines": 70,
      "priority": 2
    }
  ],
  "utilityFunctions": [
    {
      "name": "formatData",
      "filePath": "utils/formatters.ts",
      "purpose": "Format data for display",
      "exports": ["formatData"],
      "estimatedLines": 15
    }
  ],
  "mainComponent": {
    "filePath": "index.tsx",
    "dependencies": ["${componentName}Header", "${componentName}Content"],
    "estimatedLines": 60
  }
}

## Key Requirements

1. **Must split at least 1 sub-component**
   - Even for simple components, extract the content part
   - Main component handles state management, sub-components handle UI rendering

2. **Sub-component splitting principles**:
   - Each sub-component has a single responsibility
   - Low coupling between sub-components, high cohesion
   - Avoid over-splitting (no more than 6 sub-components)
   - Sub-component code lines controlled within 40-80 lines

3. **Utility function extraction principles**:
   - Pure functions, no side effects
   - Strong reusability
   - Placed in utils/ directory
   - Each file no more than 30 lines

4. **Naming conventions**:
   - Component names use PascalCase
   - File paths use kebab-case or camelCase
   - Utility functions use camelCase

5. **Dependency relationships**:
   - Main component depends on all sub-components
   - Sub-components can depend on utility functions
   - Avoid circular dependencies

## Output Requirements
- **Output JSON only**, do not include Markdown code block markers
- **Do not add any explanatory text**
- **Ensure correct JSON format**, can be parsed by JSON.parse()
- **estimatedTotalLines** must accurately reflect total line count`;
}

/**
 * Build utility function generation prompt
 * @param {object} utilDesign - Utility function design
 * @param {object} params - Component parameters
 * @param {Array} generatedFiles - Already generated files
 * @returns {string} Prompt text
 */
export function buildUtilityFunctionPrompt(utilDesign, params, generatedFiles) {
  const context = generatedFiles.length > 0 
    ? `\n\n【Generated Files】\n${generatedFiles.map(f => `- ${f.path}: ${extractExportsSummary(f.code)}`).join('\n')}`
    : '';
  
  return `# Utility Function Generation Task

Please generate pure JavaScript utility function files, ensuring code is concise and reusable.

## Project Context
- **Main Component**: ${params.componentName}
- **Description**: ${params.description}${context}

## Current File Information
- **File Path**: ${utilDesign.filePath}
- **Purpose**: ${utilDesign.purpose}
- **Exported Functions**: ${utilDesign.exports.join(', ')}
- **Estimated Lines**: ${utilDesign.estimatedLines || 20} lines

## Code Specification Requirements

### 1. Prohibit React Import
\`\`\`javascript
// ❌ Error: Do not import React
// import React from 'react';

// ✅ Correct: Pure JavaScript functions
export function formatPrice(price) {
  return \`¥\${price.toFixed(2)}\`;
}
\`\`\`

### 2. Function Definition Specification
\`\`\`javascript
/**
 * Format price as currency string
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol (optional, default ¥)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = '¥') {
  if (typeof price !== 'number' || isNaN(price)) {
    return \`\${currency}0.00\`;
  }
  return \`\${currency}\${price.toFixed(2)}\`;
}
\`\`\`

### 3. Naming Conventions
- Function names use camelCase
- Parameter names are clear
- Add JSDoc comments

### 4. Error Handling
\`\`\`javascript
// ✅ Include basic type checking and boundary handling
export function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  return date.toISOString().split('T')[0];
}
\`\`\`

### 5. Export Method
\`\`\`javascript
// ✅ Use named exports
export function func1() { }
export function func2() { }

// ❌ Do not use default export
// export default { func1, func2 };
\`\`\`

## Output Example

\`\`\`javascript
/**
 * Format price as currency string
 * @param {number} price - Price
 * @param {string} symbol - Currency symbol
 * @returns {string}
 */
export function formatPrice(price, symbol = '¥') {
  if (typeof price !== 'number') {
    return \`\${symbol}0.00\`;
  }
  return \`\${symbol}\${price.toFixed(2)}\`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Original text
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

// [FILE_END]
\`\`\`

## Start Generation
Please generate complete ${utilDesign.filePath} file, ensure:
1. Only contains pure JavaScript functions
2. Each function has JSDoc comments
3. Includes basic error handling
4. Code does not exceed ${utilDesign.estimatedLines || 30} lines
5. Last line adds \`// [FILE_END]\` marker`;
}

/**
 * Build sub-component generation prompt
 * @param {object} componentDesign - Component design
 * @param {object} params - Component parameters
 * @param {Array} generatedFiles - Already generated files
 * @returns {string} Prompt text
 */
export function buildSubComponentPrompt(componentDesign, params, generatedFiles) {
  const context = generatedFiles.length > 0
    ? `\n\n【Generated File List】\n${generatedFiles.map(f => `- ${f.path}: ${extractExportsSummary(f.code)}`).join('\n')}`
    : '';
  
  return `# Sub-Component Generation Task

Please generate the following sub-component, ensuring code quality and completeness.

## Project Context
- **Main Component**: ${params.componentName}
- **Component Description**: ${params.description}${context}

## Current File Information
- **File Path**: ${componentDesign.filePath}
- **Component Name**: ${componentDesign.name}
- **Core Responsibility**: ${componentDesign.purpose}
- **Received Props**: 
${componentDesign.props.map(prop => `  - \`${prop}\``).join('\n')}
- **Estimated Lines**: ${componentDesign.estimatedLines} lines

## Code Specification Requirements

### 1. Import Statements
\`\`\`javascript
// ✅ Can import generated utility functions or sub-components
import { formatPrice } from '../utils/formatters';
import ProductImage from './ProductImage';

// ❌ Do not import React (use global React object)
// import React from 'react';
\`\`\`

### 2. State Management
\`\`\`javascript
// ✅ Use React.useState
const [isOpen, setIsOpen] = React.useState(false);

// ✅ Use React.useEffect
React.useEffect(() => {
  // Side effect logic
}, [dependency]);
\`\`\`

### 3. Props Definition
\`\`\`javascript
/**
 * @param {string} title - Product title
 * @param {number} price - Product price
 * @param {boolean} inStock - Stock availability
 */
export default function ProductInfo({ title, price, inStock }) {
  // Component logic
}
\`\`\`

### 4. Style Handling
\`\`\`javascript
// ✅ Use inline style objects
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }
};

return <div style={styles.container}>...</div>;
\`\`\`

**⚠️ Correct Way for Conditional Styles (CRITICAL - Must Follow!)**:

\`\`\`javascript
// ❌ Absolutely Forbidden: Using dot instead of colon in ternary operator
style={{
  ...styles.stockTag,
  ...(isOutOfStock ? styles.outOfStockTag.inStockTag),  // ← Fatal error! Should be colon not dot
}}

// ✅ Correct Way 1: Complete ternary expression (Recommended)
style={{
  ...styles.stockTag,
  ...(isOutOfStock ? styles.outOfStockTag : styles.inStockTag),
}}

// ✅ Correct Way 2: Logical AND operator
style={{
  ...styles.buttonBase,
  ...(isDisabled && styles.disabled),
}}

// ✅ Correct Way 3: Conditional assignment
const tagStyle = isOutOfStock ? styles.outOfStockTag : styles.inStockTag;
return <span style={{ ...styles.stockTag, ...tagStyle }}>Tag</span>;
\`\`\`

**Self-Check Checklist**:
1. All ternary operators must include both \`?\` and \`:\` symbols
2. Never use \`.\` instead of \`:\`
3. Spread operator \`...()\` must contain valid objects or \`undefined\`
4. After generating code, check syntax of all ternary expressions line by line

### 5. Code Completeness Requirements
- ✅ **All brackets closed**: (), {}, <>
- ✅ **All strings closed**: "", '', \`\`
- ✅ **All JSX tags closed**: <div>...</div> or <div />
- ✅ **Last line must be complete statement**
- ✅ **Must add marker at end**: \`// [FILE_END]\`

## Output Example

\`\`\`javascript
import { formatPrice } from '../utils/formatters';

/**
 * Product information display component
 * @param {Object} props - Component properties
 * @param {string} props.title - Product title
 * @param {number} props.price - Product price
 */
export default function ProductInfo({ title, price }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</h3>
      <p style={{ color: '#e53e3e', fontSize: '20px' }}>
        {formatPrice(price)}
      </p>
      {isExpanded && (
        <button onClick={handleToggle}>Collapse</button>
      )}
    </div>
  );
}

// [FILE_END]
\`\`\`

## Start Generation
Please generate complete ${componentDesign.name} component code, ensure:
1. Code does not exceed ${componentDesign.estimatedLines} lines
2. Strictly follow above specifications
3. Last line adds \`// [FILE_END]\` marker`;
}

/**
 * Build main component generation prompt
 * @param {object} architecture - Component architecture
 * @param {object} _params - Component parameters (unused)
 * @param {object} _generatedFiles - Generated files (unused)
 * @returns {string} Prompt text
 */
export function buildMainComponentPrompt(architecture, _params, _generatedFiles) {
  const subComponentsList = architecture.subComponents?.map(c => 
    `- **${c.filePath}**: export default ${c.name} (${c.purpose})`
  ).join('\n') || 'None';
  
  const utilsList = architecture.utilityFunctions?.map(u =>
    `- **${u.filePath}**: Exports ${u.exports.join(', ')} (${u.purpose})`
  ).join('\n') || 'None';
  
  const importStatements = [
    ...(architecture.subComponents?.map(c => `import ${c.name} from './${c.filePath.replace('.tsx', '')}';`) || []),
    ...(architecture.utilityFunctions?.map(u => `import { ${u.exports.join(', ')} } from './${u.filePath.replace('.ts', '')}';`) || [])
  ].join('\n');
  
  return `# Main Component Generation Task

Please generate the main component entry file, responsible for composing all sub-components and managing overall state.

## Project Information
- **Component Name**: ${architecture.componentName}
- **Component Description**: ${architecture.description}
- **Complexity**: ${architecture.complexity}
- **Estimated Total Lines**: ${architecture.estimatedTotalLines} lines

## Generated File List

### Sub-Components
${subComponentsList}

### Utility Functions
${utilsList}

## Current File Requirements
- **File Path**: index.tsx
- **Component Name**: ${architecture.componentName}
- **Core Responsibilities**: 
  1. Import and compose all sub-components
  2. Manage global state and data flow
  3. Handle user interactions and business logic
  4. Pass Props to sub-components

## Mock Data Definition

Please define \`mockData\` object at the top of the code, containing:
- All fields required by the component
- Reasonable data types and default values
- At least 2-3 sample data entries (if list)

Example:
\`\`\`javascript
const mockData = {
  title: 'Product Title',
  price: 99.99,
  description: 'Product description',
  inStock: true,
  images: ['image1.jpg', 'image2.jpg']
};
\`\`\`

## Code Structure Template

\`\`\`javascript
// ====== Import Statements ======
${importStatements || '// No additional imports needed'}

// ====== Mock Data ======
const mockData = {
  // Define mock data here
};

// ====== Main Component ======
/**
 * ${architecture.componentName} Component
 * @description ${architecture.description}
 */
export default function ${architecture.componentName}(props) {
  // 1. Destructure Props (with default values)
  const {
    // props list
  } = props || {};

  // 2. State Declarations
  const [state1, setState1] = React.useState(mockData.field1);
  const [state2, setState2] = React.useState(false);

  // 3. Side Effects
  React.useEffect(() => {
    // Initialization logic
  }, []);

  // 4. Event Handlers
  const handleAction = () => {
    // Business logic
  };

  // 5. Render
  return (
    <div style={{ /* Container styles */ }}>
      {/* Use sub-components */}
      <SubComponent1 prop1={state1} onAction={handleAction} />
      <SubComponent2 data={mockData} />
    </div>
  );
}

// [FILE_END]
\`\`\`

## Key Requirements

### 1. Import Specification
\`\`\`javascript
// ✅ Correct: Import all dependencies
import ProductImage from './components/ProductImage';
import { formatPrice } from './utils/formatters';

// ❌ Error: Do not import React
// import React from 'react';
\`\`\`

### 2. Props Interface (Use JSDoc)
\`\`\`javascript
/**
 * @param {string} props.title - Title
 * @param {number} props.price - Price
 * @param {Function} props.onClick - Click callback
 */
export default function Component({ title, price, onClick }) {
  // ...
}
\`\`\`

### 3. State Management
- Use \`React.useState\` for local state
- Use \`React.useEffect\` for side effects
- Clear state naming (e.g., \`isLoading\`, \`isExpanded\`)

### 4. Style Handling
- Use inline style objects
- Keep styles simple, avoid excessive nesting
- Support responsive (optional)

**⚠️ Correct Way for Conditional Styles**:
\`\`\`javascript
// ❌ Error: Extra parentheses causing syntax error
style={{
  ...styles.buttonBase,
  ...(isDisabled ? styles.disabled),  // ← Error!
}}

// ✅ Correct Way 1: Provide default value
style={{
  ...styles.buttonBase,
  ...(isDisabled ? styles.disabled : {}),
}}

// ✅ Correct Way 2: Use logical AND (Recommended)
style={{
  ...styles.buttonBase,
  ...(isDisabled && styles.disabled),
}}

// ✅ Correct Way 3: Use ternary directly on style property
style={isDisabled ? styles.disabled : styles.buttonBase}
\`\`\`

### 5. Code Completeness
- ✅ All brackets closed
- ✅ All strings closed
- ✅ JSX tags complete
- ✅ Last line adds \`// [FILE_END]\`

## Output Requirements
- Code does not exceed ${architecture.mainComponent?.estimatedLines || 100} lines
- Strictly follow above template and specifications
- Ensure can run independently (with generated sub-components)
- Last line must add \`// [FILE_END]\` marker`;
}
