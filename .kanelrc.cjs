const { join } = require('path');
const { pascalCase } = require('change-case');
const dotenv = require('dotenv');
const pluralize = require('pluralize');
dotenv.config({ path: './db/.env' });

//console.log({ env: process.env });
const outputPath = './shared/src/models/generated';
module.exports = {
    tsModuleFormat: 'esm',
    connection: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB
    },
    outputPath,
    enumStyle: 'type',
    customTypeMap: {
        'public.citext': 'string'
    },
    preRenderHooks: [
        // hook to fix: /shared/src/models/generated/UserRoleEnum.ts:9:16 - error TS1284: An 'export default' must reference a value when 'verbatimModuleSyntax' is enabled, but 'UserRoleEnum' only refers to a type.
        (files) => {
            // Change all default exports to named exports
            for (const file of Object.values(files)) {
                for (const declaration of file.declarations) {
                    if (declaration.exportAs === 'default') {
                        declaration.exportAs = 'named';
                    }
                }
            }

            return files;
        }
    ],
    postRenderHooks: [
        // add postRenderHooks to fix: ../shared/src/models/generated/UserRole.ts:4:15 - error TS2305: Module '"./UserRoleEnum"' has no exported member 'default'.
        (path, lines) => {
            if (path.endsWith('Enum.ts')) return lines;

            // Replace: import type { default as X } from './XEnum';
            // Only when the module is a .ts file ending with 'Enum'
            lines = lines.map(v => v.replace(
                /import type \{ default as (\w+) \} from '\.\/([^']*Enum\.js)';/g,
                "import type { $1 } from './$2';"
            ));

            return lines;
        },
        // generate table column names constant
        (path, lines) => {
            if (path.endsWith('Enum.ts')) return lines;

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
        let typeName = pascalCase(singularName + suffix);
        if (details.kind === 'enum') {
            typeName += 'Enum';
        }

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