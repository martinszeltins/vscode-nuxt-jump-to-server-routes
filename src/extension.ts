import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let linkProvider = vscode.languages.registerDocumentLinkProvider(['javascript', 'typescript', 'vue'], new LinkProvider());
    context.subscriptions.push(linkProvider);

    context.subscriptions.push(vscode.commands.registerCommand('nuxt-jump-to-server-routes.openFileDialog', async (filePath: string) => {
        await openQuickOpenWithSelection(filePath);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('nuxt-jump-to-server-routes.openFragmentDialog', async (fragmentName: string) => {
        await openQuickOpenWithSelection(fragmentName);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('nuxt-jump-to-server-routes.openPHPMethod', async (filePath: string) => {
        await openQuickOpenWithSelection(filePath);
    }));
}

class LinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        const documentLinks: vscode.DocumentLink[] = [];
        const endpointRegex = /(?:\$fetch|useApi|useLazyApi|useFetch|useLazyFetch)\(\s*['"`](\/(?:api\/)?[^'"`]+)['"`]/g;
        const fragmentRegex = /['"`](FRAGMENT_[A-Z0-9_]+)['"`]/g;
        const gqlQueryRegex = /query\s+([a-zA-Z0-9_]+)\s*(\([^)]*\))?\s*{/g;
        const gqlMutationRegex = /mutation\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{/g;
        const text = document.getText();
        let match;

        // Match API endpoints
        while ((match = endpointRegex.exec(text)) !== null) {
            const endpoint = match[1];
            const startIndex = match.index + match[0].indexOf(endpoint);
            const endIndex = startIndex + endpoint.length;

            const linkRange = new vscode.Range(
                document.positionAt(startIndex),
                document.positionAt(endIndex)
            );

            const filePath = this.getFilePath(endpoint);
            const documentLink = new vscode.DocumentLink(linkRange, vscode.Uri.parse(`command:nuxt-jump-to-server-routes.openFileDialog?${encodeURIComponent(JSON.stringify(filePath))}`));
            documentLinks.push(documentLink);
        }

        // Match fragments
        while ((match = fragmentRegex.exec(text)) !== null) {
            const fragment = match[1];
            const startIndex = match.index + match[0].indexOf(fragment);
            const endIndex = startIndex + fragment.length;

            const linkRange = new vscode.Range(
                document.positionAt(startIndex),
                document.positionAt(endIndex)
            );

            const documentLink = new vscode.DocumentLink(linkRange, vscode.Uri.parse(`command:nuxt-jump-to-server-routes.openFragmentDialog?${encodeURIComponent(JSON.stringify(fragment))}`));
            documentLinks.push(documentLink);
        }

        // Match GraphQL queries
        while ((match = gqlQueryRegex.exec(text)) !== null) {
            const queryName = match[1];
            const startIndex = match.index + match[0].indexOf(queryName);
            const endIndex = startIndex + queryName.length;

            const linkRange = new vscode.Range(
                document.positionAt(startIndex),
                document.positionAt(endIndex)
            );

            const filePath = this.getPHPFilePath('query', queryName);
            const documentLink = new vscode.DocumentLink(linkRange, vscode.Uri.parse(`command:nuxt-jump-to-server-routes.openPHPMethod?${encodeURIComponent(JSON.stringify(filePath))}`));
            documentLinks.push(documentLink);
        }

        // Match GraphQL mutations
        while ((match = gqlMutationRegex.exec(text)) !== null) {
            const mutationName = match[1];
            const startIndex = match.index + match[0].indexOf(mutationName);
            const endIndex = startIndex + mutationName.length;
        
            const linkRange = new vscode.Range(
                document.positionAt(startIndex),
                document.positionAt(endIndex)
            );
        
            const filePath = this.getPHPFilePath('mutation', mutationName);
            const documentLink = new vscode.DocumentLink(linkRange, vscode.Uri.parse(`command:nuxt-jump-to-server-routes.openPHPMethod?${encodeURIComponent(JSON.stringify(filePath))}`));
            documentLinks.push(documentLink);
        }

        return documentLinks;
    }

    private getFilePath(endpoint: string): string {
        if (endpoint.startsWith('/api/')) {
            return `server${endpoint}`;
        } else {
            return `server/routes${endpoint}`;
        }
    }

    private getPHPFilePath(type: 'query' | 'mutation', name: string): string {
        const baseDir = type === 'query' ? 'server/src/GraphQL/Query/Provider/' : 'server/src/GraphQL/Mutation/Provider/';
        const providerName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').split(' ')[0] + 'Provider.php';
        return `${baseDir}${providerName}`;
    }
}

async function openQuickOpenWithSelection(query: string) {
    /**
     * Accept the first item in the quick open list because that is the file we want to open.
     * We need to wait for a few milliseconds between each command to ensure that the quick open list is populated.
     */
    await vscode.commands.executeCommand('workbench.action.quickOpen', query);
    await new Promise(resolve => setTimeout(resolve, 20));
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    await new Promise(resolve => setTimeout(resolve, 100));
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    await new Promise(resolve => setTimeout(resolve, 200));
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
    await new Promise(resolve => setTimeout(resolve, 200));
    await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
}

export function deactivate() {}
