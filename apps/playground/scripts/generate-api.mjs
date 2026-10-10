import { createRequire } from 'node:module';
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
const names = ['DataTableProps', 'DataTableColumn', 'Pagination', 'TableChange', 'SelectionConfig', 'SelectionSnapshot', 'ExpandableConfig', 'FilterRenderContext'];
const api = {};
for (const name of names) {
  let symbol = checker.getExportsOfModule(module).find((item) => item.name === name);
  if (!symbol) throw new Error(`Missing public type: ${name}`);
  if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
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
console.log(`Generated API reference from mantine-datatable-lite@${pkg.version}`);
