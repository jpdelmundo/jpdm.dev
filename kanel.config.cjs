const { join } = require('path');
const { pascalCase } = require('change-case');
const dotenv = require('dotenv');
const pluralize = require('pluralize');
const { makeGenerateZodSchemas, defaultGetZodSchemaMetadata, defaultGetZodIdentifierMetadata, defaultZodTypeMap } = require('kanel-zod');
//const { generateZodSchemas } = require('kanel-zod');
dotenv.config({ path: '.env' });

const outputPath = './shared/src/models/generated';

const genZodSchemas = makeGenerateZodSchemas({
    getZodSchemaMetadata: (details, generateFor, config) => {
        const base = defaultGetZodSchemaMetadata(details, generateFor, config);
        const isAgentNoun = ['initializer', 'mutator'].includes(generateFor);
        const singularName = pluralize.singular(details.name);
        const baseName = pascalCase(singularName);
        const suffix = isAgentNoun ? pascalCase(generateFor) : '';
        const name = baseName + suffix + 'Schema';
        return { ...base, name };
    },
    getZodIdentifierMetadata: (column, details, _context) => {
        const singularName = pluralize.singular(details.name);
        const name = pascalCase(singularName) + 'IdSchema';
        return { name };
    },
    zodTypeMap: {
        ...defaultZodTypeMap,
        'public.citext': 'z.string()',
    }
});

module.exports = {
    tsModuleFormat: 'esm',
    connection: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB
    },
    outputPath,
    customTypeMap: {
        'public.citext': 'string'
    },
    preRenderHooks: [
        // Change default exports to named exports
        (files) => {
            for (const file of Object.values(files)) {
                for (const declaration of file.declarations) {
                    if (declaration.exportAs === 'default') {
                        declaration.exportAs = 'named';
                    }
                }
            }
            return files;
        },
        genZodSchemas
    ],
    postRenderHooks: [
        // Strip `as unknown as z.Schema<T>` casts so schemas remain ZodObject and support .extend()
        (_path, lines) => lines.map(line =>
            line.replace(/\) as unknown as z\.Schema<[^>]+>/, ')')
        ),
        // generate table column names constant
        (_path, lines) => {
            //check for "export interface"
            const interfaceMatch = lines.find(l =>
                l.startsWith('export interface ')
            );
            if (!interfaceMatch) return lines;

            // Example: "export interface RefreshToken {"
            const interfaceName = interfaceMatch
                .replace('export interface ', '')
                .replace('{', '')
                .trim();

            // Generate constant name: RefreshTokenColumns
            const constantName = `${interfaceName}Columns`;

            // Extract properties safely
            const columns = [];
            let insideInterface = false;

            for (const line of lines) {
                if (line.startsWith('export interface ')) {
                    insideInterface = true;
                    continue;
                }

                if (insideInterface && line.startsWith('}')) {
                    insideInterface = false;
                    break;
                }

                if (!insideInterface) continue;

                const trimmed = line.trim();

                // Skip comments and empty lines
                if (
                    !trimmed ||
                    trimmed.startsWith('/**') ||
                    trimmed.startsWith('*') ||
                    trimmed.startsWith('//')
                ) {
                    continue;
                }

                // Match: columnName: type;
                const match = trimmed.match(/^(\w+)\??:\s+/);
                if (match) {
                    columns.push(match[1]);
                }
            }

            if (!columns.length) return lines;

            return [
                ...lines,
                '',
                `export const ${constantName} = [`,
                ...columns.map(c => `  "${c}",`),
                `] as const;`,
            ];
        }
    ],
    getMetadata: (details, generateFor) => {
        const isAgentNoun = ['initializer', 'mutator'].includes(generateFor);
        const suffix = isAgentNoun ? `_${generateFor}` : '';
        const singularName = pluralize.singular(details.name);
        const typeName = pascalCase(singularName + suffix);

        return {
            name: typeName,
            comment: [`Represents the ${details.kind} ${details.schemaName}.${details.name}`],
            path: join(outputPath, typeName),
        };
    },
    generateIdentifierType: (column, details) => {
        const singularName = pluralize.singular(details.name);
        const name = pascalCase(`${singularName}Id`);
        const tsType = column.informationSchemaValue.data_type === 'uuid' ? 'string' : 'number';

        return {
            declarationType: 'typeDeclaration',
            name,
            exportAs: 'named',
            typeDefinition: [`${tsType} & { __flavor?: '${name}' }`],
            comment: [`Identifier type for ${details.name}`],
        };
    }
};