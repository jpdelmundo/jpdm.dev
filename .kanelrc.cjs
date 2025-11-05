const { tryParse } = require('tagged-comment-parser')
const { join } = require('path');
const { pascalCase } = require('change-case');
const dotenv = require('dotenv');
const pluralize = require('pluralize');
dotenv.config({path: './db/.env'});

const outputPath = './shared/src/models/generated';
module.exports = {
    connection: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB
    },
    outputPath,
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