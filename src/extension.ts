import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function loadDatabase(context: vscode.ExtensionContext): Record<string, any> {
    const dbPath = path.join(context.extensionPath, 'src', 'database.json');
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
}

export function activate(context: vscode.ExtensionContext) {
    const db = loadDatabase(context);
    const functions = Object.keys(db);

    const freefemTypes: Record<string, string> = {
        'mesh': 'Triangular 2D mesh.',
        'mesh3': 'Tetrahedral 3D mesh.',
        'meshS': 'Surface 3D mesh.',
        'meshL': 'Curve 3D mesh.',
        'fespace': 'Finite element space defined on a mesh.',
        'matrix': 'Sparse matrix.',
        'matrixl': 'Long Sparse matrix (long integer indices, for large systems)',
        'real': 'Floating point number.',
        'int': 'Integer number.',
        'complex': 'Complex number.',
        'bool': 'Boolean value (true or false).',
        'string': 'Character string.',
        'func': 'Function type.',
        'border': 'Boundary curve definition.',
        'varf': 'Variational form.',
        'macro': 'Macro definition.',
        'ifstream': 'Input file stream.',
        'ofstream': 'Output file stream.',
        'problem': 'Variational problem definition.',
        'solve': 'Solve a variational problem inline.',
    };

    const freefemFESpaces: Record<string, string> = {
    // most common
    'P1': 'Piecewise linear finite element, continuous (2D).',
    'P2': 'Piecewise quadratic finite element, continuous (2D).',
    'P0': 'Piecewise constant finite element (2D).',
    'P1dc': 'Piecewise linear finite element, discontinuous.',
    'P2dc': 'Piecewise quadratic finite element, discontinuous.',
    'RT0': 'Raviart-Thomas finite element of order 0 (2D).',
    'P1b': 'P1 with bubble function (2D).',
    'P1nc': 'P1 non-conforming finite element.',
    // 3D
    'P13d': 'Piecewise linear finite element, continuous (3D).',
    'P23d': 'Piecewise quadratic finite element, continuous (3D).',
    'P03d': 'Piecewise constant finite element (3D).',
    'RT03d': 'Raviart-Thomas finite element of order 0 (3D).',
    'Edge03d': '3D Nedelec edge element of order 0.',
    // plugin necessary
    'P3': 'Piecewise cubic finite element (requires load "Element_P3").',
    'P4': 'Piecewise quartic finite element (requires load "Element_P4").',
    'P5': 'Piecewise quintic finite element (requires load "Element_P3").',
    'P3dc': 'Piecewise cubic finite element, discontinuous (requires load "Element_P3dc").',
    'P4dc': 'Piecewise quartic finite element, discontinuous (requires load "Element_P4dc").',
    'P5dc': 'Piecewise quintic finite element, discontinuous (requires load "Element_P3dc").',
    'P1Edge': 'P1 edge finite element (requires load "Element_PkEdge").',
    'P2Edge': 'P2 edge finite element (requires load "Element_PkEdge").',
    'P3Edge': 'P3 edge finite element (requires load "Element_PkEdge").',
    'P4Edge': 'P4 edge finite element (requires load "Element_PkEdge").',
    'P5Edge': 'P5 edge finite element (requires load "Element_PkEdge").',
    'RT1': 'Raviart-Thomas finite element of order 1 (requires load "Element_Mixte").',
    'RT1Ortho': 'Raviart-Thomas orthogonal finite element of order 1 (requires load "Element_Mixte").',
    'RT2': 'Raviart-Thomas finite element of order 2 (requires load "Element_Mixte").',
    'RT2Ortho': 'Raviart-Thomas orthogonal finite element of order 2 (requires load "Element_Mixte").',
    'BDM1': 'Brezzi-Douglas-Marini finite element of order 1 (requires load "Element_Mixte").',
    'BDM1Ortho': 'Brezzi-Douglas-Marini orthogonal finite element of order 1 (requires load "Element_Mixte").',
    'Edge13d': '3D Nedelec edge element of order 1 (requires load "Element_Mixte3d").',
    'Edge23d': '3D Nedelec edge element of order 2 (requires load "Element_Mixte3d").',
    'P2Morley': 'Morley finite element (requires load "Morley").',
    'HCT': 'Hsieh-Clough-Tocher finite element (requires load "HCT").',
    'P2BR': 'Bernardi-Raugel finite element (requires load "BernardiRaugel").',
    // Others
    'P2h': 'Piecewise quadratic finite element with hierarchical basis.',
    'P1b3d': 'P1 with bubble function (3D).',
    'P1bl': 'P1 with local bubble function (2D).',
    'P1bl3d': 'P1 with local bubble function (3D).',
    'P0Edge': 'Piecewise constant edge finite element.',
    'RT0Ortho': 'Raviart-Thomas orthogonal finite element of order 0.',
    'FEQF': 'Quadrature formula finite element.',
    };

    const freefemGlobals: Record<string, string> = {
        'x': 'Current Cartesian x-coordinate.',
        'y': 'Current Cartesian y-coordinate.',
        'z': 'Current Cartesian z-coordinate (3D).',
        'P': 'Current point object (access components via P.x, P.y, P.z, P.r, P.theta, P.phi).',
        'label': 'Integer identifier of the current boundary (used in int1d or border conditions).',
        'region': 'Integer identifier of the current subdomain/volume (used in int2d or int3d).',
        'N': 'Outward unit normal vector (access components via N.x, N.y, N.z).',
        'lenEdge': 'Length of the current edge (available in 1D integration).',
        'hTriangle': 'Size (diameter) of the current mesh element.',
        'area': 'Area (2D) or Volume (3D) of the current mesh element.',
        'volume': 'Volume of the current 3D mesh element.',
        'nuTriangle': 'Global index of the current element.',
        'nuEdge': 'Global index of the current edge.',
        'nTonEdge': 'Index of the adjacent element on the other side of the current edge.',
        'pi': 'Mathematical constant π ≈ 3.14159265358979.',
        'true': 'Boolean true value.',
        'false': 'Boolean false value.',
        'verbosity': 'Control level of terminal output (0: silent, 1: default, higher: more debug info).',
        'mpirank': 'MPI rank of the current process (for parallel computing).',
        'mpisize': 'Total number of MPI processes (for parallel computing).',
    };

    const freefemSolvers: Record<string, string> = {
        'CG': 'Conjugate Gradient iterative solver (symmetric positive definite matrices).',
        'GMRES': 'Generalized Minimal Residual iterative solver.',
        'UMFPACK': 'Unsymmetric MultiFrontal direct solver.',
        'MUMPS': 'MUltifrontal Massively Parallel sparse direct Solver.',
        'LU': 'LU direct factorization solver.',
        'Cholesky': 'Cholesky direct factorization solver (symmetric positive definite matrices).',
        'Crout': 'Crout direct factorization solver.',
        'SuperLU': 'SuperLU sparse direct solver.',
        'sparsesolver': 'Default sparse solver (alias for UMFPACK).',
    };

    const freefemPlugins: Record<string, string> = {
        'msh3': '3D mesh tools (buildlayers, cube, movemesh3D...).',
        'tetgen': 'Tetrahedral mesh generator interface.',
        'mmg3d': 'Mmg3d mesh adaptation interface.',
        'mshmet': 'Mesh metric computation.',
        'medit': 'Medit mesh visualization interface.',
        'gmsh': 'Gmsh mesh generator interface.',
        'netgen': 'Netgen mesh generator interface.',
        'MUMPS': 'MUMPS parallel sparse direct solver.',
        'MUMPS_seq': 'MUMPS sequential sparse direct solver.',
        'SuperLU': 'SuperLU sparse direct solver.',
        'UMFPACK64': 'UMFPACK 64-bit sparse direct solver.',
        'PARDISO': 'PARDISO sparse direct solver.',
        'Element_P3': 'P3 Lagrange finite element.',
        'Element_P4': 'P4 Lagrange finite element.',
        'Element_P3dc': 'P3 discontinuous finite element.',
        'Element_P4dc': 'P4 discontinuous finite element.',
        'Element_Mixte': 'Mixed finite elements (RT1, RT2, BDM1...).',
        'Element_Mixte3d': '3D mixed finite elements (Edge13d, Edge23d...).',
        'Element_P1ncdc': 'P1 non-conforming discontinuous finite element.',
        'BernardiRaugel': 'Bernardi-Raugel finite element.',
        'Morley': 'Morley finite element.',
        'HCT': 'Hsieh-Clough-Tocher finite element.',
        'Element_PkEdge': 'Pk edge finite elements.',
        'iovtk': 'VTK format I/O (savevtk, vtkload...).',
        'iohdf5': 'HDF5 format I/O.',
        'fflapack': 'LAPACK interface (eigenvalues, matrix operations...).',
        'lapack': 'LAPACK linear algebra library.',
        'metis': 'METIS mesh partitioning.',
        'scotch': 'SCOTCH mesh partitioning.',
        'ff-Ipopt': 'IPOPT optimization solver interface.',
        'ff-NLopt': 'NLopt optimization library interface.',
        'ffnewuoa': 'NEWUOA optimization algorithm.',
        'gsl': 'GNU Scientific Library interface.',
        'dfft': 'Discrete Fast Fourier Transform.',
        'distance': 'Distance function computation.',
        'isoline': 'Isoline extraction.',
        'shell': 'Shell commands (mkdir, chmod, getenv...).',
        'pipe': 'Pipe and sleep functions.',
    };

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'freefem' },
        {
            provideCompletionItems(document, position) {
                const lineText = document.lineAt(position).text;
                const textBeforeCursor = lineText.substring(0, position.character);

                const funcItems = functions.map(name => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
                    const entry = db[name];
                    if (entry.description) {
                        item.documentation = new vscode.MarkdownString(entry.description);
                    }
                    return item;
                });

                const typeItems = Object.entries(freefemTypes).map(([name, desc]) => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Struct);
                    item.documentation = new vscode.MarkdownString(desc);
                    return item;
                });

                const feItems = Object.entries(freefemFESpaces).map(([name, desc]) => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Enum);
                    item.documentation = new vscode.MarkdownString(desc);
                    return item;
                });

                const globalItems = Object.entries(freefemGlobals).map(([name, desc]) => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
                    item.detail = 'Global Variable';
                    item.documentation = new vscode.MarkdownString(desc);
                    return item;
                });

                const solverItems = Object.entries(freefemSolvers).map(([name, desc]) => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.EnumMember);
                    item.documentation = new vscode.MarkdownString(desc);
                    return item;
                });

                const pluginItems = Object.entries(freefemPlugins).map(([name, desc]) => {
                    const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Module);
                    item.documentation = new vscode.MarkdownString(desc);
                    return item;
                });

                // Local variables - root
                const text = document.getText();
                const varRegex = /\b(mesh|mesh3|meshS|meshL|fespace|matrix|real|int|complex|bool|string|func|varf)\s+(\w+)/g;
                let varMatch;
                const localVarItems: vscode.CompletionItem[] = [];
                const seen = new Set<string>();

                while ((varMatch = varRegex.exec(text)) !== null) {
                    const varType = varMatch[1];
                    const varName = varMatch[2];
                    if (!seen.has(varName)) {
                        seen.add(varName);
                        const item = new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable);
                        item.detail = varType;
                        item.documentation = new vscode.MarkdownString(`Local variable of type \`${varType}\`.`);
                        localVarItems.push(item);
                    }
                }

                // Contexte solver=
                if (textBeforeCursor.match(/solver\s*=\s*$/)) {
                    return solverItems;
                }

                // Contexte fespace Vh(Th,
                if (textBeforeCursor.match(/fespace\s+\w+\s*\(\s*\w+\s*,\s*\w*$/)) {
                    return feItems;
                }

                // Contexte load "
                if (textBeforeCursor.match(/load\s*"\s*\w*$/)) {
                    return pluginItems;
                }

                // Par défaut
                return [...funcItems, ...typeItems, ...feItems, ...globalItems, ...localVarItems];
            }
        },
        '=', '"', ' ', ','
    );

    const signatureProvider = vscode.languages.registerSignatureHelpProvider(
        { scheme: 'file', language: 'freefem' },
        {
            provideSignatureHelp(document, position) {
                const lineText = document.lineAt(position).text;
                const textBeforeCursor = lineText.substring(0, position.character);

                const match = textBeforeCursor.match(/([a-zA-Z][a-zA-Z0-9]*)\s*\(([^)]*)$/);
                if (!match) { return null; }

                const funcName = match[1].toLowerCase();
                const entry = db[funcName];
                if (!entry || !entry.signature) { return null; }

                const parenStart = entry.signature.indexOf('(');
                const parenEnd = entry.signature.lastIndexOf(')');
                const sigMatch = parenStart !== -1 && parenEnd !== -1
                    ? [null, entry.signature.substring(parenStart + 1, parenEnd)]
                    : null;
                if (!sigMatch) { return null; }

                const allParams = sigMatch[1].split(',').map((p: string) => p.trim());
                const required = allParams.filter((p: string) => !p.includes('='));
                const hasOptional = allParams.some((p: string) => p.includes('='));
                const params = required.join(', ') + (hasOptional ? ', ...opts' : '');

                const signature = new vscode.SignatureInformation(
                    `${funcName}(${params})`,
                    new vscode.MarkdownString(entry.description)
                );

                const signatureHelp = new vscode.SignatureHelp();
                signatureHelp.signatures = [signature];
                signatureHelp.activeSignature = 0;
                signatureHelp.activeParameter = 0;

                return signatureHelp;
            }
        },
        '(', ','
    );

    const hoverProvider = vscode.languages.registerHoverProvider(
        { scheme: 'file', language: 'freefem' },
        {
            provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) { return null; }

                const word = document.getText(wordRange).toLowerCase();
                const entry = db[word];
                if (!entry) { return null; }

                const md = new vscode.MarkdownString();

                if (entry.description) {
                    md.appendMarkdown(`**${word}** — ${entry.description}\n\n`);
                }

                if (entry.signature) {
                    md.appendCodeblock(entry.signature, 'freefem');
                }

                md.appendMarkdown(`[See the documentation](https://doc.freefem.org/references/functions.html#${word})`);

                return new vscode.Hover(md);
            }
        }
    );

    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
    { scheme: 'file', language: 'freefem' },
    {
        provideDocumentSymbols(document) {
            const text = document.getText();
            const symbols: vscode.DocumentSymbol[] = [];

            const patterns: { regex: RegExp, kind: vscode.SymbolKind, label: string }[] = [
                { regex: /\b(mesh|mesh3|meshS|meshL)\s+(\w+)/g, kind: vscode.SymbolKind.Object, label: 'mesh' },
                { regex: /\bfespace\s+(\w+)/g, kind: vscode.SymbolKind.Class, label: 'fespace' },
                { regex: /\b(real|int|complex|bool)\s+(\w+)/g, kind: vscode.SymbolKind.Variable, label: 'variable' },
                { regex: /\bproblem\s+(\w+)/g, kind: vscode.SymbolKind.Function, label: 'problem' },
                { regex: /\bvarf\s+(\w+)/g, kind: vscode.SymbolKind.Function, label: 'varf' },
                { regex: /\bmacro\s+(\w+)/g, kind: vscode.SymbolKind.Module, label: 'macro' },
                { regex: /\bfunc\s+(\w+)/g, kind: vscode.SymbolKind.Function, label: 'func' },
            ];

            for (const { regex, kind, label } of patterns) {
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const name = match[2] ?? match[1];
                    const pos = document.positionAt(match.index);
                    const range = new vscode.Range(pos, pos.translate(0, match[0].length));
                    const symbol = new vscode.DocumentSymbol(name, label, kind, range, range);
                    symbols.push(symbol);
                }
            }

            return symbols;
            }
        }
    );

    context.subscriptions.push(symbolProvider);
    context.subscriptions.push(hoverProvider);
    context.subscriptions.push(completionProvider);
    context.subscriptions.push(signatureProvider);
}

export function deactivate() {}