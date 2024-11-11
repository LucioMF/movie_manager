export function GetOperationMetadata(model: string, operation: string, customTitle?: string, customSummary?: string) {
    const mdl = ToTitleCase(model);
    const op = ToTitleCase(operation);

    // Generate operationId
    const operationId = `${mdl.replace(/\s/g, '')}_${op.replace(/\s/g, '')}`;

    // If a custom title is not provided we use operation and model name to create one
    const title = customTitle || `${mdl} ${op}`;

    // If a custom summary is not provided we use operation and model name to create one
    const summary = customSummary || `${mdl}_${op}`;

    return {
        title,
        operationId,
        summary,
    };
}

function ToTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.replace(word[0], word[0].toUpperCase()))
        .join(' ');
}