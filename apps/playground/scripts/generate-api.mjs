import { createRequire } from 'node:module';
import console from 'node:console';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'package.json'));
const packageRoot = resolve(dirname(require.resolve('mantine-datatable-lite')), '..');
const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
const declaration = resolve(packageRoot, pkg.types);
const program = ts.createProgram([declaration], { skipLibCheck: true, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext });
const checker = program.getTypeChecker();
const module = checker.getSymbolAtLocation(program.getSourceFile(declaration));
if (!module) throw new Error('Could not read published package declarations');
const exports = checker.getExportsOfModule(module);
function publicSymbol(name) {
  let symbol = exports.find((item) => item.name === name);
  if (!symbol) throw new Error(`Missing public export: ${name}`);
  if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return symbol;
}
const names = ['DataTableProps', 'DataTableColumn', 'Pagination', 'TableChange', 'SelectionConfig', 'SelectionSnapshot', 'ExpandableConfig', 'FilterRenderContext'];
const api = {};
for (const name of names) {
  const symbol = publicSymbol(name);
  api[name] = checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol)).map((property) => {
    const node = property.valueDeclaration ?? property.declarations?.[0];
    return {
      name: property.name,
      type: node?.type?.getText().replace(/\s+/g, ' ') ?? checker.typeToString(checker.getTypeOfSymbolAtLocation(property, node)),
      required: !(property.flags & ts.SymbolFlags.Optional),
      description: ts.displayPartsToString(property.getDocumentationComment(checker)),
    };
  });
}
mkdirSync(resolve(root, 'src/docs/generated'), { recursive: true });
writeFileSync(resolve(root, 'src/docs/generated/api.json'), `${JSON.stringify({ version: pkg.version, api }, null, 2)}\n`);
// The rendered guide and stable download share one authored source and the npm API.
const typeFile = publicSymbol('DataTableProps').declarations[0].getSourceFile();
const types = typeFile.statements
  .filter((node) => ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
  .map((node) => node.getText()).join('\n\n');
const iconProps = publicSymbol('IconProps').declarations[0].getText();
const actions = publicSymbol('rowActionsColumn').declarations[0].getText();
const guide = readFileSync(resolve(root, 'src/docs/content/llm.md'), 'utf8').replaceAll('{{version}}', pkg.version);
const reference = [
  "import type * as React from 'react';",
  "import type { MouseEvent, ReactNode, ComponentProps, SVGProps } from 'react';",
  "import type { MantineSpacing, MantineColor, LoaderProps } from '@mantine/core';",
  types, iconProps, actions,
].join('\n\n');
const markdown = `${guide.trim()}\n\n## API reference\n\nThese declarations come from the installed published package, version \`${pkg.version}\`. They are reference definitions; import public values and types from \`mantine-datatable-lite\` in your application. The \`RangeFilterValue\` helper below describes numeric/date unions and is not a public export.\n\n\`\`\`tsx\n${reference}\n\`\`\`\n`;
mkdirSync(resolve(root, 'public'), { recursive: true });
writeFileSync(resolve(root, 'src/docs/generated/llm.md'), markdown);
writeFileSync(resolve(root, 'public/llm.md'), markdown);
console.log(`Generated API reference and LLM guide from mantine-datatable-lite@${pkg.version}`);
