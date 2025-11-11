const { tryParse } = require('tagged-comment-parser')
const { join } = require('path');
const { pascalCase } = require('change-case');
const dotenv = require('dotenv');
const pluralize = require('pluralize');
dotenv.config({ path: './db/.env' });

const outputPath = './shared/src/models/generated';
module.exports = {
    connection: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB
    },
    outputPath,
    enumStyle: 'type',
    // added preRenderHooks to fix: /shared/src/models/generated/UserRoleEnum.ts:9:16 - error TS1284: An 'export default' must reference a value when 'verbatimModuleSyntax' is enabled, but 'UserRoleEnum' only refers to a type.
    preRenderHooks: [
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
    // add postRenderHooks to fix: ../shared/src/models/generated/UserRole.ts:4:15 - error TS2305: Module '"./UserRoleEnum"' has no exported member 'default'.
    postRenderHooks: [
        (path, lines) => {
            // Only process files that import enums (skip enum files themselves)
            if (path.endsWith('Enum.ts')) return lines;

            // Replace: import type { default as X } from './XEnum';
            // Only when the module is a .ts file ending with 'Enum'
            lines = lines.map(v => v.replace(
                /import type \{ default as (\w+) \} from '\.\/([^']*Enum)';/g,
                "import type { $1 } from './$2';"
            ));

            return lines;
        },
    ],
    // postRenderHooks: [
    //     (filename, content) => content.replace(
    //         /import type \{ default as (\w+) \} from '([^']+)';/g,
    //         "import type { $1 } from '$2';"
    //     ),
    // ],
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
    },
};